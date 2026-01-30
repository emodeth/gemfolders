import { useEffect } from "react"
import { useAuth } from "~context/AuthContext"
import { useSettings } from "~context/SettingsContext"
import { useModal } from "~context/ModalContext"

const OnboardingTrigger = () => {
  const { user, isLoading: authLoading } = useAuth()
  const { settings, isLoading: settingsLoading } = useSettings()
  const { onOpen } = useModal()

  useEffect(() => {
    if (authLoading || settingsLoading) return
    if (user && !settings.hasSeenOnboarding) {
      onOpen('onboarding')
    }
  }, [user, settings.hasSeenOnboarding, authLoading, settingsLoading, onOpen])

  return null
}

export default OnboardingTrigger
