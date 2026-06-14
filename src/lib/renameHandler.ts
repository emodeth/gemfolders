import {
  extractChatId,
  findConversationTitleElement,
  getSidebarScrollContainer
} from "./geminiDom"
import { getCachedChats, saveCachedChats } from "./geminiChats"
import { renameChat, updateBookmarkTitle } from "./storage"

const extractChatIdFromTitleElement = (element: Element | null): string | null => {
  if (!element) return null
  const titleElement = findConversationTitleElement(element)
  if (!titleElement) return null
  return extractChatId(titleElement)
}

const SYNC_COOLDOWN = 2000
const recentlySynced = new Set<string>()

const handleRename = async (chatId: string, newTitle: string) => {
  if (recentlySynced.has(chatId)) return

  try {
    recentlySynced.add(chatId)
    setTimeout(() => recentlySynced.delete(chatId), SYNC_COOLDOWN)

    const updatedFolders = await renameChat(chatId, newTitle)

    await updateBookmarkTitle(chatId, newTitle)

    const cached = await getCachedChats()
    const updatedCache = cached.map((c) =>
      c.id === chatId ? { ...c, title: newTitle } : c
    )
    await saveCachedChats(updatedCache)

    globalThis.dispatchEvent(
      new CustomEvent("gemfolders-folders-updated", {
        detail: {
          folders: updatedFolders,
          sourceInstanceId: "rename-handler"
        }
      })
    )

    globalThis.dispatchEvent(
      new CustomEvent("gemfolders-bookmark-changed", {
        detail: {
          action: "renamed",
          chatId,
          newTitle
        }
      })
    )
  } catch (error) {
    console.error("[Gemini Folders] Error syncing rename:", error)
    recentlySynced.delete(chatId)
  }
}

export const setupRenameHandler = () => {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData" || mutation.type === "childList") {
        const target = mutation.target as HTMLElement
        const titleElement =
          findConversationTitleElement(target) ||
          (target.closest(
            '[data-test-id="conversation-title"], .conversation-title-text, .conversation-title, .gds-label-l'
          ) as HTMLElement | null)

        if (titleElement) {
          const chatId = extractChatIdFromTitleElement(titleElement)
          const newTitle = titleElement.textContent?.trim()

          if (chatId && newTitle) {
            handleRename(chatId, newTitle)
          }
        }
      }
    }
  })

  const findAndObserveList = () => {
    const sidebarContainer = getSidebarScrollContainer()

    if (sidebarContainer) {
      observer.observe(sidebarContainer, {
        subtree: true,
        childList: true,
        characterData: true
      })
      return true
    }
    return false
  }

  if (!findAndObserveList()) {
    const retryInterval = setInterval(() => {
      if (findAndObserveList()) {
        clearInterval(retryInterval)
      }
    }, 2000)
  }
}
