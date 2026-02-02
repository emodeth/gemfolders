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
import { supabase } from "./supabase"

const BOOKMARK_BUTTON_CLASS = "gemfolders-organizer-bookmark-btn"
const BOOKMARK_ICON_FILLED = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`
const BOOKMARK_ICON_OUTLINE = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`

const FREE_TIER_MAX_BOOKMARKS = 5

let bookmarksCache: BookmarkedChat[] = []
let settingsCache: Settings = DEFAULT_SETTINGS
let isLoggedIn = false
let userAccessCache: { isPro: boolean; checkedAt: number } | null = null
const USER_ACCESS_CACHE_TTL = 5 * 60 * 1000

const checkLoginStatus = async (): Promise<boolean> => {
  try {
    const {
      data: { session }
    } = await supabase.auth.getSession()
    return !!session?.user
  } catch {
    return false
  }
}

const checkUserProStatus = async (): Promise<boolean> => {
  if (
    userAccessCache &&
    Date.now() - userAccessCache.checkedAt < USER_ACCESS_CACHE_TTL
  ) {
    return userAccessCache.isPro
  }

  try {
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session?.user) {
      userAccessCache = { isPro: false, checkedAt: Date.now() }
      return false
    }

    const { data: userAccess } = await supabase
      .from("user_access")
      .select("access_status, current_period_end")
      .eq("user_id", session.user.id)
      .single()

    const isPro =
      userAccess?.access_status === "lifetime" ||
      (userAccess?.current_period_end &&
        new Date(userAccess.current_period_end) > new Date())

    userAccessCache = { isPro: !!isPro, checkedAt: Date.now() }
    return !!isPro
  } catch {
    return true
  }
}

const canAddBookmarkSync = (): { allowed: boolean; reason?: string } => {
  if (!isLoggedIn) {
    return { allowed: false, reason: "login" }
  }

  if (userAccessCache?.isPro) {
    return { allowed: true }
  }
  if (bookmarksCache.length >= FREE_TIER_MAX_BOOKMARKS) {
    return { allowed: false, reason: "bookmark limit" }
  }

  return { allowed: true }
}

const injectStyles = () => {
  const styleId = "gemfolders-organizer-settings-styles"
  if (document.getElementById(styleId)) return

  const style = document.createElement("style")
  style.id = styleId
  style.textContent = `
    body.gemfolders-organizer-hide-bookmarks .gemfolders-organizer-bookmark-btn {
      display: none !important;
    }
    body.gemfolders-organizer-hide-add-to-folder .gemfolders-organizer-folder-btn {
      display: none !important;
    }
    body:not(.gemfolders-organizer-native-view) .pin-icon-container {
      display: none !important;
    }
    
    .gemfolders-organizer-parent-modified {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .gemfolders-organizer-conversation-modified {
      flex: 1;
      overflow: hidden;
      padding-right: 70px;
    }
    
    .gemfolders-organizer-title-modified {
      max-width: calc(100% - 70px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    body.gemfolders-organizer-native-view .gemfolders-organizer-actions-wrapper {
      display: flex !important;
    }
    
    body.gemfolders-organizer-native-view .gemfolders-organizer-conversation-modified {
      padding-right: 0 !important;
    }
    
    body.gemfolders-organizer-native-view .gemfolders-organizer-title-modified {
       max-width: 100% !important;
    }
  `
  document.head.appendChild(style)
}

const applySettings = (settings: Settings) => {
  if (settings.hideBookmarksFromSidebar) {
    document.body.classList.add("gemfolders-organizer-hide-bookmarks")
  } else {
    document.body.classList.remove("gemfolders-organizer-hide-bookmarks")
  }

  if (settings.hideAddToFolderFromSidebar) {
    document.body.classList.add("gemfolders-organizer-hide-add-to-folder")
  } else {
    document.body.classList.remove("gemfolders-organizer-hide-add-to-folder")
  }

  if (
    settings.hideBookmarksFromSidebar &&
    settings.hideAddToFolderFromSidebar
  ) {
    document.body.classList.add("gemfolders-organizer-native-view")
  } else {
    document.body.classList.remove("gemfolders-organizer-native-view")
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

  button.addEventListener("click", (e) => {
    e.preventDefault()
    e.stopPropagation()

    const chatUrl = `https://gemini.google.com/app/${chatId}`
    const wasBookmarked = isBookmarked(chatId)

    const revertToBookmarked = () => {
      button.innerHTML = BOOKMARK_ICON_FILLED
      button.title = "Remove bookmark"
      button.style.color = "#3b82f6"
    }

    const revertToUnbookmarked = () => {
      button.innerHTML = BOOKMARK_ICON_OUTLINE
      button.title = "Add bookmark"
      button.style.color = "var(--gem-sys-color--on-surface-variant, #5f6368)"
    }

    if (wasBookmarked) {
      revertToUnbookmarked()
      removeBookmark(chatId)
        .then((updatedBookmarks) => {
          bookmarksCache = updatedBookmarks
          globalThis.dispatchEvent(
            new CustomEvent("gemfolders-bookmark-changed", {
              detail: { chatId, isBookmarked: false, action: "removed" }
            })
          )
        })
        .catch(() => {
          revertToBookmarked()
        })
    } else {
      const { allowed, reason } = canAddBookmarkSync()

      if (!allowed) {
        globalThis.dispatchEvent(
          new CustomEvent("gemfolders-show-paywall", {
            detail: { reason }
          })
        )
        return
      }

      revertToBookmarked()

      addBookmark({
        id: chatId,
        title: chatTitle,
        url: chatUrl
      })
        .then((updatedBookmarks) => {
          bookmarksCache = updatedBookmarks
          globalThis.dispatchEvent(
            new CustomEvent("gemfolders-bookmark-changed", {
              detail: { chatId, isBookmarked: true, action: "added" }
            })
          )
          checkUserProStatus()
        })
        .catch(() => {
          revertToUnbookmarked()
        })
    }
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
  parentEl.classList.add("gemfolders-organizer-parent-modified")

  const actionsWrapper = document.createElement("div")
  actionsWrapper.className = "gemfolders-organizer-actions-wrapper"
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
    titleElement.classList.add("gemfolders-organizer-title-modified")
  }

  const convEl = conversationElement as HTMLElement
  convEl.classList.add("gemfolders-organizer-conversation-modified")
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

  isLoggedIn = await checkLoginStatus()
  if (!isLoggedIn) {
    return
  }

  // Fetch bookmarks and settings in parallel, and pre-warm the user access cache
  const [bookmarks, settings] = await Promise.all([
    getBookmarks(),
    getSettings(),
    checkUserProStatus() // Pre-cache user pro status
  ])

  bookmarksCache = bookmarks
  settingsCache = settings
  applySettings(settingsCache)

  const conversations = document.querySelectorAll(".conversation")
  conversations.forEach(injectButtonIntoConversation)

  const handleOrphanActionsContainer = (actionsContainer: Element) => {
    const parentContainer = actionsContainer.parentElement
    if (!parentContainer) return

    const existingWrapper = parentContainer.querySelector(
      ".gemfolders-organizer-actions-wrapper"
    )
    if (!existingWrapper) return

    if (!actionsContainer.closest(".gemfolders-organizer-actions-wrapper")) {
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
      if (changes["gemfolders-bookmarks"]) {
        bookmarksCache = changes["gemfolders-bookmarks"].newValue || []
        updateAllBookmarkButtons()
      }
      if (changes["gemfolders-folders"]) {
        updateAllFolderButtons()
      }
      if (changes["gemfolders-organizer-settings"]) {
        settingsCache =
          changes["gemfolders-organizer-settings"].newValue || DEFAULT_SETTINGS
        applySettings(settingsCache)
      }
    }
  })

  globalThis.addEventListener("gemfolders-bookmark-sync", async () => {
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

export const removeAllInjectedButtons = () => {
  const bookmarkButtons = document.querySelectorAll(`.${BOOKMARK_BUTTON_CLASS}`)
  bookmarkButtons.forEach((btn) => btn.remove())

  const folderButtons = document.querySelectorAll(
    ".gemfolders-organizer-folder-btn"
  )
  folderButtons.forEach((btn) => btn.remove())

  const wrappers = document.querySelectorAll(
    ".gemfolders-organizer-actions-wrapper"
  )
  wrappers.forEach((wrapper) => {
    const nativeActions = wrapper.querySelector(
      ".conversation-actions-container"
    )
    if (nativeActions && wrapper.parentElement) {
      wrapper.parentElement.appendChild(nativeActions)
    }
    wrapper.remove()
  })
}

export const setupAuthListener = () => {
  supabase.auth.onAuthStateChange((event, session) => {
    const wasLoggedIn = isLoggedIn
    isLoggedIn = !!session?.user

    userAccessCache = null

    if (event === "SIGNED_OUT" || (wasLoggedIn && !isLoggedIn)) {
      removeAllInjectedButtons()
    } else if (event === "SIGNED_IN" || (!wasLoggedIn && isLoggedIn)) {
      injectBookmarkButtons()
    }
  })
}
