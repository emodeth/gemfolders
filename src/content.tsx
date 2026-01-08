import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useState } from "react"
import { ModalProvider } from "./context/ModalContext"

import SidebarButton from "./components/SidebarButton"
import Sidebar from "./components/Sidebar"

export const config: PlasmoCSConfig = {
  matches: ["https://gemini.google.com/*"]
}

export const getStyle = (): HTMLStyleElement => {
  const baseFontSize = 16

  let updatedCssText = cssText.replaceAll(":root", ":host(plasmo-csui)")
  const remRegex = /([\d.]+)rem/g
  updatedCssText = updatedCssText.replace(remRegex, (match, remValue) => {
    const pixelsValue = parseFloat(remValue) * baseFontSize

    return `${pixelsValue}px`
  })

  const styleElement = document.createElement("style")

  styleElement.textContent = updatedCssText

  return styleElement
}

const PlasmoOverlay = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <ModalProvider>
      <div className="organizer-z-50 organizer-flex organizer-fixed organizer-top-[72px] organizer-right-4">
        <SidebarButton onClick={toggleSidebar} />
      </div>
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
    </ModalProvider>
  )
}

export default PlasmoOverlay
