import React, { type ReactNode } from "react"

interface TooltipProps {
  children: ReactNode
  text: string
}

const Tooltip = ({ children, text }: TooltipProps) => {
  return (
    <div className="organizer-group organizer-relative organizer-flex organizer-items-center organizer-justify-center">

      {children}

      <div className="-organizer-mt-1 organizer-absolute organizer-top-full organizer-flex organizer-flex-col organizer-items-center organizer-z-50 organizer-transition-all organizer-duration-200 organizer-ease-in-out group-hover:organizer-delay-300 organizer-origin-top organizer-opacity-0 organizer-invisible group-hover:organizer-opacity-100 group-hover:organizer-visible organizer-scale-95 group-hover:organizer-scale-100">
        <div className="organizer--mb-1 organizer-h-2 organizer-w-2 organizer-rotate-45 organizer-bg-black" />
        <span className="organizer-relative organizer-z-10 organizer-rounded-md organizer-bg-black organizer-p-2 organizer-text-sm organizer-text-white organizer-shadow-sm organizer-whitespace-nowrap">
          {text}
        </span>
      </div>
    </div>
  )
}

export default Tooltip