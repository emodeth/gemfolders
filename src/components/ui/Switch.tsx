
import React from "react"
import { cn } from "~lib/utils"

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  className
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "organizer-relative organizer-inline-flex organizer-h-5 organizer-w-9 organizer-items-center organizer-rounded-full organizer-transition-colors focus-visible:organizer-outline-none focus-visible:organizer-ring-2 focus-visible:organizer-ring-ring focus-visible:organizer-ring-offset-2 focus-visible:organizer-ring-offset-background disabled:organizer-cursor-not-allowed disabled:organizer-opacity-50",
        checked ? "organizer-bg-[var(--color-primary)]" : "organizer-bg-bg-input",
        className
      )}
    >
      <span
        className={cn(
          "organizer-pointer-events-none organizer-block organizer-h-4 organizer-w-4 organizer-rounded-full organizer-bg-white organizer-ring-0 organizer-shadow-lg organizer-transition-transform",
          checked ? "organizer-translate-x-[18px]" : "organizer-translate-x-0.5"
        )}
      />
    </button>
  )
}
