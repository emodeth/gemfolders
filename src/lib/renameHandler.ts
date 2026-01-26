import { getCachedChats, saveCachedChats } from "./geminiChats"
import { renameChat, updateBookmarkTitle } from "./storage"

const extractChatId = (element: Element | null): string | null => {
  if (!element) return null
  const conversation = element.closest(".conversation")
  if (!conversation) return null
  const jslog = conversation.getAttribute("jslog")
  if (!jslog) return null

  const regex = /\["c_([^"]+)"/
  const match = regex.exec(jslog)
  return match ? match[1] : null
}

const SYNC_COOLDOWN = 2000
const recentlySynced = new Set<string>()

const handleRename = async (chatId: string, newTitle: string) => {
  if (recentlySynced.has(chatId)) return

  try {
    console.log(
      `[Gemini Folders] Syncing rename for ${chatId} to "${newTitle}"`
    )
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
      new CustomEvent("gemini-folders-updated", {
        detail: {
          folders: updatedFolders,
          sourceInstanceId: "rename-handler"
        }
      })
    )

    globalThis.dispatchEvent(
      new CustomEvent("gemini-bookmark-changed", {
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
          target.parentElement?.closest(".conversation-title") ||
          (target.classList?.contains("conversation-title") ? target : null)

        if (titleElement) {
          const chatId = extractChatId(titleElement)
          const newTitle = titleElement.textContent?.trim()

          if (chatId && newTitle) {
            handleRename(chatId, newTitle)
          }
        }
      }
    }
  })

  const findAndObserveList = () => {
    const sidebarContainer =
      document.querySelector("infinite-scroller") ||
      document.querySelector('[role="navigation"]') ||
      document.querySelector(".conversation-list")

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
