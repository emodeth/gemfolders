import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createFolder, getFolders, type Folder } from "../lib/storage"

interface FolderContextType {
  folders: Folder[]
  onCreate: (props: { parentId: string | null; index: number; type: "folder" | "chat"; name?: string }) => Promise<{ id: string } | null>
  loading: boolean
  refreshFolders: () => Promise<void>
}

const FolderContext = createContext<FolderContextType | undefined>(undefined)

export const FolderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)

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

  return <FolderContext.Provider value={{ folders, onCreate, loading, refreshFolders }}>{children}</FolderContext.Provider>
}

export const useFolder = () => {
  const context = useContext(FolderContext)
  if (context === undefined) {
    throw new Error("useFolder must be used within a FolderProvider")
  }
  return context
}
