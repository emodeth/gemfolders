import React, { createContext, useContext, useState, type ReactNode } from "react"
import { renameChat, deleteChat, deleteChatFromFolder, moveChat, type Folder } from "../lib/storage"
import { useModal } from "./ModalContext"
import { useFolder } from "./FolderContext"
import { useBookmark } from "./BookmarkContext"

interface ChatContextMenuState {
  isOpen: boolean
  x: number
  y: number
  chatId: string
  chatName: string
  chatUrl: string
  folderId: string | null
  originalId?: string
}

interface ChatContextType {
  chatContextMenu: ChatContextMenuState
  openChatContextMenu: (e: React.MouseEvent, chat: { id: string; name: string; url?: string; folderId?: string | null; originalId?: string }) => void
  closeChatContextMenu: () => void
  handleChatMoveTo: () => void
  handleChatRename: () => void
  handleChatDelete: () => void
  handleChatBookmark: () => void
  onRenameChat: (chatId: string, newName: string) => Promise<Folder[]>
  onDeleteChat: (chatId: string) => Promise<Folder[]>
  onDeleteChatFromFolder: (folderId: string | null, chatId: string) => Promise<Folder[]>
}

const initialChatContextMenuState: ChatContextMenuState = {
  isOpen: false,
  x: 0,
  y: 0,
  chatId: "",
  chatName: "",
  chatUrl: "",
  folderId: null,
  originalId: undefined,
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chatContextMenu, setChatContextMenu] = useState<ChatContextMenuState>(initialChatContextMenuState)
  const { onOpen } = useModal()
  const { setFolders, folders } = useFolder()
  const { toggleBookmark } = useBookmark()

  const openChatContextMenu = (
    e: React.MouseEvent,
    chat: { id: string; name: string; url?: string; folderId?: string | null; originalId?: string }
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setChatContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      chatId: chat.id,
      chatName: chat.name,
      chatUrl: chat.url || "",
      folderId: chat.folderId || null,
      originalId: chat.originalId,
    })
  }

  const closeChatContextMenu = () => {
    setChatContextMenu(initialChatContextMenuState)
  }

  const onRenameChat = async (chatId: string, newName: string): Promise<Folder[]> => {
    const updatedFolders = await renameChat(chatId, newName)
    setFolders(updatedFolders)
    return updatedFolders
  }

  const onDeleteChat = async (chatId: string): Promise<Folder[]> => {
    const updatedFolders = await deleteChat(chatId)
    setFolders(updatedFolders)
    return updatedFolders
  }

  const onDeleteChatFromFolder = async (folderId: string | null, chatId: string): Promise<Folder[]> => {
    const updatedFolders = await deleteChatFromFolder(folderId, chatId)
    setFolders(updatedFolders)
    return updatedFolders
  }

  const handleChatMoveTo = () => {
    const { chatId, chatName } = chatContextMenu

    const findCurrentFolderId = (nodes: Folder[], targetChatId: string): string | null => {
      for (const node of nodes) {
        if (node.type === "folder" && node.children) {
          const hasChat = node.children.some(
            (child) => child.id === targetChatId && child.type === "chat"
          )
          if (hasChat) return node.id
          const found = findCurrentFolderId(node.children, targetChatId)
          if (found) return found
        }
      }
      return null
    }

    const currentFolderId = findCurrentFolderId(folders, chatId)

    onOpen("moveChatModal", {
      chatId,
      chatName,
      currentFolderId,
      onMove: async (id: string, targetFolderId: string) => {
        try {
          const updatedFolders = await moveChat(id, targetFolderId)
          setFolders(updatedFolders)
        } catch (error) {
          console.error("Failed to move chat:", error)
        }
      },
    })
    closeChatContextMenu()
  }

  const handleChatRename = () => {
    const { chatId, chatName, originalId } = chatContextMenu
    onOpen("renameChatModal", {
      chatId: originalId || chatId,
      chatName,
      onRename: onRenameChat,
    })
    closeChatContextMenu()
  }

  const handleChatDelete = () => {
    const { chatId, chatName } = chatContextMenu
    onOpen("deleteChatModal", {
      chatId,
      chatName,
      onDelete: async () => {
        await onDeleteChatFromFolder(chatContextMenu.folderId, chatId)
      },
    })
    closeChatContextMenu()
  }

  const handleChatBookmark = () => {
    const { chatId, chatName, chatUrl, originalId } = chatContextMenu
    toggleBookmark({
      id: originalId || chatId,
      title: chatName,
      url: chatUrl,
    })
    closeChatContextMenu()
  }

  const value = React.useMemo(
    () => ({
      chatContextMenu,
      openChatContextMenu,
      closeChatContextMenu,
      handleChatMoveTo,
      handleChatRename,
      handleChatDelete,
      handleChatBookmark,
      onRenameChat,
      onDeleteChat,
      onDeleteChatFromFolder,
    }),
    [chatContextMenu]
  )

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}

