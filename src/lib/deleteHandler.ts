import { getCachedChats, saveCachedChats } from "./geminiChats"
import { deleteChat, removeBookmark } from "./storage"

const extractChatId = (jslog: string | null): string | null => {
  if (!jslog) return null
  const match = jslog.match(/\["c_([^"]+)"/)
  return match ? match[1] : null
}

export const setupDeleteHandler = () => {
  document.addEventListener(
    "click",
    async (e) => {
      const target = e.target as HTMLElement
      const confirmButton = target.closest(
        'button[data-test-id="confirm-button"]'
      )

      if (confirmButton) {
        const jslog = confirmButton.getAttribute("jslog")
        const chatId = extractChatId(jslog)

        if (chatId) {
          try {
            const updatedFolders = await deleteChat(chatId)
            await removeBookmark(chatId)

            globalThis.dispatchEvent(
              new CustomEvent("gemini-folders-updated", {
                detail: {
                  folders: updatedFolders,
                  sourceInstanceId: "delete-handler"
                }
              })
            )

            globalThis.dispatchEvent(
              new CustomEvent("gemini-bookmark-changed", {
                detail: {
                  action: "deleted",
                  chatId
                }
              })
            )

            const cached = await getCachedChats()
            const newCached = cached.filter((c) => c.id !== chatId)

            if (cached.length !== newCached.length) {
              await saveCachedChats(newCached)
            }
          } catch (error) {
            console.error(
              "[Gemini Folders] Error syncing chat deletion:",
              error
            )
          }
        }
      }
    },
    { capture: true }
  )
}
