export interface Settings {
  openOnStartup: boolean
  hideBookmarksFromSidebar: boolean
  hideFoldersFromSidebar: boolean
  hideAddToFolderFromSidebar: boolean
}

const SETTINGS_KEY = "gemini-organizer-settings"

export const DEFAULT_SETTINGS: Settings = {
  openOnStartup: false,
  hideBookmarksFromSidebar: false,
  hideFoldersFromSidebar: false,
  hideAddToFolderFromSidebar: false
}

export const getSettings = (): Promise<Settings> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([SETTINGS_KEY], (result) => {
      resolve(result[SETTINGS_KEY] || DEFAULT_SETTINGS)
    })
  })
}

export const saveSettings = (settings: Settings): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [SETTINGS_KEY]: settings }, () => {
      resolve()
    })
  })
}
