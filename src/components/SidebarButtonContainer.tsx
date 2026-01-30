import React from "react"

import { useSettings } from "~context/SettingsContext"

import SidebarButton from "./SidebarButton"

const SidebarButtonContainer = ({ onClick }: { onClick: () => void }) => {
  const { settings, isLoading } = useSettings()

  if (isLoading) return null

  const positionClass =
    settings.sidebarButtonPosition === "bottom"
      ? "organizer-bottom-8"
      : "organizer-top-[72px]"

  return (
    <div
      className={`organizer-z-50 organizer-flex organizer-fixed ${positionClass} organizer-right-4 organizer-transition-all organizer-duration-300`}>
      <SidebarButton onClick={onClick} />
    </div>
  )
}

export default SidebarButtonContainer
