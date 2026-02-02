import React from "react"
import { useTheme } from "../context/ThemeContext"

export const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { effectiveTheme } = useTheme()

  return (
    <div
      data-theme={effectiveTheme}
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
