
import React, { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { getSettings, saveSettings, type Settings, DEFAULT_SETTINGS } from "~lib/settings"

interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getSettings().then((loadedSettings) => {
      setSettings(loadedSettings)
      setIsLoading(false)
    })
  }, [])

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    await saveSettings(updated)
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
