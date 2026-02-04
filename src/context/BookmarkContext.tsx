import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  getBookmarks,
  addBookmark as addBookmarkToStorage,
  removeBookmark as removeBookmarkFromStorage,
  type BookmarkedChat
} from "../lib/storage"
import toast from "react-hot-toast"

interface TierLimitOptions {
  canAdd?: () => boolean
  onLimitReached?: () => void
}

interface BookmarkContextType {
  bookmarks: BookmarkedChat[]
  isLoading: boolean
  addBookmark: (chat: { id: string; title: string; url: string }, options?: TierLimitOptions) => Promise<void>
  removeBookmark: (chatId: string) => Promise<void>
  isBookmarked: (chatId: string) => boolean
  toggleBookmark: (chat: { id: string; title: string; url: string }, options?: TierLimitOptions) => Promise<void>
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined)

export const BookmarkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkedChat[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const savedBookmarks = await getBookmarks()
        setBookmarks(savedBookmarks)
      } catch (error) {
        console.error("Failed to load bookmarks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBookmarks()

    const handleExternalBookmarkChange = async () => {
      try {
        const savedBookmarks = await getBookmarks()
        setBookmarks(savedBookmarks)
      } catch (error) {
        console.error("Failed to refresh bookmarks:", error)
      }
    }

    globalThis.addEventListener("gemfolders-bookmark-changed", handleExternalBookmarkChange)

    return () => {
      globalThis.removeEventListener("gemfolders-bookmark-changed", handleExternalBookmarkChange)
    }
  }, [])

  const addBookmark = async (
    chat: { id: string; title: string; url: string },
    options?: { canAdd?: () => boolean; onLimitReached?: () => void }
  ) => {
    if (options?.canAdd && !options.canAdd()) {
      options.onLimitReached?.()
      return
    }

    try {
      const updatedBookmarks = await addBookmarkToStorage(chat)
      setBookmarks(updatedBookmarks)
      globalThis.dispatchEvent(
        new CustomEvent("gemfolders-bookmark-changed", {
          detail: { bookmarks: updatedBookmarks },
        })
      )
      toast.success("Chat bookmarked")
    } catch (error) {
      console.error("Failed to add bookmark:", error)
      toast.error("Failed to bookmark chat")
    }
  }

  const removeBookmark = async (chatId: string) => {
    try {
      const updatedBookmarks = await removeBookmarkFromStorage(chatId)
      setBookmarks(updatedBookmarks)
      globalThis.dispatchEvent(
        new CustomEvent("gemfolders-bookmark-changed", {
          detail: { bookmarks: updatedBookmarks },
        })
      )
      toast.success("Bookmark removed")
    } catch (error) {
      console.error("Failed to remove bookmark:", error)
      toast.error("Failed to remove bookmark")
    }
  }

  const isBookmarked = (chatId: string): boolean => {
    return bookmarks.some((b) => b.id === chatId)
  }

  const toggleBookmark = async (
    chat: { id: string; title: string; url: string },
    options?: { canAdd?: () => boolean; onLimitReached?: () => void }
  ) => {
    if (isBookmarked(chat.id)) {
      await removeBookmark(chat.id)
    } else {
      await addBookmark(chat, options)
    }
  }

  const value = React.useMemo(
    () => ({
      bookmarks,
      isLoading,
      addBookmark,
      removeBookmark,
      isBookmarked,
      toggleBookmark,
    }),
    [bookmarks, isLoading]
  )

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  )
}

export const useBookmark = () => {
  const context = useContext(BookmarkContext)
  if (context === undefined) {
    throw new Error("useBookmark must be used within a BookmarkProvider")
  }
  return context
}
