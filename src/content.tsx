import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import { ModalProvider } from "~context/ModalContext"
import { FolderProvider } from "~context/FolderContext"
import { ChatProvider } from "~context/ChatContext"
import { BookmarkProvider } from "~context/BookmarkContext"
import { ThemeProvider } from "~context/ThemeContext"
import { ThemeWrapper } from "~components/ThemeWrapper"
import ToastProvider from "~components/ToastProvider"
import { injectBookmarkButtons } from "~lib/injectBookmarkButtons"

import SidebarButton from "./components/SidebarButton"
import Sidebar from "./components/Sidebar"
import ModalManager from "./components/ModalManager"

export const config: PlasmoCSConfig = {
  matches: ["https://gemini.google.com/*"]
}

export const getStyle = (): HTMLStyleElement => {
  const baseFontSize = 16

  let updatedCssText = cssText.replaceAll(":root", ":host(plasmo-csui)")
  const remRegex = /([\d.]+)rem/g
  updatedCssText = updatedCssText.replaceAll(remRegex, (match, remValue) => {
    const pixelsValue = Number.parseFloat(remValue) * baseFontSize

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

  // Inject bookmark buttons into Gemini's native sidebar conversations
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      injectBookmarkButtons()
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [])

  // Listen for bookmark changes from Gemini's sidebar and show toasts
  useEffect(() => {
    const handleBookmarkChange = (event: CustomEvent) => {
      const { action } = event.detail
      if (action === "added") {
        toast.success("Chat bookmarked")
      } else if (action === "removed") {
        toast.success("Bookmark removed")
      }
    }

    globalThis.addEventListener("gemini-bookmark-changed", handleBookmarkChange as EventListener)

    return () => {
      globalThis.removeEventListener("gemini-bookmark-changed", handleBookmarkChange as EventListener)
    }
  }, [])

  return (
    <ThemeProvider>
      <ThemeWrapper>
        <ToastProvider />
        <ModalProvider>
          <FolderProvider>
            <BookmarkProvider>
              <ChatProvider>
                <div className="organizer-z-50 organizer-flex organizer-fixed organizer-top-[72px] organizer-right-4">
                  <SidebarButton onClick={toggleSidebar} />
                </div>
                <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
                <ModalManager />
              </ChatProvider>
            </BookmarkProvider>
          </FolderProvider>
        </ModalProvider>
      </ThemeWrapper>
    </ThemeProvider>
  )
}

export default PlasmoOverlay

