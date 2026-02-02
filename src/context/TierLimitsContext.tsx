import React, { createContext, useCallback, useContext, useMemo } from "react"

import type { Folder } from "~lib/storage"

import { useAuth } from "./AuthContext"
import { useBookmark } from "./BookmarkContext"
import { useFolder } from "./FolderContext"
import { useModal } from "./ModalContext"
import { useSubscription } from "./SubscriptionContext"

export const FREE_TIER_LIMITS = {
  maxBookmarks: 5,
  maxFolders: 5,
  maxSubfolderDepth: 1
} as const

interface TierLimitsContextType {
  // Counts
  totalFolderCount: number
  bookmarkCount: number
  // Permission checks
  canCreateFolder: () => boolean
  canCreateSubfolder: (parentId: string) => boolean
  canBookmark: () => boolean
  // Paywall trigger
  showPaywall: (reason?: string) => void
  // Helper
  getFolderDepth: (folderId: string) => number
}

const TierLimitsContext = createContext<TierLimitsContextType | undefined>(undefined)

const countAllFolders = (folders: Folder[]): number => {
  let count = 0
  for (const folder of folders) {
    if (folder.type === "folder") {
      count += 1
      if (folder.children && folder.children.length > 0) {
        count += countAllFolders(folder.children)
      }
    }
  }
  return count
}


const calculateFolderDepth = (
  folders: Folder[],
  targetId: string,
  currentDepth = 0
): number => {
  for (const folder of folders) {
    if (folder.id === targetId) {
      return currentDepth
    }
    if (folder.children && folder.children.length > 0) {
      const depth = calculateFolderDepth(folder.children, targetId, currentDepth + 1)
      if (depth !== -1) {
        return depth
      }
    }
  }
  return -1
}

export const TierLimitsProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { session } = useAuth()
  const { isPro } = useSubscription()
  const { folders } = useFolder()
  const { bookmarks } = useBookmark()
  const { onOpen } = useModal()

  const isLoggedIn = !!session?.user

  const totalFolderCount = useMemo(
    () => countAllFolders(folders),
    [folders]
  )

  const bookmarkCount = useMemo(() => bookmarks.length, [bookmarks])

  const getFolderDepth = useCallback(
    (folderId: string): number => {
      return calculateFolderDepth(folders, folderId)
    },
    [folders]
  )

  const showPaywall = useCallback(
    (reason?: string) => {
      onOpen("paywall", { reason })
    },
    [onOpen]
  )

  const canCreateFolder = useCallback((): boolean => {
    if (!isLoggedIn) return false
    if (isPro) return true
    return totalFolderCount < FREE_TIER_LIMITS.maxFolders
  }, [isLoggedIn, isPro, totalFolderCount])

  const canCreateSubfolder = useCallback(
    (parentId: string): boolean => {
      if (!isLoggedIn) return false
      if (isPro) return true
      const parentDepth = getFolderDepth(parentId)
      return parentDepth < FREE_TIER_LIMITS.maxSubfolderDepth
    },
    [isLoggedIn, isPro, getFolderDepth]
  )

  const canBookmark = useCallback((): boolean => {
    if (!isLoggedIn) return false
    if (isPro) return true
    return bookmarkCount < FREE_TIER_LIMITS.maxBookmarks
  }, [isLoggedIn, isPro, bookmarkCount])

  const value = useMemo(
    () => ({
      totalFolderCount,
      bookmarkCount,
      canCreateFolder,
      canCreateSubfolder,
      canBookmark,
      showPaywall,
      getFolderDepth
    }),
    [
      totalFolderCount,
      bookmarkCount,
      canCreateFolder,
      canCreateSubfolder,
      canBookmark,
      showPaywall,
      getFolderDepth
    ]
  )

  return (
    <TierLimitsContext.Provider value={value}>
      {children}
    </TierLimitsContext.Provider>
  )
}

export const useTierLimits = () => {
  const context = useContext(TierLimitsContext)
  if (context === undefined) {
    throw new Error("useTierLimits must be used within a TierLimitsProvider")
  }
  return context
}
