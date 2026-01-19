import React, { type ReactNode } from "react"

import { cn } from "../lib/utils"

interface TooltipProps {
  children: ReactNode
  text: string
  position?: "top" | "bottom" | "left" | "right"
  className?: string
}

const Tooltip = ({
  children,
  text,
  position = "bottom",
  className
}: TooltipProps) => {
  const positionClasses = {
    top: "organizer-bottom-full organizer-left-1/2 organizer--translate-x-1/2 organizer-mb-1 organizer-flex-col-reverse",
    bottom:
      "organizer-top-full organizer-left-1/2 organizer--translate-x-1/2 organizer-mt-1 organizer-flex-col",
    left: "organizer-right-full organizer-top-1/2 organizer--translate-y-1/2 organizer-mr-1 organizer-flex-row-reverse",
    right:
      "organizer-left-full organizer-top-1/2 organizer--translate-y-1/2 organizer-ml-1 organizer-flex-row"
  }

  const arrowClasses = {
    top: "organizer--mt-1",
    bottom: "organizer--mb-1",
    left: "organizer--ml-1",
    right: "organizer--mr-1"
  }

  const originClasses = {
    top: "organizer-origin-bottom",
    bottom: "organizer-origin-top",
    left: "organizer-origin-right",
    right: "organizer-origin-left"
  }

  return (
    <div
      className={cn(
        "organizer-group organizer-relative organizer-flex organizer-items-center organizer-justify-center",
        className
      )}>
      {children}

      <div
        className={`organizer-absolute organizer-flex organizer-items-center organizer-z-50 organizer-transition-all organizer-duration-200 organizer-ease-in-out group-hover:organizer-delay-300 organizer-opacity-0 organizer-invisible group-hover:organizer-opacity-100 group-hover:organizer-visible organizer-scale-95 group-hover:organizer-scale-100 organizer-drop-shadow-md ${positionClasses[position]} ${originClasses[position]}`}>
        <div
          className={`organizer-z-20 organizer-h-2 organizer-w-2 organizer-rotate-45 organizer-bg-tooltip-bg ${arrowClasses[position]}`}
        />
        <span className="organizer-z-10 organizer-relative organizer-rounded-md organizer-bg-tooltip-bg organizer-px-2 organizer-py-1.5 organizer-text-[14px] organizer-text-tooltip-text organizer-whitespace-nowrap">
          {text}
        </span>
      </div>
    </div>
  )
}

export default Tooltip

