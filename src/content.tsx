import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import { ModalProvider } from "~context/ModalContext"
import { FolderProvider } from "~context/FolderContext"
import { ChatProvider } from "~context/ChatContext"
import { BookmarkProvider } from "~context/BookmarkContext"
import { ThemeProvider } from "~context/ThemeContext"
import { SettingsProvider } from "~context/SettingsContext"
import { AuthProvider } from "~context/AuthContext"
import { SubscriptionProvider } from "~context/SubscriptionContext"
import { TierLimitsProvider } from "~context/TierLimitsContext"
import { ThemeWrapper } from "~components/ThemeWrapper"
import ToastProvider from "~components/ToastProvider"
import { injectBookmarkButtons, setupAuthListener } from "~lib/injectBookmarkButtons"
import { setupFolderWidgetInjection } from "~lib/injectFolderWidget"
import { getSettings } from "~lib/settings"
import { setupDeleteHandler } from "~lib/deleteHandler"
import { setupRenameHandler } from "~lib/renameHandler"

import Sidebar from "./components/Sidebar"
import ModalManager from "./components/ModalManager"
import OnboardingTrigger from "./components/OnboardingTrigger"
import SidebarButtonContainer from "./components/SidebarButtonContainer"




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

  useEffect(() => {
    getSettings().then((settings) => {
      if (settings.openOnStartup) {
        setIsSidebarOpen(true)
      }
    })
  }, [])

  const openSidebar = () => {
    setIsSidebarOpen(true)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      injectBookmarkButtons()
      setupAuthListener()
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setupFolderWidgetInjection()
    }, 1500)

    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    setupDeleteHandler()
    setupRenameHandler()
  }, [])

  useEffect(() => {
    const handleOpenSidebar = () => {
      openSidebar()
    }

    globalThis.addEventListener("gemini-organizer-open-sidebar", handleOpenSidebar)

    return () => {
      globalThis.removeEventListener("gemini-organizer-open-sidebar", handleOpenSidebar)
    }
  }, [])

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

  useEffect(() => {
    const handleShowPaywall = (event: CustomEvent) => {
      const { reason } = event.detail || {}
      if (reason) {
        sessionStorage.setItem("gemini-paywall-reason", reason)
      }
      openSidebar()
      setTimeout(() => {
        globalThis.dispatchEvent(new CustomEvent("gemini-open-paywall-modal", { detail: { reason } }))
      }, 100)
    }

    globalThis.addEventListener("gemini-show-paywall", handleShowPaywall as EventListener)

    return () => {
      globalThis.removeEventListener("gemini-show-paywall", handleShowPaywall as EventListener)
    }
  }, [])

  return (
    <SettingsProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <ThemeProvider>
            <ThemeWrapper>
              <ToastProvider />
              <ModalProvider>
                <FolderProvider>
                  <BookmarkProvider>
                    <ChatProvider>
                      <TierLimitsProvider>
                        <OnboardingTrigger />
                        <SidebarButtonContainer onClick={toggleSidebar} />
                        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
                        <ModalManager />
                      </TierLimitsProvider>
                    </ChatProvider>
                  </BookmarkProvider>
                </FolderProvider>
              </ModalProvider>
            </ThemeWrapper>
          </ThemeProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </SettingsProvider>
  )
}

export default PlasmoOverlay

