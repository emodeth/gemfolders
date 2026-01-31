import { v4 as uuidv4 } from "uuid"

import { getRandomColor } from "../constants/colors"

export interface Folder {
  id: string
  name: string
  type: "folder" | "chat"
  children: Folder[]
  color?: string
  chatUrl?: string
  originalId?: string
}

const STORAGE_KEY = "gemfolders-folders"

export const getFolders = async (): Promise<Folder[]> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      resolve(result[STORAGE_KEY] || [])
    })
  })
}

export const saveFolders = async (folders: Folder[]): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: folders }, () => {
      resolve()
    })
  })
}

export const createFolder = async (
  name: string,
  type: "folder" | "chat",
  parentId: string | null,
  index?: number
): Promise<{ folders: Folder[]; newFolder: Folder }> => {
  const folders = await getFolders()
  const newId = uuidv4()
  const newNode: Folder = {
    id: newId,
    name,
    type,
    children: [],
    color: type === "folder" ? getRandomColor() : undefined
  }

  if (parentId) {
    const addToParent = (nodes: Folder[]): boolean => {
      for (const node of nodes) {
        if (node.id === parentId) {
          if (!node.children) node.children = []
          if (typeof index === "number" && index >= 0) {
            node.children.splice(index, 0, newNode)
          } else {
            node.children.push(newNode)
          }
          return true
        }
        if (node.children && addToParent(node.children)) return true
      }
      return false
    }
    addToParent(folders)
  } else if (typeof index === "number" && index >= 0) {
    folders.splice(index, 0, newNode)
  } else {
    folders.push(newNode)
  }

  await saveFolders(folders)
  return { folders, newFolder: newNode }
}

export const updateFolderColor = async (
  folderId: string,
  color: string
): Promise<Folder[]> => {
  const folders = await getFolders()

  const updateColor = (nodes: Folder[]): boolean => {
    for (const node of nodes) {
      if (node.id === folderId) {
        node.color = color
        return true
      }
      if (node.children && updateColor(node.children)) return true
    }
    return false
  }

  updateColor(folders)
  await saveFolders(folders)
  return folders
}

export const deleteFolder = async (folderId: string): Promise<Folder[]> => {
  const folders = await getFolders()

  const removeFromTree = (nodes: Folder[]): Folder[] => {
    return nodes.filter((node) => {
      if (node.id === folderId) {
        return false
      }

      if (node.children && node.children.length > 0) {
        node.children = removeFromTree(node.children)
      }
      return true
    })
  }

  const updatedFolders = removeFromTree(folders)
  await saveFolders(updatedFolders)
  return updatedFolders
}

export const renameFolder = async (
  folderId: string,
  newName: string
): Promise<Folder[]> => {
  const folders = await getFolders()

  const updateName = (nodes: Folder[]): boolean => {
    for (const node of nodes) {
      if (node.id === folderId) {
        node.name = newName
        return true
      }
      if (node.children && updateName(node.children)) return true
    }
    return false
  }

  updateName(folders)
  await saveFolders(folders)
  return folders
}

export interface ChatToAdd {
  id: string
  title: string
  url: string
}

export const addChatsToFolder = async (
  folderId: string,
  chats: ChatToAdd[]
): Promise<Folder[]> => {
  const folders = await getFolders()

  const addChats = (nodes: Folder[]): boolean => {
    for (const node of nodes) {
      if (node.id === folderId && node.type === "folder") {
        const existingChatIds = new Set(
          node.children.map((child) => child.originalId || child.id)
        )

        const chatNodes: Folder[] = chats
          .filter((chat) => !existingChatIds.has(chat.id))
          .map((chat) => ({
            id: uuidv4(),
            name: chat.title,
            type: "chat" as const,
            children: [],
            chatUrl: chat.url,
            originalId: chat.id
          }))

        node.children.push(...chatNodes)
        return true
      }
      if (node.children && addChats(node.children)) return true
    }
    return false
  }

  addChats(folders)
  await saveFolders(folders)
  return folders
}

export const renameChat = async (
  chatId: string,
  newName: string
): Promise<Folder[]> => {
  const folders = await getFolders()

  const updateName = (nodes: Folder[]): boolean => {
    for (const node of nodes) {
      if (
        (node.id === chatId || node.originalId === chatId) &&
        node.type === "chat"
      ) {
        node.name = newName
      }
      if (node.children) updateName(node.children)
    }
    return true
  }

  updateName(folders)
  await saveFolders(folders)
  return folders
}

export const deleteChat = async (chatId: string): Promise<Folder[]> => {
  const folders = await getFolders()

  const removeChat = (nodes: Folder[]): Folder[] => {
    return nodes.filter((node) => {
      if (
        (node.id === chatId || node.originalId === chatId) &&
        node.type === "chat"
      ) {
        return false
      }
      if (node.children && node.children.length > 0) {
        node.children = removeChat(node.children)
      }
      return true
    })
  }

  const updatedFolders = removeChat(folders)
  await saveFolders(updatedFolders)
  return updatedFolders
}

export const deleteChatFromFolder = async (
  folderId: string | null,
  chatId: string
): Promise<Folder[]> => {
  let folders = await getFolders()

  if (!folderId || folderId === "ROOT") {
    folders = folders.filter((node) => node.id !== chatId)
  } else {
    const removeFromFolder = (nodes: Folder[]): boolean => {
      for (const node of nodes) {
        if (node.id === folderId) {
          if (node.children) {
            node.children = node.children.filter((child) => child.id !== chatId)
          }
          return true
        }
        if (node.children && removeFromFolder(node.children)) return true
      }
      return false
    }
    removeFromFolder(folders)
  }

  await saveFolders(folders)
  return folders
}

export const moveChat = async (
  chatId: string,
  targetFolderId: string
): Promise<Folder[]> => {
  const folders = await getFolders()

  let extractedChat: Folder | null = null

  const extractChat = (nodes: Folder[]): Folder[] => {
    return nodes.map((node) => {
      if (node.type === "folder" && node.children) {
        const chatIndex = node.children.findIndex(
          (child) => child.id === chatId && child.type === "chat"
        )
        if (chatIndex !== -1) {
          extractedChat = node.children[chatIndex]
          return {
            ...node,
            children: node.children.filter((_, idx) => idx !== chatIndex)
          }
        }
        return {
          ...node,
          children: extractChat(node.children)
        }
      }
      return node
    })
  }

  const insertChat = (nodes: Folder[], chat: Folder): Folder[] => {
    return nodes.map((node) => {
      if (node.id === targetFolderId && node.type === "folder") {
        if (chat.type === "chat") {
          const chatRealId = chat.originalId || chat.id
          const exists = node.children?.some(
            (child) =>
              child.type === "chat" &&
              (child.originalId || child.id) === chatRealId
          )
          if (exists) return node
        }

        return {
          ...node,
          children: [...(node.children || []), chat]
        }
      }
      if (node.type === "folder" && node.children) {
        return {
          ...node,
          children: insertChat(node.children, chat)
        }
      }
      return node
    })
  }

  let updatedFolders = extractChat(folders)

  if (extractedChat) {
    updatedFolders = insertChat(updatedFolders, extractedChat)
  }

  await saveFolders(updatedFolders)
  return updatedFolders
}

export const moveNodes = async (
  dragIds: string[],
  parentId: string | null,
  index: number
): Promise<Folder[]> => {
  const folders = await getFolders()

  const extractNodes = (
    nodes: Folder[],
    idsToExtract: Set<string>
  ): { remaining: Folder[]; extracted: Folder[] } => {
    const extracted: Folder[] = []
    const remaining: Folder[] = []

    for (const node of nodes) {
      if (idsToExtract.has(node.id)) {
        extracted.push(node)
      } else {
        const updatedNode = { ...node }
        if (node.children && node.children.length > 0) {
          const result = extractNodes(node.children, idsToExtract)
          updatedNode.children = result.remaining
          extracted.push(...result.extracted)
        }
        remaining.push(updatedNode)
      }
    }

    return { remaining, extracted }
  }

  const insertNodes = (
    nodes: Folder[],
    nodesToInsert: Folder[],
    targetParentId: string | null,
    targetIndex: number
  ): Folder[] => {
    if (targetParentId === null) {
      const result = [...nodes]
      result.splice(targetIndex, 0, ...nodesToInsert)
      return result
    }

    return nodes.map((node) => {
      if (node.id === targetParentId) {
        const distinctNodesToInsert = nodesToInsert.filter((toInsert) => {
          if (toInsert.type !== "chat") return true
          const insertRealId = toInsert.originalId || toInsert.id
          return !node.children?.some(
            (child) =>
              child.type === "chat" &&
              (child.originalId || child.id) === insertRealId
          )
        })

        const updatedChildren = [...(node.children || [])]
        updatedChildren.splice(targetIndex, 0, ...distinctNodesToInsert)
        return { ...node, children: updatedChildren }
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: insertNodes(
            node.children,
            nodesToInsert,
            targetParentId,
            targetIndex
          )
        }
      }
      return node
    })
  }

  const idsToMove = new Set(dragIds)
  const { remaining, extracted } = extractNodes(folders, idsToMove)

  const updatedFolders = insertNodes(remaining, extracted, parentId, index)

  await saveFolders(updatedFolders)
  return updatedFolders
}

export interface BookmarkedChat {
  id: string
  title: string
  url: string
  bookmarkedAt: number
}

const BOOKMARKS_STORAGE_KEY = "gemfolders-bookmarks"

export const getBookmarks = async (): Promise<BookmarkedChat[]> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([BOOKMARKS_STORAGE_KEY], (result) => {
      resolve(result[BOOKMARKS_STORAGE_KEY] || [])
    })
  })
}

export const saveBookmarks = async (
  bookmarks: BookmarkedChat[]
): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [BOOKMARKS_STORAGE_KEY]: bookmarks }, () => {
      resolve()
    })
  })
}

export const addBookmark = async (chat: {
  id: string
  title: string
  url: string
}): Promise<BookmarkedChat[]> => {
  const bookmarks = await getBookmarks()

  if (bookmarks.some((b) => b.id === chat.id)) {
    return bookmarks
  }

  const newBookmark: BookmarkedChat = {
    id: chat.id,
    title: chat.title,
    url: chat.url,
    bookmarkedAt: Date.now()
  }

  const updatedBookmarks = [newBookmark, ...bookmarks]
  await saveBookmarks(updatedBookmarks)
  return updatedBookmarks
}

export const removeBookmark = async (
  chatId: string
): Promise<BookmarkedChat[]> => {
  const bookmarks = await getBookmarks()
  const updatedBookmarks = bookmarks.filter((b) => b.id !== chatId)
  await saveBookmarks(updatedBookmarks)
  return updatedBookmarks
}

export const isBookmarked = async (chatId: string): Promise<boolean> => {
  const bookmarks = await getBookmarks()
  return bookmarks.some((b) => b.id === chatId)
}

export const updateBookmarkTitle = async (
  chatId: string,
  newTitle: string
): Promise<BookmarkedChat[]> => {
  const bookmarks = await getBookmarks()
  const updatedBookmarks = bookmarks.map((b) =>
    b.id === chatId ? { ...b, title: newTitle } : b
  )
  await saveBookmarks(updatedBookmarks)
  return updatedBookmarks
}
