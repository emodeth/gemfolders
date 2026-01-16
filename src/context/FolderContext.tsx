import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createFolder, deleteFolder, getFolders, type Folder } from "../lib/storage"
import { useModal } from "./ModalContext"

// Context menu state interface
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
  onCreate: (props: { parentId: string | null; index: number; type: "folder" | "chat"; name?: string }) => Promise<{ id: string } | null>
  loading: boolean
  refreshFolders: () => Promise<void>
  // Context menu state and handlers
  contextMenu: ContextMenuState
  openContextMenu: (e: React.MouseEvent, folder: { id: string; name: string; color?: string; childrenCount: number }) => void
  closeContextMenu: () => void
  handleAddSubfolder: () => void
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
      setFolders(updatedFolders)
      return { id: newFolder.id }
    } catch (error) {
      console.error("Failed to create folder/chat:", error)
      return null
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

  const handleAddSubfolder = () => {
    // Leave for now - will be implemented later
    closeContextMenu()
  }

  const handleAddChat = () => {
    const { folderId, folderName } = contextMenu
    onOpen("addChat", {
      folderId,
      folderName,
    })
    closeContextMenu()
  }

  const handleRename = () => {
    const { folderId, folderName } = contextMenu
    onOpen("renameFolderModal", {
      folderId,
      folderName,
    })
    closeContextMenu()
  }

  const handleChangeColor = () => {
    const { folderId, folderName, folderColor } = contextMenu
    onOpen("colorPicker", {
      folderId,
      folderName,
      currentColor: folderColor,
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
          setFolders(updatedFolders)
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
        onCreate,
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
