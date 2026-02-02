import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { createFolder, deleteFolder, getFolders, renameFolder, updateFolderColor, addChatsToFolder, moveNodes, type Folder, type ChatToAdd } from "../lib/storage"
import { fetchGeminiChats } from "../lib/geminiChats"
import { useModal } from "./ModalContext"

const FOLDERS_UPDATED_EVENT = "gemfolders-folders-updated"

interface ContextMenuState {
  isOpen: boolean
  x: number
  y: number
  folderId: string
  folderName: string
  folderColor: string
  itemCount: number
}

interface FolderContextType {
  folders: Folder[]
  setFolders: (folders: Folder[]) => void
  onCreate: (props: { parentId: string | null; index: number; type: "folder" | "chat"; name?: string }) => Promise<{ id: string } | null>
  onMove: (props: { dragIds: string[]; parentId: string | null; index: number }) => Promise<void>
  onAddChatsToFolder: (folderId: string, chats: ChatToAdd[]) => Promise<void>
  loading: boolean
  refreshFolders: () => Promise<void>
  // Folder context menu state and handlers
  contextMenu: ContextMenuState
  openContextMenu: (e: React.MouseEvent, folder: { id: string; name: string; color?: string; childrenCount: number }) => void
  closeContextMenu: () => void
  handleAddSubfolder: (buttonRect: DOMRect) => void
  handleAddChat: () => void
  handleRename: () => void
  handleChangeColor: () => void
  handleDelete: () => void
}

const initialContextMenuState: ContextMenuState = {
  isOpen: false,
  x: 0,
  y: 0,
  folderId: "",
  folderName: "",
  folderColor: "#60a5fa",
  itemCount: 0,
}

const FolderContext = createContext<FolderContextType | undefined>(undefined)

export const FolderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(initialContextMenuState)
  const { onOpen } = useModal()

  const instanceIdRef = useRef(`folder-provider-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`)

  const dispatchFoldersUpdate = (updatedFolders: Folder[]) => {
    globalThis.dispatchEvent(new CustomEvent(FOLDERS_UPDATED_EVENT, {
      detail: {
        folders: updatedFolders,
        sourceInstanceId: instanceIdRef.current
      }
    }))
  }

  const updateFoldersAndSync = (updatedFolders: Folder[]) => {
    setFolders(updatedFolders)
    dispatchFoldersUpdate(updatedFolders)
  }

  const refreshFolders = async () => {
    setLoading(true)
    try {
      const data = await getFolders()
      setFolders(data)
    } catch (error) {
      console.error("Failed to fetch folders:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleFoldersUpdate = (event: CustomEvent) => {
      const { folders: updatedFolders, sourceInstanceId } = event.detail
      if (sourceInstanceId !== instanceIdRef.current && updatedFolders) {
        setFolders(updatedFolders)
      }
    }

    globalThis.addEventListener(FOLDERS_UPDATED_EVENT, handleFoldersUpdate as EventListener)

    return () => {
      globalThis.removeEventListener(FOLDERS_UPDATED_EVENT, handleFoldersUpdate as EventListener)
    }
  }, [])

  useEffect(() => {
    refreshFolders()
  }, [])

  const onCreate = async ({
    parentId,
    index,
    type,
    name
  }: {
    parentId: string | null
    index: number
    type: "folder" | "chat"
    name?: string
  }) => {
    try {
      const newName = name || (type === "folder" ? "New Folder" : "New Chat")
      const { folders: updatedFolders, newFolder } = await createFolder(newName, type, parentId, index)
      updateFoldersAndSync(updatedFolders)
      return { id: newFolder.id }
    } catch (error) {
      console.error("Failed to create folder/chat:", error)
      return null
    }
  }

  const onMove = async ({
    dragIds,
    parentId,
    index,
  }: {
    dragIds: string[]
    parentId: string | null
    index: number
  }) => {
    try {
      const updatedFolders = await moveNodes(dragIds, parentId, index)
      updateFoldersAndSync(updatedFolders)
    } catch (error) {
      console.error("Failed to move nodes:", error)
    }
  }

  // Context menu handlers

  const openContextMenu = (
    e: React.MouseEvent,
    folder: { id: string; name: string; color?: string; childrenCount: number }
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      folderId: folder.id,
      folderName: folder.name,
      folderColor: folder.color || "#60a5fa",
      itemCount: folder.childrenCount,
    })
  }

  const closeContextMenu = () => {
    setContextMenu(initialContextMenuState)
  }

  const handleAddSubfolder = (buttonRect: DOMRect) => {
    const { folderId } = contextMenu
    onOpen("addSubfolder", {
      buttonRect,
      parentId: folderId,
    })
  }

  const onAddChatsToFolder = async (folderId: string, chats: ChatToAdd[]) => {
    try {
      const updatedFolders = await addChatsToFolder(folderId, chats)
      updateFoldersAndSync(updatedFolders)
    } catch (error) {
      console.error("Failed to add chats to folder:", error)
    }
  }

  const handleAddChat = async () => {
    const { folderId, folderName } = contextMenu
    closeContextMenu()

    const findFolder = (nodes: Folder[]): Folder | null => {
      for (const node of nodes) {
        if (node.id === folderId) return node
        if (node.children) {
          const found = findFolder(node.children)
          if (found) return found
        }
      }
      return null
    }

    const folder = findFolder(folders)
    const existingChatIds = folder?.children
      .filter((child) => child.type === 'chat')
      .map((child) => child.originalId || child.id) || []

    const chats = await fetchGeminiChats()

    onOpen("addChat", {
      folderId,
      folderName,
      existingChatIds,
      initialChats: chats,
      onAddChatsToFolder,
    })
  }

  const handleRename = () => {
    const { folderId, folderName } = contextMenu
    onOpen("renameFolderModal", {
      folderId,
      folderName,
      onRename: async (id: string, newName: string) => {
        try {
          const updatedFolders = await renameFolder(id, newName)
          updateFoldersAndSync(updatedFolders)
        } catch (error) {
          console.error("Failed to rename folder:", error)
        }
      },
    })
    closeContextMenu()
  }

  const handleChangeColor = () => {
    const { folderId, folderName, folderColor, itemCount } = contextMenu
    onOpen("colorPicker", {
      folderId,
      folderName,
      currentColor: folderColor,
      itemCount,
      onChangeColor: async (id: string, newColor: string) => {
        try {
          const updatedFolders = await updateFolderColor(id, newColor)
          updateFoldersAndSync(updatedFolders)
        } catch (error) {
          console.error("Failed to change folder color:", error)
        }
      },
    })
    closeContextMenu()
  }

  const handleDelete = () => {
    const { folderId, folderName, itemCount } = contextMenu
    onOpen("deleteFolder", {
      folderId,
      folderName,
      itemCount,
      onDelete: async () => {
        try {
          const updatedFolders = await deleteFolder(folderId)
          updateFoldersAndSync(updatedFolders)
        } catch (error) {
          console.error("Failed to delete folder:", error)
        }
      },
    })
    closeContextMenu()
  }

  return (
    <FolderContext.Provider
      value={{
        folders,
        setFolders: updateFoldersAndSync,
        onCreate,
        onMove,
        onAddChatsToFolder,
        loading,
        refreshFolders,
        contextMenu,
        openContextMenu,
        closeContextMenu,
        handleAddSubfolder,
        handleAddChat,
        handleRename,
        handleChangeColor,
        handleDelete,
      }}
    >
      {children}
    </FolderContext.Provider>
  )
}

export const useFolder = () => {
  const context = useContext(FolderContext)
  if (context === undefined) {
    throw new Error("useFolder must be used within a FolderProvider")
  }
  return context
}

