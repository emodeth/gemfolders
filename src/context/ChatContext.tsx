import React, { createContext, useContext, useState, type ReactNode } from "react"
import { renameChat, type Folder } from "../lib/storage"
import { useModal } from "./ModalContext"
import { useFolder } from "./FolderContext"

interface ChatContextMenuState {
  isOpen: boolean
  x: number
  y: number
  chatId: string
  chatName: string
}

interface ChatContextType {
  chatContextMenu: ChatContextMenuState
  openChatContextMenu: (e: React.MouseEvent, chat: { id: string; name: string }) => void
  closeChatContextMenu: () => void
  handleChatMoveTo: () => void
  handleChatRename: () => void
  handleChatDelete: () => void
  onRenameChat: (chatId: string, newName: string) => Promise<Folder[]>
}

const initialChatContextMenuState: ChatContextMenuState = {
  isOpen: false,
  x: 0,
  y: 0,
  chatId: "",
  chatName: "",
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chatContextMenu, setChatContextMenu] = useState<ChatContextMenuState>(initialChatContextMenuState)
  const { onOpen } = useModal()
  const { setFolders } = useFolder()

  const openChatContextMenu = (
    e: React.MouseEvent,
    chat: { id: string; name: string }
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setChatContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      chatId: chat.id,
      chatName: chat.name,
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

  const handleChatMoveTo = () => {
    // Not implemented yet
    closeChatContextMenu()
  }

  const handleChatRename = () => {
    const { chatId, chatName } = chatContextMenu
    onOpen("renameChatModal", {
      chatId,
      chatName,
      onRename: onRenameChat,
    })
    closeChatContextMenu()
  }

  const handleChatDelete = () => {
    // Not implemented yet
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
      onRenameChat,
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

