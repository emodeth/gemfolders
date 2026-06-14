import {
  closeNativeConversationMenu,
  extractChatId,
  extractChatTitle,
  findMenuContent,
  findNativeMenuPanel,
  findTemplateMenuItem,
  getConversationFromActionsButton,
  isConversationMenuTrigger
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

const GEMFOLDERS_MENU_ITEM_ATTR = "data-gemfolders-menu-item"
const INJECTED_CLASS_NAMES = {
  bookmark: "gemfolders-menu-bookmark-btn",
  folder: "gemfolders-menu-folder-btn"
} as const

const NOT_LOGGED_IN_MAX_BOOKMARKS = 5
const FREE_TIER_MAX_BOOKMARKS = 10
const MENU_CONTEXT_TTL_MS = 5000
const MENU_INJECTION_DELAYS_MS = [0, 50, 100, 200, 350, 500, 750, 1000]

interface PendingMenuContext {
  chatId: string
  chatTitle: string
}

let bookmarksCache: BookmarkedChat[] = []
let foldersCache: Folder[] = []
let settingsCache: Settings = DEFAULT_SETTINGS
let isLoggedIn = false
let userAccessCache: { isPro: boolean; checkedAt: number } | null = null
let pendingMenuContext: PendingMenuContext | null = null
let lastInjectedKey: string | null = null
let contextClearTimeout: ReturnType<typeof setTimeout> | null = null
let injectionTimeouts: ReturnType<typeof setTimeout>[] = []
let injectionGeneration = 0
let isInjecting = false

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

const isBookmarked = (chatId: string): boolean =>
  bookmarksCache.some((bookmark) => bookmark.id === chatId)

const canAddBookmark = (): { allowed: boolean; reason?: string } => {
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

const clearPendingMenuContext = () => {
  pendingMenuContext = null
  lastInjectedKey = null
  injectionGeneration++
  clearInjectionTimeouts()

  if (contextClearTimeout) {
    clearTimeout(contextClearTimeout)
    contextClearTimeout = null
  }
}

const scheduleContextClear = () => {
  if (contextClearTimeout) {
    clearTimeout(contextClearTimeout)
  }
  contextClearTimeout = setTimeout(clearPendingMenuContext, MENU_CONTEXT_TTL_MS)
}

const clearInjectionTimeouts = () => {
  for (const timeout of injectionTimeouts) {
    clearTimeout(timeout)
  }
  injectionTimeouts = []
}

const scheduleMenuInjection = () => {
  clearInjectionTimeouts()
  const generation = injectionGeneration

  for (const delay of MENU_INJECTION_DELAYS_MS) {
    injectionTimeouts.push(
      setTimeout(() => {
        if (generation !== injectionGeneration || !pendingMenuContext) return
        tryInjectIntoVisibleMenu()
      }, delay)
    )
  }
}

const clearTemplateSpecificAttributes = (button: HTMLElement) => {
  for (const attribute of [
    "data-test-id",
    "id",
    "jslog",
    "jscontroller",
    "jsaction",
    "jsname",
    "aria-describedby",
    "aria-labelledby"
  ]) {
    button.removeAttribute(attribute)
  }

  for (const className of [
    "cdk-focused",
    "cdk-keyboard-focused",
    "cdk-program-focused",
    "cdk-mouse-focused",
    "mat-mdc-menu-item-highlighted",
    "active"
  ]) {
    button.classList.remove(className)
  }
}

const updateMenuItemLabel = (button: HTMLElement, label: string) => {
  const gemLabel = button.querySelector(".label-container .label")
  if (gemLabel instanceof HTMLElement) {
    const innerSpan = gemLabel.querySelector("span")
    if (innerSpan) {
      innerSpan.textContent = label
      return
    }
    gemLabel.textContent = label
    return
  }

  const textContainer = button.querySelector(".mat-mdc-menu-item-text")
  if (textContainer instanceof HTMLElement) {
    const styledLabel = textContainer.querySelector(
      ".menu-text, .gds-body-m, .gds-label-m, .subtitle"
    )
    if (styledLabel) {
      styledLabel.textContent = label
      return
    }
    textContainer.textContent = label
    return
  }

  button.textContent = label
}

const setMenuItemLucideIcon = (button: HTMLElement, svgHtml: string) => {
  const icon = button.querySelector("mat-icon")
  if (!(icon instanceof HTMLElement)) return

  icon.classList.remove("lumi-symbols", "google-symbols", "material-icons")
  icon.removeAttribute("fonticon")
  icon.removeAttribute("data-mat-icon-name")
  icon.style.fontFamily = ""
  icon.style.display = "inline-flex"
  icon.style.alignItems = "center"
  icon.style.justifyContent = "center"
  icon.style.width = "20px"
  icon.style.height = "20px"
  icon.style.fontSize = "20px"
  icon.innerHTML = svgHtml
  icon.setAttribute("aria-hidden", "true")
}

const createMenuItemFromTemplate = (
  menuPanel: HTMLElement,
  type: "bookmark" | "folder",
  label: string,
  iconSvg: string,
  onClick: () => void
): HTMLElement | null => {
  const template = findTemplateMenuItem(
    menuPanel,
    Object.values(INJECTED_CLASS_NAMES)
  )
  if (!template) return null

  const item = template.cloneNode(true) as HTMLElement
  clearTemplateSpecificAttributes(item)
  item.dataset.gemfoldersMenuItem = type
  item.classList.add(INJECTED_CLASS_NAMES[type])
  item.setAttribute("role", "menuitem")
  item.setAttribute("tabindex", "0")
  item.setAttribute("aria-disabled", "false")
  item.title = label
  item.setAttribute("aria-label", label)

  if (item instanceof HTMLButtonElement) {
    item.disabled = false
  }

  setMenuItemLucideIcon(item, iconSvg)
  updateMenuItemLabel(item, label)

  item.addEventListener(
    "click",
    (event) => {
      event.preventDefault()
      event.stopPropagation()
      clearPendingMenuContext()
      closeNativeConversationMenu()
      onClick()
    },
    { capture: true }
  )

  return item
}

const handleBookmarkClick = (chatId: string, chatTitle: string) => {
  const chatUrl = `https://gemini.google.com/app/${chatId}`
  const wasBookmarked = isBookmarked(chatId)

  if (wasBookmarked) {
    removeBookmark(chatId)
      .then((updatedBookmarks) => {
        bookmarksCache = updatedBookmarks
        globalThis.dispatchEvent(
          new CustomEvent("gemfolders-bookmark-changed", {
            detail: { chatId, isBookmarked: false, action: "removed" }
          })
        )
      })
      .catch((error) => {
        console.error("[Gemini Folders] Failed to remove bookmark:", error)
      })
    return
  }

  const { allowed, reason } = canAddBookmark()
  if (!allowed) {
    globalThis.dispatchEvent(
      new CustomEvent("gemfolders-show-paywall", {
        detail: { reason }
      })
    )
    return
  }

  addBookmark({ id: chatId, title: chatTitle, url: chatUrl })
    .then((updatedBookmarks) => {
      bookmarksCache = updatedBookmarks
      globalThis.dispatchEvent(
        new CustomEvent("gemfolders-bookmark-changed", {
          detail: { chatId, isBookmarked: true, action: "added" }
        })
      )
      checkUserProStatus()
    })
    .catch((error) => {
      console.error("[Gemini Folders] Failed to add bookmark:", error)
    })
}

const handleFolderClick = (chatId: string, chatTitle: string) => {
  globalThis.dispatchEvent(
    new CustomEvent("gemfolders-add-to-folder", {
      detail: {
        chatId,
        chatTitle,
        chatUrl: `https://gemini.google.com/app/${chatId}`
      }
    })
  )
}

const getInjectionKey = (menuPanel: Element, chatId: string): string => {
  const bookmarked = isBookmarked(chatId)
  const inFolder = isChatInAnyFolder(foldersCache, chatId)
  return `${menuPanel.tagName}:${chatId}:${bookmarked}:${inFolder}:${settingsCache.hideBookmarksFromSidebar}:${settingsCache.hideAddToFolderFromSidebar}`
}

const findDeleteButton = (menuContent: HTMLElement): HTMLElement | null => {
  const deleteButton = menuContent.querySelector(
    '[data-test-id="delete-button"]'
  )
  return deleteButton instanceof HTMLElement ? deleteButton : null
}

const areItemsBeforeDelete = (
  menuContent: HTMLElement,
  deleteButton: HTMLElement
): boolean => {
  const injectedItems = Array.from(
    menuContent.querySelectorAll<HTMLElement>(`[${GEMFOLDERS_MENU_ITEM_ATTR}]`)
  )
  if (injectedItems.length === 0) return false

  let previous = deleteButton.previousElementSibling
  const immediatelyBefore: HTMLElement[] = []

  while (
    previous instanceof HTMLElement &&
    previous.hasAttribute(GEMFOLDERS_MENU_ITEM_ATTR)
  ) {
    immediatelyBefore.unshift(previous)
    previous = previous.previousElementSibling
  }

  if (immediatelyBefore.length !== injectedItems.length) return false

  return immediatelyBefore.every((item, index) => item === injectedItems[index])
}

const insertItemsBeforeDelete = (
  menuContent: HTMLElement,
  items: HTMLElement[]
): boolean => {
  const deleteButton = findDeleteButton(menuContent)
  if (!deleteButton || items.length === 0) return false

  const fragment = document.createDocumentFragment()
  for (const item of items) {
    fragment.appendChild(item)
  }
  deleteButton.before(fragment)

  return areItemsBeforeDelete(menuContent, deleteButton)
}

const relocateExistingItems = (menuContent: HTMLElement): boolean => {
  const deleteButton = findDeleteButton(menuContent)
  if (!deleteButton) return false

  const existingItems = Array.from(
    menuContent.querySelectorAll<HTMLElement>(`[${GEMFOLDERS_MENU_ITEM_ATTR}]`)
  )
  if (existingItems.length === 0) return false

  if (areItemsBeforeDelete(menuContent, deleteButton)) {
    return true
  }

  const orderedItems = [
    existingItems.find(
      (item) => item.dataset.gemfoldersMenuItem === "bookmark"
    ),
    existingItems.find((item) => item.dataset.gemfoldersMenuItem === "folder")
  ].filter((item): item is HTMLElement => item instanceof HTMLElement)

  return insertItemsBeforeDelete(menuContent, orderedItems)
}

const refreshInjectedMenuItems = (menuContent: HTMLElement, chatId: string) => {
  const bookmarkItem = menuContent.querySelector<HTMLElement>(
    '[data-gemfolders-menu-item="bookmark"]'
  )
  if (bookmarkItem) {
    const bookmarked = isBookmarked(chatId)
    const label = getBookmarkMenuLabel(bookmarked)
    updateMenuItemLabel(bookmarkItem, label)
    bookmarkItem.title = label
    bookmarkItem.setAttribute("aria-label", label)
    setMenuItemLucideIcon(bookmarkItem, getBookmarkMenuIconSvg(bookmarked))
  }

  const folderItem = menuContent.querySelector<HTMLElement>(
    '[data-gemfolders-menu-item="folder"]'
  )
  if (folderItem) {
    const inFolder = isChatInAnyFolder(foldersCache, chatId)
    updateMenuItemLabel(folderItem, ADD_TO_FOLDER_MENU_LABEL)
    folderItem.title = ADD_TO_FOLDER_MENU_LABEL
    folderItem.setAttribute("aria-label", ADD_TO_FOLDER_MENU_LABEL)
    setMenuItemLucideIcon(folderItem, getFolderMenuIconSvg(inFolder))
  }
}

const injectItemsIntoMenu = (menuPanel: HTMLElement): boolean => {
  if (!pendingMenuContext || isInjecting) return false

  const { chatId, chatTitle } = pendingMenuContext
  const menuContent = findMenuContent(menuPanel)
  if (!menuContent) return false

  const deleteButton = findDeleteButton(menuContent)
  if (!deleteButton) return false

  const injectionKey = getInjectionKey(menuPanel, chatId)

  if (lastInjectedKey === injectionKey) {
    clearInjectionTimeouts()
    return true
  }

  const existingInjected = menuContent.querySelectorAll(
    `[${GEMFOLDERS_MENU_ITEM_ATTR}]`
  )

  if (existingInjected.length > 0) {
    if (!relocateExistingItems(menuContent)) return false

    refreshInjectedMenuItems(menuContent, chatId)
    lastInjectedKey = injectionKey
    clearInjectionTimeouts()
    scheduleContextClear()
    return true
  }

  isInjecting = true
  try {
    const bookmarked = isBookmarked(chatId)
    const itemsToInsert: HTMLElement[] = []

    if (!settingsCache.hideBookmarksFromSidebar) {
      const bookmarkItem = createMenuItemFromTemplate(
        menuPanel,
        "bookmark",
        getBookmarkMenuLabel(bookmarked),
        getBookmarkMenuIconSvg(bookmarked),
        () => handleBookmarkClick(chatId, chatTitle)
      )
      if (bookmarkItem) itemsToInsert.push(bookmarkItem)
    }

    if (!settingsCache.hideAddToFolderFromSidebar) {
      const inFolder = isChatInAnyFolder(foldersCache, chatId)
      const folderItem = createMenuItemFromTemplate(
        menuPanel,
        "folder",
        ADD_TO_FOLDER_MENU_LABEL,
        getFolderMenuIconSvg(inFolder),
        () => handleFolderClick(chatId, chatTitle)
      )
      if (folderItem) itemsToInsert.push(folderItem)
    }

    if (itemsToInsert.length === 0) return false
    if (!insertItemsBeforeDelete(menuContent, itemsToInsert)) return false

    lastInjectedKey = injectionKey
    clearInjectionTimeouts()
    scheduleContextClear()
    return true
  } finally {
    isInjecting = false
  }
}

const tryInjectIntoVisibleMenu = () => {
  if (!pendingMenuContext || isInjecting) return

  const menuPanel = findNativeMenuPanel()
  if (!menuPanel) return

  injectItemsIntoMenu(menuPanel)
}

const handleActionsMenuClick = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return

  const actionsButton = target.closest(
    '[data-test-id="actions-menu-button"], [data-test-id="conversation-actions-menu-icon-button"], .conversation-actions-container [aria-haspopup="menu"]'
  )
  if (!actionsButton || !isConversationMenuTrigger(actionsButton)) return

  const conversationRow = getConversationFromActionsButton(actionsButton)
  if (!conversationRow) return

  const chatId = extractChatId(conversationRow)
  if (!chatId) return

  pendingMenuContext = {
    chatId,
    chatTitle: extractChatTitle(conversationRow)
  }
  lastInjectedKey = null
  injectionGeneration++

  // Defer injection until after Gemini opens the menu.
  setTimeout(() => {
    if (!pendingMenuContext) return
    scheduleMenuInjection()
    scheduleContextClear()
  }, 0)
}

const cleanupLegacySidebarButtons = () => {
  document
    .querySelectorAll(
      ".gemfolders-organizer-bookmark-btn, .gemfolders-organizer-folder-btn"
    )
    .forEach((button) => button.remove())

  document
    .querySelectorAll(".gemfolders-organizer-actions-wrapper")
    .forEach((wrapper) => {
      const nativeActions = wrapper.querySelector(
        '.conversation-actions-container, [data-test-id="actions-menu-button"], [data-test-id="conversation-actions-menu-icon-button"]'
      )
      if (nativeActions && wrapper.parentElement) {
        ;(nativeActions as HTMLElement).style.cssText = ""
        wrapper.parentElement.appendChild(nativeActions)
      }
      wrapper.remove()
    })

  document
    .querySelectorAll(
      ".gemfolders-organizer-parent-modified, .gemfolders-organizer-title-modified, .gemfolders-organizer-conversation-modified"
    )
    .forEach((element) => {
      element.classList.remove(
        "gemfolders-organizer-parent-modified",
        "gemfolders-organizer-title-modified",
        "gemfolders-organizer-conversation-modified"
      )
    })

  document.getElementById("gemfolders-organizer-settings-styles")?.remove()
  document.body.classList.remove(
    "gemfolders-organizer-hide-bookmarks",
    "gemfolders-organizer-hide-add-to-folder",
    "gemfolders-organizer-native-view"
  )
}

export const setupNativeMenuInjection = async () => {
  cleanupLegacySidebarButtons()

  isLoggedIn = await checkLoginStatus()
  bookmarksCache = await getBookmarks()
  foldersCache = await getFolders()
  settingsCache = await getSettings()
  await checkUserProStatus()

  document.addEventListener("click", (event) =>
    handleActionsMenuClick(event.target)
  )

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return

    if (changes["gemfolders-bookmarks"]) {
      bookmarksCache = changes["gemfolders-bookmarks"].newValue || []
      lastInjectedKey = null
    }

    if (changes["gemfolders-folders"]) {
      foldersCache = changes["gemfolders-folders"].newValue || []
      lastInjectedKey = null
    }

    if (changes["gemfolders-organizer-settings"]) {
      settingsCache =
        changes["gemfolders-organizer-settings"].newValue || DEFAULT_SETTINGS
      lastInjectedKey = null
    }
  })

  globalThis.addEventListener("gemfolders-bookmark-sync", async () => {
    bookmarksCache = await getBookmarks()
    lastInjectedKey = null
  })

  globalThis.addEventListener("gemfolders-folders-updated", async () => {
    foldersCache = await getFolders()
    lastInjectedKey = null
  })
}

export const setupAuthListener = () => {
  supabase.auth.onAuthStateChange(async (_event, session) => {
    isLoggedIn = !!session?.user
    userAccessCache = null
    bookmarksCache = await getBookmarks()
    foldersCache = await getFolders()
    lastInjectedKey = null
  })
}
