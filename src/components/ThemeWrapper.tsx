import React from "react"
import { useTheme } from "../context/ThemeContext"
import { useI18n } from "../lib/i18n"

export const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { effectiveTheme } = useTheme()
  const { language } = useI18n()

  return (
    <div
      data-theme={effectiveTheme}
      lang={language}
      className="organizer-w-full organizer-h-full organizer-font-sans"
      style={{
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {children}
    </div>
  )
}
