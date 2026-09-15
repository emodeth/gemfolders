import {
  extractChatId,
  extractChatTitle,
  findConversationActionsContainer,
  findConversationTitleElement,
  findNativeMenuPanel,
  queryConversationElements
} from "./geminiDom"
import {
  ADD_TO_FOLDER_MENU_LABEL,
  getBookmarkMenuIconSvg,
  getBookmarkMenuLabel,
  getFolderMenuIconSvg
} from "./lucideMenuIcons"
import { DEFAULT_SETTINGS, getSettings, type Settings } from "./settings"
import {
  addBookmark,
  getBookmarks,
  getFolders,
  isChatInAnyFolder,
  removeBookmark,
  type BookmarkedChat,
  type Folder
} from "./storage"
import { supabase } from "./supabase"

const ACTIONS_WRAPPER_CLASS = "gemfolders-sidebar-actions"
const BOOKMARK_BUTTON_CLASS = "gemfolders-organizer-bookmark-btn"
const FOLDER_BUTTON_CLASS = "gemfolders-organizer-folder-btn"
const ACTIONS_HOST_CLASS = "gemfolders-sidebar-actions-host"
const NATIVE_ACTION_BUTTON_CLASS = "gemfolders-native-actions-menu"
const TITLE_CLASS = "gemfolders-organizer-title-modified"
const TITLE_WRAPPER_ATTRIBUTE = "data-gemfolders-title-wrapper"
const TITLE_ACTION_GAP = 4
const STYLE_ID = "gemfolders-organizer-settings-styles"
const NATIVE_ACTION_BUTTON_SELECTOR =
  '[data-test-id="actions-menu-button"], [data-test-id="conversation-actions-menu-icon-button"], [aria-haspopup="menu"]'

const NOT_LOGGED_IN_MAX_BOOKMARKS = 5
const FREE_TIER_MAX_BOOKMARKS = 10
const USER_ACCESS_CACHE_TTL = 5 * 60 * 1000

let bookmarksCache: BookmarkedChat[] = []
let foldersCache: Folder[] = []
let settingsCache: Settings = DEFAULT_SETTINGS
let isLoggedIn = false
let userAccessCache: { isPro: boolean; checkedAt: number } | null = null
let observer: MutationObserver | null = null
let rowResizeObserver: ResizeObserver | null = null
let injectionFrame: number | null = null
let isSetup = false
let openNativeMenuButton: HTMLElement | null = null
let nativeMenuWasOpen = false

const checkLoginStatus = async (): Promise<boolean> => {
  try {
    const {
      data: { session }
    } = await supabase.auth.getSession()
    return Boolean(session?.user)
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

    userAccessCache = { isPro: Boolean(isPro), checkedAt: Date.now() }
    return Boolean(isPro)
  } catch {
    return true
  }
}

const isBookmarked = (chatId: string): boolean =>
  bookmarksCache.some((bookmark) => bookmark.id === chatId)

const canAddBookmark = (): { allowed: boolean; reason?: string } => {
  if (userAccessCache?.isPro) return { allowed: true }

  const maxBookmarks = isLoggedIn
    ? FREE_TIER_MAX_BOOKMARKS
    : NOT_LOGGED_IN_MAX_BOOKMARKS

  if (bookmarksCache.length >= maxBookmarks) {
    return { allowed: false, reason: isLoggedIn ? "bookmark limit" : "sign-in" }
  }

  return { allowed: true }
}

const injectStyles = () => {
  document.getElementById(STYLE_ID)?.remove()

  const style = document.createElement("style")
  style.id = STYLE_ID
  style.textContent = `
    body {
      --gemfolders-action-hover-bg: rgba(255, 255, 255, 0.1);
      --gemfolders-action-focus-ring: rgba(255, 255, 255, 0.28);
      --gemfolders-folder-hover: #e3e3e3;
    }

    body.light-theme {
      --gemfolders-action-hover-bg: rgba(0, 0, 0, 0.08);
      --gemfolders-action-focus-ring: rgba(0, 0, 0, 0.24);
      --gemfolders-folder-hover: #0000008c;
    }

    gem-nav-list-item[data-test-id="conversation"] {
      position: relative;
    }

    .${ACTIONS_WRAPPER_CLASS} {
      display: contents !important;
    }

    gem-nav-list-item[data-test-id="conversation"]:hover .${ACTIONS_HOST_CLASS},
    gem-nav-list-item[data-test-id="conversation"]:hover .${NATIVE_ACTION_BUTTON_CLASS} {
      opacity: 1 !important;
      pointer-events: auto !important;
      visibility: visible !important;
    }

    .${ACTIONS_WRAPPER_CLASS} button {
      align-items: center;
      background: transparent;
      border: 0;
      border-radius: 50%;
      color: inherit;
      cursor: pointer;
      display: none !important;
      height: 32px;
      justify-content: center;
      margin: 0;
      padding: 0;
      position: absolute;
      top: 50%;
      transition-property: background-color, color, scale;
      transition-duration: 140ms;
      transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
      translate: 0 -50%;
      width: 32px;
      z-index: 3;
    }

    .${BOOKMARK_BUTTON_CLASS} {
      inset-inline-end: 68px;
      right: 68px;
    }

    .${FOLDER_BUTTON_CLASS} {
      inset-inline-end: 36px;
      right: 36px;
    }

    .${ACTIONS_WRAPPER_CLASS}:has(button[data-active="true"]) button,
    gem-nav-list-item[data-test-id="conversation"]:hover .${ACTIONS_WRAPPER_CLASS} button {
      display: inline-flex !important;
    }

    .${ACTIONS_WRAPPER_CLASS} button:hover,
    .${ACTIONS_WRAPPER_CLASS} button:focus-visible {
      background-color: var(--gemfolders-action-hover-bg);
      color: inherit;
      outline: none;
    }

    .${FOLDER_BUTTON_CLASS}:hover,
    .${FOLDER_BUTTON_CLASS}:focus-visible {
      color: var(--gemfolders-folder-hover);
    }

    .${ACTIONS_WRAPPER_CLASS} button:focus-visible {
      box-shadow: 0 0 0 2px var(--gemfolders-action-focus-ring);
    }

    .${ACTIONS_WRAPPER_CLASS} button:active {
      scale: 0.96;
    }

    .${ACTIONS_WRAPPER_CLASS} button[data-active="true"] {
      color: inherit;
    }

    .${ACTIONS_WRAPPER_CLASS} svg {
      display: block;
      height: 16px;
      pointer-events: none;
      width: 16px;
    }

    .${TITLE_CLASS} {
      min-width: 0;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }

    gem-nav-list-item[data-test-id="conversation"]:has(.${ACTIONS_WRAPPER_CLASS} button[data-active="true"]) .${TITLE_CLASS},
    gem-nav-list-item[data-test-id="conversation"]:hover .${TITLE_CLASS} {
      display: inline-block;
      max-width: var(--gemfolders-title-max-width, calc(100% - 64px)) !important;
      vertical-align: bottom;
    }

  `
  document.head.appendChild(style)
}

const refreshBookmarkButton = (button: HTMLButtonElement, chatId: string) => {
  const bookmarked = isBookmarked(chatId)
  const label = getBookmarkMenuLabel(bookmarked)
  button.innerHTML = getBookmarkMenuIconSvg(bookmarked)
  button.title = label
  button.setAttribute("aria-label", label)
  button.setAttribute("aria-pressed", String(bookmarked))
  button.dataset.active = String(bookmarked)
}

const refreshFolderButton = (button: HTMLButtonElement, chatId: string) => {
  const inFolder = isChatInAnyFolder(foldersCache, chatId)
  const label = inFolder ? "Manage folders" : ADD_TO_FOLDER_MENU_LABEL
  button.innerHTML = getFolderMenuIconSvg(inFolder)
  button.title = label
  button.setAttribute("aria-label", label)
  button.dataset.active = String(inFolder)
}

const refreshAllButtons = () => {
  document
    .querySelectorAll<HTMLButtonElement>(`.${BOOKMARK_BUTTON_CLASS}`)
    .forEach((button) => {
      if (button.dataset.chatId) {
        refreshBookmarkButton(button, button.dataset.chatId)
      }
    })

  document
    .querySelectorAll<HTMLButtonElement>(`.${FOLDER_BUTTON_CLASS}`)
    .forEach((button) => {
      if (button.dataset.chatId) {
        refreshFolderButton(button, button.dataset.chatId)
      }
    })
}

const createBookmarkButton = (
  chatId: string,
  chatTitle: string
): HTMLButtonElement => {
  const button = document.createElement("button")
  button.type = "button"
  button.className = BOOKMARK_BUTTON_CLASS
  button.dataset.chatId = chatId
  refreshBookmarkButton(button, chatId)

  button.addEventListener("click", (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (isBookmarked(chatId)) {
      removeBookmark(chatId)
        .then((bookmarks) => {
          bookmarksCache = bookmarks
          refreshAllButtons()
          globalThis.dispatchEvent(
            new CustomEvent("gemfolders-bookmark-changed", {
              detail: { chatId, isBookmarked: false, action: "removed" }
            })
          )
        })
        .catch((error) => {
          console.error("[Gemini Folders] Failed to remove bookmark:", error)
          refreshBookmarkButton(button, chatId)
        })
      return
    }

    const { allowed, reason } = canAddBookmark()
    if (!allowed) {
      globalThis.dispatchEvent(
        new CustomEvent("gemfolders-show-paywall", { detail: { reason } })
      )
      return
    }

    addBookmark({
      id: chatId,
      title: chatTitle,
      url: `https://gemini.google.com/app/${chatId}`
    })
      .then((bookmarks) => {
        bookmarksCache = bookmarks
        refreshAllButtons()
        globalThis.dispatchEvent(
          new CustomEvent("gemfolders-bookmark-changed", {
            detail: { chatId, isBookmarked: true, action: "added" }
          })
        )
        checkUserProStatus()
      })
      .catch((error) => {
        console.error("[Gemini Folders] Failed to add bookmark:", error)
        refreshBookmarkButton(button, chatId)
      })
  })

  return button
}

const createFolderButton = (
  chatId: string,
  chatTitle: string
): HTMLButtonElement => {
  const button = document.createElement("button")
  button.type = "button"
  button.className = FOLDER_BUTTON_CLASS
  button.dataset.chatId = chatId
  refreshFolderButton(button, chatId)

  button.addEventListener("click", (event) => {
    event.preventDefault()
    event.stopPropagation()
    globalThis.dispatchEvent(
      new CustomEvent("gemfolders-add-to-folder", {
        detail: {
          chatId,
          chatTitle,
          chatUrl: `https://gemini.google.com/app/${chatId}`
        }
      })
    )
  })

  return button
}

const trackNativeMenuButton = (button: HTMLElement) => {
  if (button.dataset.gemfoldersMenuFocusHandler) return
  button.dataset.gemfoldersMenuFocusHandler = "true"

  button.addEventListener("click", () => {
    if (openNativeMenuButton !== button) {
      openNativeMenuButton = button
      nativeMenuWasOpen = false
    }
  })
}

const clearClosedNativeMenuFocus = () => {
  if (!openNativeMenuButton) return

  if (findNativeMenuPanel()) {
    nativeMenuWasOpen = true
    return
  }

  if (!nativeMenuWasOpen) return

  openNativeMenuButton.querySelector<HTMLElement>(":focus")?.blur()
  openNativeMenuButton.blur()
  openNativeMenuButton = null
  nativeMenuWasOpen = false
}

const findTitleDisplayElement = (
  conversationElement: Element,
  chatTitle: string,
  nativeActionButton: HTMLElement
): HTMLElement | null => {
  const knownTitleElement = findConversationTitleElement(conversationElement)
  if (
    knownTitleElement &&
    knownTitleElement.tagName.toLowerCase() !== "a" &&
    !knownTitleElement.contains(nativeActionButton)
  ) {
    return knownTitleElement
  }

  const linkSelector = 'a.gem-nav-list-item, a[href*="/app/"], a[href*="/gem/"]'
  const link = conversationElement.matches(linkSelector)
    ? (conversationElement as HTMLAnchorElement)
    : conversationElement.querySelector<HTMLAnchorElement>(linkSelector)
  if (!link) return null

  const normalizedTitle = chatTitle.trim().replace(/\s+/g, " ")
  const candidates = Array.from(link.querySelectorAll<HTMLElement>("*"))

  const titleElement =
    candidates.find((candidate) => {
      if (candidate.contains(nativeActionButton)) return false

      const candidateText = (candidate.textContent || "")
        .trim()
        .replace(/\s+/g, " ")
      if (candidateText !== normalizedTitle) return false

      return !Array.from(candidate.children).some(
        (child) =>
          (child.textContent || "").trim().replace(/\s+/g, " ") ===
          normalizedTitle
      )
    }) ?? null
  if (titleElement) return titleElement

  const directTitleNode = Array.from(link.childNodes).find(
    (node) =>
      node.nodeType === Node.TEXT_NODE &&
      (node.textContent || "").trim().replace(/\s+/g, " ") === normalizedTitle
  )
  if (!directTitleNode) return null

  const titleWrapper = document.createElement("span")
  titleWrapper.setAttribute(TITLE_WRAPPER_ATTRIBUTE, "true")
  directTitleNode.before(titleWrapper)
  titleWrapper.appendChild(directTitleNode)
  return titleWrapper
}

const updateTitleMaxWidth = (
  placementRow: HTMLElement,
  titleElement: HTMLElement,
  actionsWrapper: HTMLElement
) => {
  const firstButton = actionsWrapper.querySelector<HTMLButtonElement>(
    `.${BOOKMARK_BUTTON_CLASS}, .${FOLDER_BUTTON_CLASS}`
  )
  if (!firstButton) return

  const rowRect = placementRow.getBoundingClientRect()
  const titleRect = titleElement.getBoundingClientRect()
  const buttonStyle = getComputedStyle(firstButton)
  const buttonRight = Number.parseFloat(buttonStyle.right)
  const buttonWidth = Number.parseFloat(buttonStyle.width)
  if (!Number.isFinite(buttonRight) || !Number.isFinite(buttonWidth)) return

  const firstActionLeft = rowRect.right - buttonRight - buttonWidth
  const availableWidth = Math.max(
    0,
    Math.floor(firstActionLeft - titleRect.left - TITLE_ACTION_GAP)
  )
  titleElement.style.setProperty(
    "--gemfolders-title-max-width",
    `${availableWidth}px`
  )
}

const injectButtonsIntoConversation = (conversationElement: Element) => {
  const chatId = extractChatId(conversationElement)
  if (!chatId) return

  const nativeActions = findConversationActionsContainer(conversationElement)
  if (!nativeActions) return

  const nativeActionButton = nativeActions.matches(
    NATIVE_ACTION_BUTTON_SELECTOR
  )
    ? nativeActions
    : nativeActions.querySelector<HTMLElement>(NATIVE_ACTION_BUTTON_SELECTOR)
  if (!nativeActionButton?.parentElement) return

  const placementRow = conversationElement as HTMLElement
  nativeActionButton.classList.add(NATIVE_ACTION_BUTTON_CLASS)
  nativeActionButton.parentElement.classList.add(ACTIONS_HOST_CLASS)
  trackNativeMenuButton(nativeActionButton)

  const existingWrapper = placementRow.querySelector<HTMLElement>(
    `:scope > .${ACTIONS_WRAPPER_CLASS}`
  )
  const chatTitle = extractChatTitle(conversationElement)
  placementRow.querySelectorAll(`.${TITLE_CLASS}`).forEach((element) => {
    element.classList.remove(TITLE_CLASS)
  })
  const titleElement = findTitleDisplayElement(
    conversationElement,
    chatTitle,
    nativeActionButton
  )
  titleElement?.classList.add(TITLE_CLASS)

  if (existingWrapper?.dataset.chatId === chatId) {
    if (titleElement) {
      updateTitleMaxWidth(placementRow, titleElement, existingWrapper)
    }
    rowResizeObserver?.observe(placementRow)
    return
  }
  existingWrapper?.remove()

  const wrapper = document.createElement("div")
  wrapper.className = ACTIONS_WRAPPER_CLASS
  wrapper.dataset.chatId = chatId
  wrapper.setAttribute("role", "group")
  wrapper.setAttribute("aria-label", "Chat organization actions")

  if (!settingsCache.hideBookmarksFromSidebar) {
    wrapper.appendChild(createBookmarkButton(chatId, chatTitle))
  }
  if (!settingsCache.hideAddToFolderFromSidebar) {
    wrapper.appendChild(createFolderButton(chatId, chatTitle))
  }
  if (!wrapper.firstChild) return

  // Keep extension actions outside Gemini's native actions container. Gemini
  // owns the pinned indicator in that slot and swaps it for the three-dot menu
  // on hover; forcing its container visible breaks that native transition.
  placementRow.appendChild(wrapper)
  if (titleElement) {
    updateTitleMaxWidth(placementRow, titleElement, wrapper)
  }
  rowResizeObserver?.observe(placementRow)
}

const injectButtonsIntoVisibleConversations = () => {
  queryConversationElements().forEach(injectButtonsIntoConversation)
}

const scheduleInjection = () => {
  if (injectionFrame !== null) return
  injectionFrame = requestAnimationFrame(() => {
    injectionFrame = null
    injectButtonsIntoVisibleConversations()
    clearClosedNativeMenuFocus()
  })
}

const removeInjectedMenuItems = () => {
  document
    .querySelectorAll(
      "[data-gemfolders-menu-item], .gemfolders-menu-bookmark-btn, .gemfolders-menu-folder-btn"
    )
    .forEach((item) => item.remove())
}

const removeInlineButtons = () => {
  document.querySelectorAll(`.${ACTIONS_WRAPPER_CLASS}`).forEach((wrapper) => {
    wrapper.remove()
  })
  document.querySelectorAll(`.${ACTIONS_HOST_CLASS}`).forEach((host) => {
    host.classList.remove(ACTIONS_HOST_CLASS)
  })
  document
    .querySelectorAll(`.${NATIVE_ACTION_BUTTON_CLASS}`)
    .forEach((button) => button.classList.remove(NATIVE_ACTION_BUTTON_CLASS))
  document
    .querySelectorAll(
      ".gemfolders-organizer-parent-modified, .gemfolders-organizer-conversation-modified, .gemfolders-organizer-title-modified"
    )
    .forEach((element) => {
      ;(element as HTMLElement).style.removeProperty(
        "--gemfolders-title-max-width"
      )
      element.classList.remove(
        "gemfolders-organizer-parent-modified",
        "gemfolders-organizer-conversation-modified",
        TITLE_CLASS
      )
    })
  document
    .querySelectorAll<HTMLElement>(`[${TITLE_WRAPPER_ATTRIBUTE}]`)
    .forEach((wrapper) =>
      wrapper.replaceWith(...Array.from(wrapper.childNodes))
    )
}

const rebuildInlineButtons = () => {
  removeInlineButtons()
  scheduleInjection()
}

const cleanupPreviousLayout = () => {
  removeInlineButtons()
  document
    .querySelectorAll(".gemfolders-organizer-actions-wrapper")
    .forEach((wrapper) => {
      const nativeActions = wrapper.querySelector<HTMLElement>(
        ".conversation-actions-container"
      )
      if (nativeActions && wrapper.parentElement) {
        nativeActions.style.cssText = ""
        wrapper.parentElement.appendChild(nativeActions)
      }
      wrapper.remove()
    })
  document
    .querySelectorAll<HTMLElement>(".conversation-actions-container")
    .forEach((host) => {
      if (!host.classList.contains(ACTIONS_HOST_CLASS)) {
        host.style.cssText = ""
      }
    })
}

export const setupSidebarActionButtons = async () => {
  if (isSetup) return
  isSetup = true

  cleanupPreviousLayout()
  removeInjectedMenuItems()
  injectStyles()

  const [loggedIn, bookmarks, folders, settings] = await Promise.all([
    checkLoginStatus(),
    getBookmarks(),
    getFolders(),
    getSettings(),
    checkUserProStatus()
  ])
  isLoggedIn = loggedIn
  bookmarksCache = bookmarks
  foldersCache = folders
  settingsCache = settings

  rowResizeObserver?.disconnect()
  rowResizeObserver = new ResizeObserver(scheduleInjection)
  injectButtonsIntoVisibleConversations()

  observer?.disconnect()
  observer = new MutationObserver(scheduleInjection)
  observer.observe(document.body, {
    attributeFilter: ["href", "jslog"],
    attributes: true,
    childList: true,
    subtree: true
  })

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return

    if (changes["gemfolders-bookmarks"]) {
      bookmarksCache = changes["gemfolders-bookmarks"].newValue || []
      refreshAllButtons()
    }
    if (changes["gemfolders-folders"]) {
      foldersCache = changes["gemfolders-folders"].newValue || []
      refreshAllButtons()
    }
    if (changes["gemfolders-organizer-settings"]) {
      settingsCache =
        changes["gemfolders-organizer-settings"].newValue || DEFAULT_SETTINGS
      rebuildInlineButtons()
    }
  })

  globalThis.addEventListener("gemfolders-bookmark-sync", async () => {
    bookmarksCache = await getBookmarks()
    refreshAllButtons()
  })

  globalThis.addEventListener("gemfolders-folders-updated", async () => {
    foldersCache = await getFolders()
    refreshAllButtons()
  })

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") scheduleInjection()
  })
}

export const setupAuthListener = () => {
  supabase.auth.onAuthStateChange(async (_event, session) => {
    isLoggedIn = Boolean(session?.user)
    userAccessCache = null
    bookmarksCache = await getBookmarks()
    foldersCache = await getFolders()
    refreshAllButtons()
  })
}
