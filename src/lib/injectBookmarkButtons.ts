import {
  createFolderButton,
  updateAllFolderButtons
} from "./injectFolderButtons"
import { DEFAULT_SETTINGS, getSettings, type Settings } from "./settings"
import {
  addBookmark,
  getBookmarks,
  removeBookmark,
  type BookmarkedChat
} from "./storage"

const BOOKMARK_BUTTON_CLASS = "gemini-organizer-bookmark-btn"
const BOOKMARK_ICON_FILLED = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`
const BOOKMARK_ICON_OUTLINE = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`

let bookmarksCache: BookmarkedChat[] = []
let settingsCache: Settings = DEFAULT_SETTINGS

const injectStyles = () => {
  const styleId = "gemini-organizer-settings-styles"
  if (document.getElementById(styleId)) return

  const style = document.createElement("style")
  style.id = styleId
  style.textContent = `
    body.gemini-organizer-hide-bookmarks .gemini-organizer-bookmark-btn {
      display: none !important;
    }
    body.gemini-organizer-hide-add-to-folder .gemini-organizer-folder-btn {
      display: none !important;
    }
    .pin-icon-container {
      display: none !important;
    }
  `
  document.head.appendChild(style)
}

const applySettings = (settings: Settings) => {
  if (settings.hideBookmarksFromSidebar) {
    document.body.classList.add("gemini-organizer-hide-bookmarks")
  } else {
    document.body.classList.remove("gemini-organizer-hide-bookmarks")
  }

  if (settings.hideAddToFolderFromSidebar) {
    document.body.classList.add("gemini-organizer-hide-add-to-folder")
  } else {
    document.body.classList.remove("gemini-organizer-hide-add-to-folder")
  }
}

const extractChatIdFromJslog = (jslog: string): string | null => {
  const regex = /\["c_([^"]+)"/
  const result = regex.exec(jslog)
  return result ? result[1] : null
}

const isBookmarked = (chatId: string): boolean => {
  return bookmarksCache.some((b) => b.id === chatId)
}

const createBookmarkButton = (
  chatId: string,
  chatTitle: string
): HTMLButtonElement => {
  const button = document.createElement("button")
  button.className = BOOKMARK_BUTTON_CLASS
  button.dataset.chatId = chatId
  button.title = isBookmarked(chatId) ? "Remove bookmark" : "Add bookmark"

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
    margin-left: auto;
    margin-right: 4px;
  `

  button.innerHTML = isBookmarked(chatId)
    ? BOOKMARK_ICON_FILLED
    : BOOKMARK_ICON_OUTLINE

  if (isBookmarked(chatId)) {
    button.style.color = "#3b82f6"
  }

  button.addEventListener("mouseenter", () => {
    button.style.backgroundColor = "rgba(59, 130, 246, 0.1)"
    button.style.color = "#3b82f6"
  })

  button.addEventListener("mouseleave", () => {
    button.style.backgroundColor = "transparent"
    if (isBookmarked(chatId)) {
      button.style.color = "#3b82f6"
    } else {
      button.style.color = "var(--gem-sys-color--on-surface-variant, #5f6368)"
    }
  })

  button.addEventListener("click", async (e) => {
    e.preventDefault()
    e.stopPropagation()

    const chatUrl = `https://gemini.google.com/app/${chatId}`
    const wasBookmarked = isBookmarked(chatId)

    if (wasBookmarked) {
      bookmarksCache = await removeBookmark(chatId)
      button.innerHTML = BOOKMARK_ICON_OUTLINE
      button.title = "Add bookmark"
      button.style.color = "var(--gem-sys-color--on-surface-variant, #5f6368)"
    } else {
      bookmarksCache = await addBookmark({
        id: chatId,
        title: chatTitle,
        url: chatUrl
      })
      button.innerHTML = BOOKMARK_ICON_FILLED
      button.title = "Remove bookmark"
      button.style.color = "#3b82f6"
    }

    globalThis.dispatchEvent(
      new CustomEvent("gemini-bookmark-changed", {
        detail: {
          chatId,
          isBookmarked: !wasBookmarked,
          action: wasBookmarked ? "removed" : "added"
        }
      })
    )
  })

  return button
}

const styleActionsContainer = (actionsContainer: HTMLElement) => {
  actionsContainer.style.cssText = `
    position: relative !important;
    right: auto !important;
    top: auto !important;
    transform: none !important;
    display: flex !important;
    align-items: center !important;
    opacity: 0;
    transition: opacity 0.2s ease;
    margin: 0 !important;
    padding: 0 !important;
  `
}

const injectButtonIntoConversation = (conversationElement: Element) => {
  const parentContainer = conversationElement.parentElement
  if (!parentContainer) return

  if (parentContainer.querySelector(`.${BOOKMARK_BUTTON_CLASS}`)) {
    return
  }

  const jslog = conversationElement.getAttribute("jslog") || ""
  const chatId = extractChatIdFromJslog(jslog)

  if (!chatId) return

  const titleElement = conversationElement.querySelector(
    ".conversation-title"
  ) as HTMLElement
  const chatTitle = titleElement?.textContent?.trim() || "Untitled Chat"

  const bookmarkButton = createBookmarkButton(chatId, chatTitle)
  const folderButton = createFolderButton(chatId, chatTitle)

  const actionsContainer = parentContainer.querySelector(
    ".conversation-actions-container"
  ) as HTMLElement
  const parentEl = parentContainer as HTMLElement
  parentEl.style.position = "relative"
  parentEl.style.display = "flex"
  parentEl.style.alignItems = "center"

  const actionsWrapper = document.createElement("div")
  actionsWrapper.className = "gemini-organizer-actions-wrapper"
  actionsWrapper.style.cssText = `
    display: flex;
    align-items: center;
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    gap: 0;
    z-index: 10;
  `

  if (actionsContainer) {
    styleActionsContainer(actionsContainer)
    actionsWrapper.appendChild(actionsContainer)

    parentContainer.addEventListener("mouseenter", () => {
      actionsContainer.style.opacity = "1"
    })

    parentContainer.addEventListener("mouseleave", () => {
      actionsContainer.style.opacity = "0"
    })
  }

  actionsWrapper.appendChild(bookmarkButton)
  actionsWrapper.appendChild(folderButton)
  parentContainer.appendChild(actionsWrapper)

  if (titleElement) {
    titleElement.style.maxWidth = "calc(100% - 70px)"
    titleElement.style.overflow = "hidden"
    titleElement.style.textOverflow = "ellipsis"
    titleElement.style.whiteSpace = "nowrap"
  }

  const convEl = conversationElement as HTMLElement
  convEl.style.flex = "1"
  convEl.style.overflow = "hidden"
  convEl.style.paddingRight = "70px"
}

const updateAllBookmarkButtons = () => {
  const buttons = document.querySelectorAll(`.${BOOKMARK_BUTTON_CLASS}`)
  buttons.forEach((button) => {
    const chatId = (button as HTMLElement).dataset.chatId
    if (chatId) {
      const btn = button as HTMLButtonElement
      const bookmarked = isBookmarked(chatId)
      btn.innerHTML = bookmarked ? BOOKMARK_ICON_FILLED : BOOKMARK_ICON_OUTLINE
      btn.title = bookmarked ? "Remove bookmark" : "Add bookmark"
      btn.style.color = bookmarked
        ? "#3b82f6"
        : "var(--gem-sys-color--on-surface-variant, #5f6368)"
    }
  })
}

export const injectBookmarkButtons = async () => {
  injectStyles()
  bookmarksCache = await getBookmarks()
  settingsCache = await getSettings()
  applySettings(settingsCache)

  const conversations = document.querySelectorAll(".conversation")
  conversations.forEach(injectButtonIntoConversation)

  const handleOrphanActionsContainer = (actionsContainer: Element) => {
    const parentContainer = actionsContainer.parentElement
    if (!parentContainer) return

    const existingWrapper = parentContainer.querySelector(
      ".gemini-organizer-actions-wrapper"
    )
    if (!existingWrapper) return

    if (!actionsContainer.closest(".gemini-organizer-actions-wrapper")) {
      const actionEl = actionsContainer as HTMLElement
      styleActionsContainer(actionEl)
      existingWrapper.insertBefore(actionsContainer, existingWrapper.firstChild)

      parentContainer.addEventListener("mouseenter", () => {
        actionEl.style.opacity = "1"
      })
      parentContainer.addEventListener("mouseleave", () => {
        actionEl.style.opacity = "0"
      })
    }
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          if (node.classList?.contains("conversation")) {
            injectButtonIntoConversation(node)
          }
          const nestedConversations = node.querySelectorAll?.(".conversation")
          nestedConversations?.forEach(injectButtonIntoConversation)

          if (node.classList?.contains("conversation-actions-container")) {
            handleOrphanActionsContainer(node)
          }
          const nestedActions = node.querySelectorAll?.(
            ".conversation-actions-container"
          )
          nestedActions?.forEach(handleOrphanActionsContainer)
        }
      })
    })
  })

  const sidebarContainer =
    document.querySelector("infinite-scroller") ||
    document.querySelector('[role="navigation"]') ||
    document.body

  if (sidebarContainer) {
    observer.observe(sidebarContainer, {
      childList: true,
      subtree: true
    })
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local") {
      if (changes["gemini-bookmarks"]) {
        bookmarksCache = changes["gemini-bookmarks"].newValue || []
        updateAllBookmarkButtons()
      }
      if (changes["gemini-folders"]) {
        updateAllFolderButtons()
      }
      if (changes["gemini-organizer-settings"]) {
        settingsCache =
          changes["gemini-organizer-settings"].newValue || DEFAULT_SETTINGS
        applySettings(settingsCache)
      }
    }
  })

  globalThis.addEventListener("gemini-bookmark-sync", async () => {
    bookmarksCache = await getBookmarks()
    updateAllBookmarkButtons()
  })
}

export const refreshBookmarkButtons = async () => {
  bookmarksCache = await getBookmarks()
  const conversations = document.querySelectorAll(".conversation")
  conversations.forEach(injectButtonIntoConversation)
  updateAllBookmarkButtons()
}
