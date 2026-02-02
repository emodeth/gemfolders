import { getFolders, type Folder } from "./storage"

const FOLDER_BUTTON_CLASS = "gemfolders-organizer-folder-btn"
const FOLDER_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-plus"><path d="M12 10v6"/><path d="M9 13h6"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`
const FOLDER_ICON_FILLED = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-icon lucide-folder"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`

const isChatInFolders = (chatId: string, folders: Folder[]): boolean => {
  for (const folder of folders) {
    if (
      folder.type === "chat" &&
      (folder.id === chatId || folder.originalId === chatId)
    )
      return true
    if (folder.children && isChatInFolders(chatId, folder.children)) return true
  }
  return false
}

export const updateFolderButtonState = async (
  button: HTMLButtonElement,
  folders?: Folder[]
) => {
  const chatId = button.dataset.chatId
  if (!chatId) return

  const currentFolders = folders || (await getFolders())
  const isInFolder = isChatInFolders(chatId, currentFolders)

  if (isInFolder) {
    button.innerHTML = FOLDER_ICON_FILLED
    button.title = "Manage folders"
    button.style.color = "#3b82f6"
    button.dataset.inFolder = "true"
  } else {
    button.innerHTML = FOLDER_ICON
    button.title = "Add to folder"
    button.style.color = "var(--gem-sys-color--on-surface-variant, #5f6368)"
    button.dataset.inFolder = "false"
  }
}

export const updateAllFolderButtons = async () => {
  const buttons = document.querySelectorAll(`.${FOLDER_BUTTON_CLASS}`)
  const folders = await getFolders()
  buttons.forEach((button) => {
    updateFolderButtonState(button as HTMLButtonElement, folders)
  })
}

export const createFolderButton = (
  chatId: string,
  chatTitle: string
): HTMLButtonElement => {
  const button = document.createElement("button")
  button.className = FOLDER_BUTTON_CLASS
  button.dataset.chatId = chatId
  button.title = "Add to folder"

  button.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    border-radius: 50%;
    cursor: pointer;
    opacity: 1;
    transition: background-color 0.2s ease, color 0.2s ease;
    color: var(--gem-sys-color--on-surface-variant, #5f6368);
    flex-shrink: 0;
    margin-right: 4px;
  `

  button.innerHTML = FOLDER_ICON

  button.addEventListener("mouseenter", () => {
    button.style.backgroundColor = "rgba(59, 130, 246, 0.1)"
    button.style.color = "#3b82f6"
  })

  button.addEventListener("mouseleave", () => {
    button.style.backgroundColor = "transparent"
    if (button.dataset.inFolder === "true") {
      button.style.color = "#3b82f6"
    } else {
      button.style.color = "var(--gem-sys-color--on-surface-variant, #5f6368)"
    }
  })

  updateFolderButtonState(button)

  button.addEventListener("click", (e) => {
    e.preventDefault()
    e.stopPropagation()

    const chatUrl = `https://gemini.google.com/app/${chatId}`

    globalThis.dispatchEvent(
      new CustomEvent("gemfolders-add-to-folder", {
        detail: {
          chatId,
          chatTitle,
          chatUrl
        }
      })
    )
  })

  return button
}
