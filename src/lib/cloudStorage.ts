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

// ─── Folders ──────────────────────────────────────────────────────────

export const pullFolders = async (userId: string): Promise<Folder[] | null> => {
  try {
    const { data, error } = await supabase
      .from("user_folders")
      .select("folders_data")
      .eq("user_id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null
      console.error("Error pulling folders from cloud:", error)
      return null
    }

    return (data?.folders_data as Folder[]) ?? []
  } catch (err) {
    console.error("Error pulling folders:", err)
    return null
  }
}

export const pushFolders = async (
  userId: string,
  folders: Folder[]
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("user_folders")
      .upsert(
        { user_id: userId, folders_data: folders },
        { onConflict: "user_id" }
      )

    if (error) {
      console.error("Error pushing folders to cloud:", error)
    }
  } catch (err) {
    console.error("Error pushing folders:", err)
  }
}

// ─── Bookmarks ────────────────────────────────────────────────────────

export const pullBookmarks = async (
  userId: string
): Promise<BookmarkedChat[] | null> => {
  try {
    const { data, error } = await supabase
      .from("user_bookmarks")
      .select("bookmarks_data")
      .eq("user_id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null
      console.error("Error pulling bookmarks from cloud:", error)
      return null
    }

    return (data?.bookmarks_data as BookmarkedChat[]) ?? []
  } catch (err) {
    console.error("Error pulling bookmarks:", err)
    return null
  }
}

export const pushBookmarks = async (
  userId: string,
  bookmarks: BookmarkedChat[]
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("user_bookmarks")
      .upsert(
        { user_id: userId, bookmarks_data: bookmarks },
        { onConflict: "user_id" }
      )

    if (error) {
      console.error("Error pushing bookmarks to cloud:", error)
    }
  } catch (err) {
    console.error("Error pushing bookmarks:", err)
  }
}
