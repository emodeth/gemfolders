export interface Settings {
  language: "en" | "es" | "de" | "tr"
  languagePreferenceSet: boolean
  openOnStartup: boolean
  hideBookmarksFromSidebar: boolean
  hideFoldersFromSidebar: boolean
  hideAddToFolderFromSidebar: boolean
  sidebarButtonPosition: "top" | "bottom"
  hasSeenOnboarding: boolean
}

const SETTINGS_KEY = "gemfolders-organizer-settings"

export const DEFAULT_SETTINGS: Settings = {
  language: "en",
  languagePreferenceSet: false,
  openOnStartup: false,
  hideBookmarksFromSidebar: false,
  hideFoldersFromSidebar: false,
  hideAddToFolderFromSidebar: false,
  sidebarButtonPosition: "bottom",
  hasSeenOnboarding: false
}

export const getSettings = (): Promise<Settings> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([SETTINGS_KEY], (result) => {
      const storedSettings = result[SETTINGS_KEY] || {}
      const languagePreferenceSet =
        storedSettings.languagePreferenceSet ??
        (storedSettings.language && storedSettings.language !== "en") ??
        false
      const detectedLanguage = languagePreferenceSet
        ? undefined
        : getLanguageFromUrl(globalThis.location?.href)

      resolve({
        ...DEFAULT_SETTINGS,
        ...storedSettings,
        ...(detectedLanguage ? { language: detectedLanguage } : {}),
        languagePreferenceSet
      })
    })
  })
}

export const getLanguageFromUrl = (
  url: string | undefined
): Settings["language"] | undefined => {
  if (!url) return undefined

  try {
    const language = new URL(url).searchParams.get("hl")?.toLowerCase().split("-")[0]
    return language === "en" || language === "es" || language === "de" || language === "tr"
      ? language
      : undefined
  } catch {
    return undefined
  }
}

export const saveSettings = (settings: Settings): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [SETTINGS_KEY]: settings }, () => {
      resolve()
    })
  })
}
