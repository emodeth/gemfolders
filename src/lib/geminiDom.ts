const CONVERSATION_ROW_SELECTORS = [
  '[data-test-id="conversation"]',
  ".conversation",
  'a[data-test-id="conversation"][href]'
] as const

const TITLE_SELECTORS = [
  '[data-test-id="conversation-title"]',
  ".gds-label-l",
  ".conversation-title-text",
  ".conversation-title",
  "h3"
] as const

const SIDEBAR_ROOT_SELECTORS = [
  '[data-test-id="side-nav"]',
  '[role="navigation"]',
  "side-navigation",
  "nav"
] as const

const SCROLL_CONTAINER_SELECTORS = [
  "infinite-scroller.chat-history",
  ".chat-history-scroll-container",
  "infinite-scroller",
  '[data-test-id="conversation-list"]',
  ".conversation-list"
] as const

const ACTIONS_CONTAINER_SELECTORS = [
  ".conversation-actions-container",
  '[data-test-id="actions-menu-button"]'
] as const

const JSLOG_CHAT_ID_REGEX = /\["c_([^"]+)"/
const JSLOG_APP_PATH_REGEX = /\/app\/([^/?#]+)/
const JSLOG_GEM_PATH_REGEX = /\/gem\/[^/]+\/([^/?#]+)/

export const extractChatIdFromJslog = (jslog: string): string | null => {
  const result = JSLOG_CHAT_ID_REGEX.exec(jslog)
  return result ? result[1] : null
}

export const extractChatIdFromHref = (href: string): string | null => {
  if (!href) return null
  try {
    const parsed = new URL(href, globalThis.location.origin)
    const appMatch = JSLOG_APP_PATH_REGEX.exec(parsed.pathname)
    if (appMatch?.[1]) return appMatch[1]
    const gemMatch = JSLOG_GEM_PATH_REGEX.exec(parsed.pathname)
    if (gemMatch?.[1]) return gemMatch[1]
    return null
  } catch {
    return null
  }
}

const isGemLabel = (text: string | null | undefined): boolean => {
  const normalized = (text || "").trim().toLowerCase()
  return normalized === "gem" || normalized === "gems"
}

const isMeaningfulTitle = (text: string | null | undefined): boolean => {
  if (!text) return false
  const trimmed = text.trim()
  return trimmed.length >= 2 && !isGemLabel(trimmed)
}

export const getConversationRow = (element: Element): HTMLElement | null => {
  if (element.matches(CONVERSATION_ROW_SELECTORS.join(","))) {
    return element as HTMLElement
  }
  return element.closest(CONVERSATION_ROW_SELECTORS.join(",")) as HTMLElement | null
}

const getSidebarRoot = (): Element | null => {
  for (const selector of SIDEBAR_ROOT_SELECTORS) {
    const element = document.querySelector(selector)
    if (element) return element
  }
  return null
}

export const queryConversationElements = (): HTMLElement[] => {
  const sidebar = getSidebarRoot()
  const seen = new Set<Element>()
  const results: HTMLElement[] = []

  for (const selector of CONVERSATION_ROW_SELECTORS) {
    const scope = sidebar ?? document
    scope.querySelectorAll(selector).forEach((element) => {
      const row = getConversationRow(element)
      if (!row || seen.has(row)) return
      seen.add(row)
      results.push(row)
    })
  }

  return results
}

export const extractChatId = (element: Element): string | null => {
  const row = getConversationRow(element) ?? element

  const jslog =
    row.getAttribute("jslog") ||
    row.closest("[jslog]")?.getAttribute("jslog") ||
    ""
  const fromJslog = extractChatIdFromJslog(jslog)
  if (fromJslog) return fromJslog

  const link = row.querySelector(
    'a[href*="/app/"], a[href*="/gem/"]'
  ) as HTMLAnchorElement | null
  if (link?.href) {
    const fromHref = extractChatIdFromHref(link.href)
    if (fromHref) return fromHref
  }

  if (row instanceof HTMLAnchorElement && row.href) {
    return extractChatIdFromHref(row.href)
  }

  return null
}

const extractTitleFromLinkText = (link?: HTMLAnchorElement | null): string | null => {
  if (!link) return null
  const text = (link.innerText || "").trim()
  if (!text) return null

  const parts = text
    .split("\n")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !isGemLabel(part))
    .filter((part) => part.length >= 2)

  if (parts.length === 0) return null
  return parts.reduce((longest, part) => (part.length > longest.length ? part : longest), parts[0])
}

export const extractChatTitle = (element: Element): string => {
  const row = getConversationRow(element) ?? element

  for (const selector of TITLE_SELECTORS) {
    const titleElement = row.querySelector(selector)
    const title = titleElement?.textContent?.trim()
    if (title && isMeaningfulTitle(title)) {
      return title
    }
  }

  const link = row.querySelector(
    'a[href*="/app/"], a[href*="/gem/"]'
  ) as HTMLAnchorElement | null

  const ariaTitle = link?.getAttribute("aria-label")?.trim()
  if (ariaTitle && isMeaningfulTitle(ariaTitle)) {
    return ariaTitle
  }

  const linkTitle = link?.getAttribute("title")?.trim()
  if (linkTitle && isMeaningfulTitle(linkTitle)) {
    return linkTitle
  }

  const fromLinkText = extractTitleFromLinkText(link)
  if (fromLinkText && isMeaningfulTitle(fromLinkText)) {
    return fromLinkText
  }

  const label = row.querySelector(".gds-body-m, .gds-label-m, .subtitle")
  const labelText = label?.textContent?.trim()
  if (labelText && isMeaningfulTitle(labelText)) {
    return labelText
  }

  const firstLine =
    (row.textContent || "")
      .split("\n")
      .map((line) => line.trim())
      .find((line) => isMeaningfulTitle(line)) || ""

  if (firstLine) {
    return firstLine.slice(0, 120)
  }

  return "Untitled Chat"
}

export const findConversationTitleElement = (element: Element): HTMLElement | null => {
  const row = getConversationRow(element) ?? element

  for (const selector of TITLE_SELECTORS) {
    const titleElement = row.querySelector(selector)
    if (titleElement instanceof HTMLElement) {
      return titleElement
    }
  }

  const link = row.querySelector('a[href*="/app/"], a[href*="/gem/"]')
  return link instanceof HTMLElement ? link : null
}

const findScrollableElement = (root: Element): Element | null => {
  const candidates = [
    ...SCROLL_CONTAINER_SELECTORS.map((selector) => root.querySelector(selector)),
    root.querySelector('[style*="overflow"]')
  ].filter(Boolean) as Element[]

  for (const candidate of candidates) {
    if (candidate.scrollHeight > candidate.clientHeight) {
      return candidate
    }
  }

  return candidates[0] ?? null
}

export const getSidebarScrollContainer = (): Element | null => {
  const sidebar = getSidebarRoot()
  if (sidebar) {
    const scrollable = findScrollableElement(sidebar)
    if (scrollable) return scrollable
  }

  for (const selector of SCROLL_CONTAINER_SELECTORS) {
    const element = document.querySelector(selector)
    if (element) return element
  }

  const fallback = document.querySelector('[role="navigation"] [style*="overflow"]')
  return fallback
}

export const findConversationActionsContainer = (
  conversationElement: Element
): HTMLElement | null => {
  const row = getConversationRow(conversationElement) ?? conversationElement
  const parentContainer = row.parentElement ?? row

  for (const selector of ACTIONS_CONTAINER_SELECTORS) {
    const actions = parentContainer.querySelector(selector)
    if (actions instanceof HTMLElement) {
      return actions
    }
  }

  for (const selector of ACTIONS_CONTAINER_SELECTORS) {
    const actions = row.querySelector(selector)
    if (actions instanceof HTMLElement) {
      return actions
    }
  }

  return null
}

export const getConversationParentContainer = (conversationElement: Element): HTMLElement | null => {
  const row = getConversationRow(conversationElement) ?? conversationElement
  return row.parentElement ?? (row instanceof HTMLElement ? row : null)
}

export const isConversationElement = (element: Element): boolean => {
  return !!getConversationRow(element)
}

export const isActionsContainerElement = (element: Element): boolean => {
  return element.matches(ACTIONS_CONTAINER_SELECTORS.join(","))
}

const NOTEBOOK_SECTION_SELECTORS = [
  '[data-test-id="notebooks-section"]',
  '[data-test-id="notebooks-list"]',
  '[data-test-id="notebook-list"]',
  '[data-test-id="notebooks"]',
  ".notebooks-section",
  ".notebook-list"
] as const

const RECENTS_SECTION_SELECTORS = [
  ".chat-history-list",
  '[data-test-id="conversation-list"]',
  '[data-test-id="recent-conversations"]',
  '[data-test-id*="recent"]',
  "infinite-scroller.chat-history"
] as const

const NOTEBOOK_LINK_SELECTOR =
  'a[href*="/notebook"], a[href*="notebooklm"], [data-test-id*="notebook"]'

const containsNotebookMarkers = (element: Element): boolean => {
  return element.querySelector(NOTEBOOK_LINK_SELECTOR) !== null
}

const containsRecentsMarkers = (element: Element): boolean => {
  for (const selector of RECENTS_SECTION_SELECTORS) {
    if (element.matches(selector) || element.querySelector(selector)) {
      return true
    }
  }

  return element.querySelector('[data-test-id="conversation"], .conversation') !== null
}

const findNotebookSectionAncestor = (
  element: Element,
  sidebar: Element,
  maxDepth = 10
): Element | null => {
  let current: Element | null = element
  let bestMatch: Element | null = null

  for (let depth = 0; depth < maxDepth && current && sidebar.contains(current); depth++) {
    if (
      current !== sidebar &&
      containsNotebookMarkers(current) &&
      !containsRecentsMarkers(current)
    ) {
      bestMatch = current
    }
    current = current.parentElement
  }

  return bestMatch
}

export const findNotebooksSectionContainer = (): Element | null => {
  const sidebar = getSidebarRoot()
  if (!sidebar) return null

  for (const selector of NOTEBOOK_SECTION_SELECTORS) {
    const section = sidebar.querySelector(selector)
    if (section) return section
  }

  const notebookLinks = sidebar.querySelectorAll('a[href*="/notebook"], a[href*="notebooklm"]')
  if (notebookLinks.length > 0) {
    const section = findNotebookSectionAncestor(
      notebookLinks[notebookLinks.length - 1],
      sidebar
    )
    if (section) return section
  }

  const notebookMarker = sidebar.querySelector(NOTEBOOK_LINK_SELECTOR)
  if (notebookMarker) {
    const section = findNotebookSectionAncestor(notebookMarker, sidebar)
    if (section) return section
  }

  for (const selector of RECENTS_SECTION_SELECTORS) {
    const recentsSection = sidebar.querySelector(selector)
    const previousSection = recentsSection?.previousElementSibling
    if (previousSection && containsNotebookMarkers(previousSection)) {
      return previousSection
    }
  }

  return null
}

export const findRecentsSectionContainer = (): Element | null => {
  const sidebar = getSidebarRoot()
  if (!sidebar) return null

  for (const selector of RECENTS_SECTION_SELECTORS) {
    const section = sidebar.querySelector(selector)
    if (section) return section
  }

  return null
}

export type FolderWidgetInjectionPoint = {
  element: Element
  position: "before" | "after"
}

export const findFolderWidgetInjectionPoint = (): FolderWidgetInjectionPoint | null => {
  const notebooksSection = findNotebooksSectionContainer()
  if (notebooksSection) {
    return { element: notebooksSection, position: "after" }
  }

  const recentsSection = findRecentsSectionContainer()
  if (recentsSection) {
    return { element: recentsSection, position: "before" }
  }

  return null
}

export const waitForConversationElements = (
  timeoutMs = 3000,
  pollIntervalMs = 100
): Promise<HTMLElement[]> => {
  const existing = queryConversationElements()
  if (existing.length > 0) {
    return Promise.resolve(existing)
  }

  return new Promise((resolve) => {
    const deadline = Date.now() + timeoutMs
    let observer: MutationObserver | null = null

    const finish = () => {
      observer?.disconnect()
      resolve(queryConversationElements())
    }

    const check = () => {
      const conversations = queryConversationElements()
      if (conversations.length > 0 || Date.now() >= deadline) {
        finish()
        return true
      }
      return false
    }

    if (check()) return

    observer = new MutationObserver(() => {
      check()
    })

    const sidebar = getSidebarRoot()
    observer.observe(sidebar ?? document.body, {
      childList: true,
      subtree: true
    })

    const interval = setInterval(() => {
      if (check()) {
        clearInterval(interval)
      }
    }, pollIntervalMs)
  })
}
