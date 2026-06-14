import {
  createFolderButton,
  updateAllFolderButtons
} from "./injectFolderButtons"
import {
  extractChatId,
  extractChatTitle,
  findConversationActionsContainer,
  findConversationTitleElement,
  getConversationParentContainer,
  getConversationRow,
  isActionsContainerElement,
  isConversationElement,
  queryConversationElements
} from "./geminiDom"
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

const NOT_LOGGED_IN_MAX_BOOKMARKS = 5
const FREE_TIER_MAX_BOOKMARKS = 10

let bookmarksCache: BookmarkedChat[] = []
let settingsCache: Settings = DEFAULT_SETTINGS
let isLoggedIn = false
let userAccessCache: { isPro: boolean; checkedAt: number } | null = null
const USER_ACCESS_CACHE_TTL = 5 * 60 * 1000

let injectionAttempts = 0
const MAX_INJECTION_ATTEMPTS = 50
const INJECTION_RETRY_DELAY = 100 // ms
let observer: MutationObserver | null = null

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
  if (userAccessCache?.isPro) {
    return { allowed: true }
  }

  const maxBookmarks = isLoggedIn
    ? FREE_TIER_MAX_BOOKMARKS
    : NOT_LOGGED_IN_MAX_BOOKMARKS

  if (bookmarksCache.length >= maxBookmarks) {
    return { allowed: false, reason: isLoggedIn ? "bookmark limit" : "sign-in" }
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
      display: none !important;
    }
  `
  document.head.appendChild(style)
}

const restoreNativeView = () => {
  document
    .querySelectorAll(".gemfolders-organizer-actions-wrapper")
    .forEach((wrapper) => {
      const nativeActions = wrapper.querySelector(
        '.conversation-actions-container, [data-test-id="actions-menu-button"]'
      ) as HTMLElement
      if (nativeActions && wrapper.parentElement) {
        nativeActions.style.cssText = ""
        wrapper.parentElement.appendChild(nativeActions)
      }
    })

  document
    .querySelectorAll(".gemfolders-organizer-conversation-modified")
    .forEach((el) => {
      el.classList.remove("gemfolders-organizer-conversation-modified")
    })

  document
    .querySelectorAll(".gemfolders-organizer-title-modified")
    .forEach((el) => {
      el.classList.remove("gemfolders-organizer-title-modified")
    })

  document
    .querySelectorAll(".gemfolders-organizer-parent-modified")
    .forEach((el) => {
      el.classList.remove("gemfolders-organizer-parent-modified")
    })
}

const enableCustomView = () => {
  document
    .querySelectorAll(".gemfolders-organizer-actions-wrapper")
    .forEach((wrapper) => {
      const parentContainer = wrapper.parentElement
      if (!parentContainer) return

      parentContainer.classList.add("gemfolders-organizer-parent-modified")

      const conversationEl = getConversationRow(parentContainer)
      if (conversationEl) {
        conversationEl.classList.add(
          "gemfolders-organizer-conversation-modified"
        )
      }

      const titleEl = findConversationTitleElement(parentContainer)
      if (titleEl) {
        titleEl.classList.add("gemfolders-organizer-title-modified")
      }

      const nativeActions = findConversationActionsContainer(parentContainer)
      if (
        nativeActions &&
        !nativeActions.closest(".gemfolders-organizer-actions-wrapper")
      ) {
        styleActionsContainer(nativeActions)
        wrapper.insertBefore(nativeActions, wrapper.firstChild)

        parentContainer.addEventListener("mouseenter", () => {
          nativeActions.style.opacity = "1"
        })
        parentContainer.addEventListener("mouseleave", () => {
          nativeActions.style.opacity = "0"
        })
      }
    })

  injectButtonsIntoVisibleConversations()
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

  const isNativeView =
    settings.hideBookmarksFromSidebar && settings.hideAddToFolderFromSidebar

  if (isNativeView) {
    document.body.classList.add("gemfolders-organizer-native-view")
    restoreNativeView()
  } else {
    document.body.classList.remove("gemfolders-organizer-native-view")
    enableCustomView()
  }
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

const isNativeViewActive = () =>
  document.body.classList.contains("gemfolders-organizer-native-view")

const injectButtonIntoConversation = (conversationElement: Element) => {
  if (isNativeViewActive()) return

  const parentContainer = getConversationParentContainer(conversationElement)
  if (!parentContainer) return

  if (parentContainer.querySelector(`.${BOOKMARK_BUTTON_CLASS}`)) {
    return
  }

  const chatId = extractChatId(conversationElement)
  if (!chatId) return

  const titleElement = findConversationTitleElement(conversationElement)
  const chatTitle = extractChatTitle(conversationElement)

  const bookmarkButton = createBookmarkButton(chatId, chatTitle)
  const folderButton = createFolderButton(chatId, chatTitle)

  const actionsContainer = findConversationActionsContainer(conversationElement)
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

  const convEl = getConversationRow(conversationElement) ?? (conversationElement as HTMLElement)
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

const handleOrphanActionsContainer = (actionsContainer: Element) => {
  if (isNativeViewActive()) return

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

const injectButtonsIntoVisibleConversations = () => {
  queryConversationElements().forEach(injectButtonIntoConversation)
}

const attemptInjection = () => {
  if (isNativeViewActive()) return

  injectButtonsIntoVisibleConversations()

  if (injectionAttempts < MAX_INJECTION_ATTEMPTS) {
    injectionAttempts++
    setTimeout(attemptInjection, INJECTION_RETRY_DELAY)
  }
}

export const injectBookmarkButtons = async () => {
  injectStyles()

  isLoggedIn = await checkLoginStatus()

  const [bookmarks, settings] = await Promise.all([
    getBookmarks(),
    getSettings(),
    checkUserProStatus()
  ])

  bookmarksCache = bookmarks
  settingsCache = settings
  applySettings(settingsCache)

  attemptInjection()

  if (observer) {
    observer.disconnect()
  }

  observer = new MutationObserver((mutations) => {
    let shouldInject = false

    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            if (isConversationElement(node) || node.querySelector('[data-test-id="conversation"], .conversation')) {
              shouldInject = true

              if (isConversationElement(node)) {
                injectButtonIntoConversation(node)
              }
              node
                .querySelectorAll('[data-test-id="conversation"], .conversation')
                .forEach(injectButtonIntoConversation)
            }

            if (
              isActionsContainerElement(node) ||
              node.querySelector('.conversation-actions-container, [data-test-id="actions-menu-button"]')
            ) {
              if (isActionsContainerElement(node)) {
                handleOrphanActionsContainer(node)
              }
              node
                .querySelectorAll('.conversation-actions-container, [data-test-id="actions-menu-button"]')
                .forEach(handleOrphanActionsContainer)
            }
          }
        }
      }
    }

    // Also re-run generic injection if we detected relevant mutations, just to be safe
    if (shouldInject) {
      injectButtonsIntoVisibleConversations()
    }
  })

  // Observe body to catch navigation loading
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

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

  // Visibility change handling
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      injectButtonsIntoVisibleConversations()
    }
  })

  // URL change handling
  let lastUrl = location.href
  new MutationObserver(() => {
    const url = location.href
    if (url !== lastUrl) {
      lastUrl = url
      // Re-trigger aggressive injection on URL change (navigation)
      injectionAttempts = 0
      attemptInjection()
    }
  }).observe(document.body, { subtree: true, childList: true })
}

export const refreshBookmarkButtons = async () => {
  bookmarksCache = await getBookmarks()
  injectButtonsIntoVisibleConversations()
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
      '.conversation-actions-container, [data-test-id="actions-menu-button"]'
    )
    if (nativeActions && wrapper.parentElement) {
      // Reset styles applied to the native container
      const nativeParams = nativeActions as HTMLElement
      nativeParams.style.cssText = ""
      wrapper.parentElement.appendChild(nativeActions)
    }
    wrapper.remove()
  })

  document
    .querySelectorAll(".gemfolders-organizer-parent-modified")
    .forEach((el) => {
      el.classList.remove("gemfolders-organizer-parent-modified")
    })

  document
    .querySelectorAll(".gemfolders-organizer-title-modified")
    .forEach((el) => {
      el.classList.remove("gemfolders-organizer-title-modified")
    })

  document
    .querySelectorAll(".gemfolders-organizer-conversation-modified")
    .forEach((el) => {
      el.classList.remove("gemfolders-organizer-conversation-modified")
    })

  const styleTag = document.getElementById(
    "gemfolders-organizer-settings-styles"
  )
  if (styleTag) {
    styleTag.remove()
  }

  if (observer) {
    observer.disconnect()
    observer = null
  }

  injectionAttempts = 0
}

export const setupAuthListener = () => {
  supabase.auth.onAuthStateChange((event, session) => {
    isLoggedIn = !!session?.user
    userAccessCache = null

    // Refresh buttons on any auth state change to reflect current tier limits
    refreshBookmarkButtons()
  })
}
