import { ChevronDown, Languages } from "lucide-react"
import React from "react"

import { LANGUAGE_OPTIONS, type Language } from "~lib/i18n"
import { cn } from "~lib/utils"
import { useTheme } from "~context/ThemeContext"

interface LanguageSelectProps {
  id: string
  value: Language
  onChange: (language: Language) => void
  className?: string
}

const LanguageSelect: React.FC<LanguageSelectProps> = ({
  id,
  value,
  onChange,
  className
}) => {
  const { effectiveTheme } = useTheme()

  return (
    <div className={cn("organizer-relative organizer-min-w-[160px]", className)}>
      <Languages
        aria-hidden="true"
        size={16}
        className="organizer-pointer-events-none organizer-absolute organizer-left-3 organizer-top-1/2 organizer-z-10 organizer--translate-y-1/2 organizer-text-text-muted"
      />
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as Language)}
        style={{ colorScheme: effectiveTheme }}
        className="organizer-peer organizer-h-10 organizer-w-full organizer-appearance-none organizer-rounded-lg organizer-bg-bg-input organizer-py-2 organizer-pl-10 organizer-pr-10 organizer-text-sm organizer-font-medium organizer-text-text-primary organizer-shadow-sm organizer-outline-none organizer-transition-[background-color,box-shadow,transform] hover:organizer-bg-bg-input-focus focus:organizer-ring-2 focus:organizer-ring-primary/60 active:organizer-scale-[0.96]"
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="organizer-bg-bg-surface organizer-text-text-primary"
          >
            {option.nativeLabel}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        size={16}
        strokeWidth={2}
        className="organizer-pointer-events-none organizer-absolute organizer-right-3 organizer-top-1/2 organizer--translate-y-1/2 organizer-text-text-secondary organizer-transition-transform organizer-duration-200 peer-focus:organizer-rotate-180"
      />
    </div>
  )
}

export default LanguageSelect
