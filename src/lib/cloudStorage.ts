import type { BookmarkedChat, Folder } from "./storage"
import { supabase } from "./supabase"

export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const {
      data: { session }
    } = await supabase.auth.getSession()
    return session?.user?.id ?? null
  } catch {
    return null
  }
}

type SyncKind = "folders" | "bookmarks"

const PULL_TTL = 10 * 60 * 1000
const PUSH_DEBOUNCE = 1500
const LAST_PULL_KEY = "gemfolders-cloud-last-pull"

const lastSynced: Partial<Record<SyncKind, { userId: string; json: string }>> =
  {}
const inFlightPulls = new Map<string, Promise<unknown>>()
const pendingPushes = new Map<
  SyncKind,
  { userId: string; data: unknown; timer: ReturnType<typeof setTimeout> }
>()

const rememberSynced = (kind: SyncKind, userId: string, data: unknown) => {
  lastSynced[kind] = { userId, json: JSON.stringify(data) }
}

const isAlreadySynced = (kind: SyncKind, userId: string, data: unknown) => {
  const synced = lastSynced[kind]
  return synced?.userId === userId && synced.json === JSON.stringify(data)
}

const getLastPulls = async (): Promise<Record<string, number>> =>
  new Promise((resolve) => {
    chrome.storage.local.get([LAST_PULL_KEY], (result) => {
      resolve(result[LAST_PULL_KEY] || {})
    })
  })

const markPulled = async (kind: SyncKind, userId: string) => {
  const lastPulls = await getLastPulls()
  lastPulls[`${kind}:${userId}`] = Date.now()
  await new Promise<void>((resolve) => {
    chrome.storage.local.set({ [LAST_PULL_KEY]: lastPulls }, () => resolve())
  })
}

/** False when this device pulled recently, so local data can be trusted. */
export const shouldPullFromCloud = async (
  kind: SyncKind,
  userId: string
): Promise<boolean> => {
  if (inFlightPulls.has(`${kind}:${userId}`)) return true
  const lastPulls = await getLastPulls()
  const lastPull = lastPulls[`${kind}:${userId}`]
  return !lastPull || Date.now() - lastPull > PULL_TTL
}

const pullJson = <T>(
  kind: SyncKind,
  table: string,
  column: string,
  userId: string
): Promise<T | null> => {
  const key = `${kind}:${userId}`
  const existing = inFlightPulls.get(key)
  if (existing) return existing as Promise<T | null>

  const pull = (async () => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select(column)
        .eq("user_id", userId)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          await markPulled(kind, userId)
          return null
        }
        console.error(`Error pulling ${kind} from cloud:`, error)
        return null
      }

      const value =
        ((data as unknown as Record<string, unknown>)?.[column] as T) ??
        ([] as T)
      rememberSynced(kind, userId, value)
      await markPulled(kind, userId)
      return value
    } catch (err) {
      console.error(`Error pulling ${kind}:`, err)
      return null
    } finally {
      inFlightPulls.delete(key)
    }
  })()

  inFlightPulls.set(key, pull)
  return pull
}

const flushPush = async (kind: SyncKind) => {
  const pending = pendingPushes.get(kind)
  if (!pending) return
  clearTimeout(pending.timer)
  pendingPushes.delete(kind)

  const { userId, data } = pending
  if (isAlreadySynced(kind, userId, data)) return

  const table = kind === "folders" ? "user_folders" : "user_bookmarks"
  const column = kind === "folders" ? "folders_data" : "bookmarks_data"

  try {
    const { error } = await supabase
      .from(table)
      .upsert({ user_id: userId, [column]: data }, { onConflict: "user_id" })

    if (error) {
      console.error(`Error pushing ${kind} to cloud:`, error)
      return
    }
    rememberSynced(kind, userId, data)
  } catch (err) {
    console.error(`Error pushing ${kind}:`, err)
  }
}

const schedulePush = (kind: SyncKind, userId: string, data: unknown) => {
  const pending = pendingPushes.get(kind)
  if (pending) {
    clearTimeout(pending.timer)
    // A different user signed in before the debounce fired; send the old
    // user's data right away instead of dropping it.
    if (pending.userId !== userId) void flushPush(kind)
  }

  pendingPushes.set(kind, {
    userId,
    data,
    timer: setTimeout(() => void flushPush(kind), PUSH_DEBOUNCE)
  })
}

const flushAllPushes = () => {
  void flushPush("folders")
  void flushPush("bookmarks")
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushAllPushes()
  })
  globalThis.addEventListener("pagehide", flushAllPushes)
}

// ─── Folders ──────────────────────────────────────────────────────────

export const pullFolders = (userId: string): Promise<Folder[] | null> =>
  pullJson<Folder[]>("folders", "user_folders", "folders_data", userId)

export const pushFolders = async (
  userId: string,
  folders: Folder[]
): Promise<void> => {
  schedulePush("folders", userId, folders)
}

// ─── Bookmarks ────────────────────────────────────────────────────────

export const pullBookmarks = (
  userId: string
): Promise<BookmarkedChat[] | null> =>
  pullJson<BookmarkedChat[]>(
    "bookmarks",
    "user_bookmarks",
    "bookmarks_data",
    userId
  )

export const pushBookmarks = async (
  userId: string,
  bookmarks: BookmarkedChat[]
): Promise<void> => {
  schedulePush("bookmarks", userId, bookmarks)
}
