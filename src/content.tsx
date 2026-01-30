import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import { ModalProvider } from "~context/ModalContext"
import { FolderProvider } from "~context/FolderContext"
import { ChatProvider } from "~context/ChatContext"
import { BookmarkProvider } from "~context/BookmarkContext"
import { ThemeProvider } from "~context/ThemeContext"
import { SettingsProvider, useSettings } from "~context/SettingsContext"
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

import SidebarButton from "./components/SidebarButton"
import Sidebar from "./components/Sidebar"
import ModalManager from "./components/ModalManager"
import OnboardingTrigger from "./components/OnboardingTrigger"


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

  // Inject bookmark buttons into Gemini's native sidebar conversations
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      injectBookmarkButtons()
      setupAuthListener() // Listen for auth changes to show/hide buttons
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [])

  // Inject folder widget into Gemini's native sidebar
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

  // Listen for open sidebar event from the folder widget
  useEffect(() => {
    const handleOpenSidebar = () => {
      openSidebar()
    }

    globalThis.addEventListener("gemini-organizer-open-sidebar", handleOpenSidebar)

    return () => {
      globalThis.removeEventListener("gemini-organizer-open-sidebar", handleOpenSidebar)
    }
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

  // Listen for paywall events from injected buttons (outside React)
  useEffect(() => {
    const handleShowPaywall = (event: CustomEvent) => {
      const { reason } = event.detail || {}
      // Store reason in session storage for the modal to pick up
      if (reason) {
        sessionStorage.setItem("gemini-paywall-reason", reason)
      }
      // Open sidebar and dispatch event to show paywall modal
      openSidebar()
      // Small delay to ensure sidebar is open before showing modal
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

