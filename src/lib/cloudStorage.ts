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

// ─── Sync bookkeeping ─────────────────────────────────────────────────
//
// To keep Supabase egress and request volume low:
// - each page pulls at most once per kind, shared by every provider,
// - a pull first fetches only `updated_at` and downloads the full blob only
//   when the cloud copy changed since this device last synced,
// - pushes run one at a time and are skipped when the data matches what was
//   last synced.

type SyncKind = "folders" | "bookmarks"

export type PullResult<T> =
  | { status: "data"; data: T }
  | { status: "missing" }
  // Cloud unchanged since this device last synced; `dirty` means local has
  // edits that never reached the cloud and should be pushed.
  | { status: "unchanged"; dirty: boolean }
  | { status: "error" }

interface SyncMeta {
  updatedAt: string | null
  dirty: boolean
}

const TABLES: Record<SyncKind, { table: string; column: string }> = {
  folders: { table: "user_folders", column: "folders_data" },
  bookmarks: { table: "user_bookmarks", column: "bookmarks_data" }
}

const metaKey = (kind: SyncKind, userId: string) =>
  `gemfolders-cloud-sync:${kind}:${userId}`

const getMeta = async (kind: SyncKind, userId: string): Promise<SyncMeta> =>
  new Promise((resolve) => {
    const key = metaKey(kind, userId)
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] || { updatedAt: null, dirty: false })
    })
  })

const updateMeta = async (
  kind: SyncKind,
  userId: string,
  patch: Partial<SyncMeta>
) => {
  const meta = await getMeta(kind, userId)
  await new Promise<void>((resolve) => {
    chrome.storage.local.set(
      { [metaKey(kind, userId)]: { ...meta, ...patch } },
      () => resolve()
    )
  })
}

// Local folders/bookmarks are stored under one key regardless of account, so
// remember whose data it is before trusting it over the cloud.
const ownerKey = (kind: SyncKind) => `gemfolders-cloud-sync-owner:${kind}`

const getLocalOwner = async (kind: SyncKind): Promise<string | null> =>
  new Promise((resolve) => {
    chrome.storage.local.get([ownerKey(kind)], (result) => {
      resolve(result[ownerKey(kind)] ?? null)
    })
  })

const setLocalOwner = async (kind: SyncKind, userId: string | null) =>
  new Promise<void>((resolve) => {
    chrome.storage.local.set({ [ownerKey(kind)]: userId }, () => resolve())
  })

/** Local data was edited while signed out; next sign-in must do a full pull. */
export const markLocalUnowned = (kind: SyncKind) => setLocalOwner(kind, null)

const lastSynced: Partial<Record<SyncKind, { userId: string; json: string }>> =
  {}

const rememberSynced = (kind: SyncKind, userId: string, data: unknown) => {
  lastSynced[kind] = { userId, json: JSON.stringify(data) }
}

const isAlreadySynced = (kind: SyncKind, userId: string, data: unknown) => {
  const synced = lastSynced[kind]
  return synced?.userId === userId && synced.json === JSON.stringify(data)
}

// ─── Pull ─────────────────────────────────────────────────────────────

const inFlightPulls = new Map<string, Promise<PullResult<unknown>>>()
const completedPulls = new Set<string>()

/**
 * False once this page has pulled; later mounts (e.g. the sidebar widget
 * remounting) should trust local data, which pushes keep current.
 */
export const shouldPullFromCloud = (kind: SyncKind, userId: string) =>
  !completedPulls.has(`${kind}:${userId}`)

const fetchUpdatedAt = async (
  kind: SyncKind,
  userId: string
): Promise<string | null | undefined> => {
  const { table } = TABLES[kind]
  const { data, error } = await supabase
    .from(table)
    .select("updated_at")
    .eq("user_id", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error(`Error checking ${kind} in cloud:`, error)
    return undefined
  }
  return data.updated_at as string
}

const pullFull = async <T>(
  kind: SyncKind,
  userId: string
): Promise<PullResult<T>> => {
  const { table, column } = TABLES[kind]
  const { data, error } = await supabase
    .from(table)
    .select(`${column}, updated_at`)
    .eq("user_id", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return { status: "missing" }
    console.error(`Error pulling ${kind} from cloud:`, error)
    return { status: "error" }
  }

  const row = data as unknown as Record<string, unknown>
  const value = (row[column] as T) ?? ([] as T)
  rememberSynced(kind, userId, value)
  await updateMeta(kind, userId, {
    updatedAt: row.updated_at as string,
    dirty: false
  })
  await setLocalOwner(kind, userId)
  return { status: "data", data: value }
}

const pull = <T>(kind: SyncKind, userId: string): Promise<PullResult<T>> => {
  const key = `${kind}:${userId}`
  const existing = inFlightPulls.get(key)
  if (existing) return existing as Promise<PullResult<T>>

  const promise = (async (): Promise<PullResult<T>> => {
    try {
      const [meta, localOwner] = await Promise.all([
        getMeta(kind, userId),
        getLocalOwner(kind)
      ])

      // Only worth a cheap timestamp check if we know what we last synced and
      // local data belongs to this user.
      if (meta.updatedAt && localOwner === userId) {
        const cloudUpdatedAt = await fetchUpdatedAt(kind, userId)
        if (cloudUpdatedAt === null) return { status: "missing" }
        if (cloudUpdatedAt === meta.updatedAt) {
          return { status: "unchanged", dirty: meta.dirty }
        }
        // Changed, or the check failed: fall through to a full pull.
      }

      return await pullFull<T>(kind, userId)
    } catch (err) {
      console.error(`Error pulling ${kind}:`, err)
      return { status: "error" }
    }
  })()

  inFlightPulls.set(key, promise)
  promise.then((result) => {
    inFlightPulls.delete(key)
    if (result.status !== "error") completedPulls.add(key)
  })
  return promise
}

// ─── Push ─────────────────────────────────────────────────────────────

// One push in flight per kind; while it runs, only the newest data is kept so
// a slow older request can never land after a newer one.
const pushQueues: Record<
  SyncKind,
  {
    running: Promise<void> | null
    next: { userId: string; data: unknown } | null
  }
> = {
  folders: { running: null, next: null },
  bookmarks: { running: null, next: null }
}

const pushNow = async (kind: SyncKind, userId: string, data: unknown) => {
  if (isAlreadySynced(kind, userId, data)) return

  const { table, column } = TABLES[kind]
  try {
    await updateMeta(kind, userId, { dirty: true })

    const { data: row, error } = await supabase
      .from(table)
      .upsert({ user_id: userId, [column]: data }, { onConflict: "user_id" })
      .select("updated_at")
      .single()

    if (error) {
      console.error(`Error pushing ${kind} to cloud:`, error)
      return
    }

    rememberSynced(kind, userId, data)
    await updateMeta(kind, userId, {
      updatedAt: row.updated_at as string,
      dirty: false
    })
    await setLocalOwner(kind, userId)
  } catch (err) {
    console.error(`Error pushing ${kind}:`, err)
  }
}

const push = (kind: SyncKind, userId: string, data: unknown) => {
  const queue = pushQueues[kind]
  queue.next = { userId, data }

  if (!queue.running) {
    queue.running = (async () => {
      while (queue.next) {
        const job = queue.next
        queue.next = null
        await pushNow(kind, job.userId, job.data)
      }
      queue.running = null
    })()
  }
  return queue.running
}

// ─── Folders ──────────────────────────────────────────────────────────

export const pullFolders = (userId: string) => pull<Folder[]>("folders", userId)

export const pushFolders = (userId: string, folders: Folder[]): Promise<void> =>
  push("folders", userId, folders)

// ─── Bookmarks ────────────────────────────────────────────────────────

export const pullBookmarks = (userId: string) =>
  pull<BookmarkedChat[]>("bookmarks", userId)

export const pushBookmarks = (
  userId: string,
  bookmarks: BookmarkedChat[]
): Promise<void> => push("bookmarks", userId, bookmarks)
