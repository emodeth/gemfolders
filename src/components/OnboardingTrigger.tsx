import { useEffect } from "react"
import { useAuth } from "~context/AuthContext"
import { useSettings } from "~context/SettingsContext"
import { useModal } from "~context/ModalContext"

// Component that triggers onboarding modal for first-time logged-in users
const OnboardingTrigger = () => {
  const { user, isLoading: authLoading } = useAuth()
  const { settings, isLoading: settingsLoading } = useSettings()
  const { onOpen } = useModal()

  useEffect(() => {
    // Wait for both auth and settings to load
    if (authLoading || settingsLoading) return

    // Only show onboarding if user is logged in and hasn't seen it yet
    if (user && !settings.hasSeenOnboarding) {
      onOpen('onboarding')
    }
  }, [user, settings.hasSeenOnboarding, authLoading, settingsLoading, onOpen])

  return null
}

export default OnboardingTrigger
