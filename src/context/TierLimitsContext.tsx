import React, { createContext, useCallback, useContext, useMemo } from "react"

import type { Folder } from "~lib/storage"

import { useAuth } from "./AuthContext"
import { useBookmark } from "./BookmarkContext"
import { useFolder } from "./FolderContext"
import { useModal } from "./ModalContext"
import { useSubscription } from "./SubscriptionContext"

export const NOT_LOGGED_IN_LIMITS = {
  maxBookmarks: 5,
  maxFolders: 5,
  maxSubfolderDepth: 1
} as const

export const FREE_TIER_LIMITS = {
  maxBookmarks: 10,
  maxFolders: 10,
  maxSubfolderDepth: 2
} as const

interface TierLimitsContextType {
  // Counts
  totalFolderCount: number
  bookmarkCount: number
  // State
  isLoggedIn: boolean
  // Permission checks
  canCreateFolder: () => boolean
  canCreateSubfolder: (parentId: string) => boolean
  canBookmark: () => boolean
  // Paywall triggers
  showPaywall: (reason?: string) => void
  showSignInPaywall: (reason?: string) => void
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

  // Select the correct limits based on login state
  const currentLimits = isLoggedIn ? FREE_TIER_LIMITS : NOT_LOGGED_IN_LIMITS

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

  const showSignInPaywall = useCallback(
    (reason?: string) => {
      onOpen("signInPaywall", { reason })
    },
    [onOpen]
  )

  const canCreateFolder = useCallback((): boolean => {
    if (isPro) return true
    return totalFolderCount < currentLimits.maxFolders
  }, [isPro, totalFolderCount, currentLimits])

  const canCreateSubfolder = useCallback(
    (parentId: string): boolean => {
      if (isPro) return true
      const parentDepth = getFolderDepth(parentId)
      return parentDepth < currentLimits.maxSubfolderDepth
    },
    [isPro, getFolderDepth, currentLimits]
  )

  const canBookmark = useCallback((): boolean => {
    if (isPro) return true
    return bookmarkCount < currentLimits.maxBookmarks
  }, [isPro, bookmarkCount, currentLimits])

  const value = useMemo(
    () => ({
      totalFolderCount,
      bookmarkCount,
      isLoggedIn,
      canCreateFolder,
      canCreateSubfolder,
      canBookmark,
      showPaywall,
      showSignInPaywall,
      getFolderDepth
    }),
    [
      totalFolderCount,
      bookmarkCount,
      isLoggedIn,
      canCreateFolder,
      canCreateSubfolder,
      canBookmark,
      showPaywall,
      showSignInPaywall,
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
