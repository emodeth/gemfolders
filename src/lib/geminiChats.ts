export interface GeminiChat {
  id: string
  title: string
  url: string
  lastUpdated?: string
  sortIndex?: number
}

const CHATS_STORAGE_KEY = "gemini-chats"

const extractChatIdFromJslog = (jslog: string): string | null => {
  const regex = /\["c_([^"]+)"/
  const result = regex.exec(jslog)
  return result ? result[1] : null
}

export const scrapeGeminiChats = (): GeminiChat[] => {
  const chats: GeminiChat[] = []

  const conversationElements = document.querySelectorAll(".conversation")

  conversationElements.forEach((element, index) => {
    const titleElement = element.querySelector(".conversation-title")
    const title = titleElement?.textContent?.trim() || "Untitled Chat"

    const jslog = element.getAttribute("jslog") || ""
    const chatId = extractChatIdFromJslog(jslog)

    if (chatId) {
      chats.push({
        id: chatId,
        title,
        url: `https://gemini.google.com/app/${chatId}`,
        lastUpdated: new Date().toISOString(),
        sortIndex: index
      })
    }
  })

  return chats
}

export const getCachedChats = async (): Promise<GeminiChat[]> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([CHATS_STORAGE_KEY], (result) => {
      resolve(result[CHATS_STORAGE_KEY] || [])
    })
  })
}

export const saveCachedChats = async (chats: GeminiChat[]): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [CHATS_STORAGE_KEY]: chats }, () => {
      resolve()
    })
  })
}

export const fetchGeminiChats = async (): Promise<GeminiChat[]> => {
  const scrapedChats = scrapeGeminiChats()

  const cachedChats = await getCachedChats()

  const chatMap = new Map<string, GeminiChat>()

  cachedChats.forEach((chat) => {
    chatMap.set(chat.id, chat)
  })

  scrapedChats.forEach((chat) => {
    chatMap.set(chat.id, chat)
  })

  const mergedChats = Array.from(chatMap.values())
  await saveCachedChats(mergedChats)

  return mergedChats
}

export const refreshGeminiChats = async (): Promise<GeminiChat[]> => {
  const chats = scrapeGeminiChats()
  await saveCachedChats(chats)
  return chats
}

export const clearCachedChats = async (): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.remove([CHATS_STORAGE_KEY], () => {
      resolve()
    })
  })
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getScrollableContainer = (): Element | null => {
  const infiniteScroller = document.querySelector("infinite-scroller")
  if (infiniteScroller) return infiniteScroller

  const sidebarSelectors = [
    '[role="navigation"] [style*="overflow"]',
    ".conversation-list",
    '[data-test-id="conversation-list"]'
  ]

  for (const selector of sidebarSelectors) {
    const element = document.querySelector(selector)
    if (element) return element
  }

  return null
}

export const loadMoreGeminiChats = async (
  onProgress?: (loaded: number) => void
): Promise<GeminiChat[]> => {
  const scrollContainer = getScrollableContainer()

  if (!scrollContainer) {
    console.warn("Could not find Gemini sidebar scroll container")
    const cached = await getCachedChats()
    return cached
  }

  const cachedChats = await getCachedChats()
  const chatMap = new Map<string, GeminiChat>()

  cachedChats.forEach((chat) => {
    chatMap.set(chat.id, chat)
  })

  let previousCount = 0
  let currentCount = document.querySelectorAll(".conversation").length
  let noNewChatsCount = 0
  const maxScrollAttempts = 10

  for (let i = 0; i < maxScrollAttempts; i++) {
    scrollContainer.scrollTop = scrollContainer.scrollHeight

    await delay(800)

    const newChats = scrapeGeminiChats()
    newChats.forEach((chat) => {
      chatMap.set(chat.id, chat)
    })

    currentCount = document.querySelectorAll(".conversation").length

    if (onProgress) {
      onProgress(chatMap.size)
    }

    if (currentCount === previousCount) {
      noNewChatsCount++
      if (noNewChatsCount >= 2) {
        break
      }
    } else {
      noNewChatsCount = 0
    }

    previousCount = currentCount
  }

  scrollContainer.scrollTop = 0

  const allChats = Array.from(chatMap.values())
  await saveCachedChats(allChats)

  return allChats
}
