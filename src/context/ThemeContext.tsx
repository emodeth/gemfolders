import React, { createContext, useContext, useEffect, useState } from "react"
import { Storage } from "@plasmohq/storage"

type Theme = "dark" | "light" | "system" | "gemini"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  effectiveTheme: "dark" | "light"
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)
const storage = new Storage()

const getGeminiTheme = (): "dark" | "light" => {
  const body = document.body
  if (body.classList.contains("dark-theme")) {
    return "dark"
  } else if (body.classList.contains("light-theme")) {
    return "light"
  }

  return "dark"
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [theme, setThemeState] = useState<Theme>("gemini")
  const [effectiveTheme, setEffectiveTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    storage.get<Theme>("theme").then((savedTheme) => {
      if (savedTheme) {
        setThemeState(savedTheme)
      }
    })
  }, [])

  useEffect(() => {
    const root = document.querySelector(":root")
    if (!root) return

    const applyTheme = (newTheme: "dark" | "light") => {
      setEffectiveTheme(newTheme)
      document.documentElement.dataset.theme = newTheme
    }

    if (theme === "gemini") {
      const syncGeminiTheme = () => {
        applyTheme(getGeminiTheme())
      }

      syncGeminiTheme()

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "attributes" && mutation.attributeName === "class") {
            syncGeminiTheme()
          }
        }
      })

      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["class"]
      })

      return () => observer.disconnect()
    } else if (theme === "system") {
      const mediaQuery = globalThis.matchMedia("(prefers-color-scheme: dark)")

      const applySystemTheme = () => {
        applyTheme(mediaQuery.matches ? "dark" : "light")
      }

      applySystemTheme()

      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? "dark" : "light")
      }
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    } else {
      applyTheme(theme)
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    storage.set("theme", newTheme)
  }

  const value = React.useMemo(() => ({
    theme,
    setTheme,
    effectiveTheme
  }), [theme, effectiveTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
