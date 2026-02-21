import { useEffect } from "react"
import { useSettings } from "~context/SettingsContext"
import { useModal } from "~context/ModalContext"

const OnboardingTrigger = () => {
  const { settings, isLoading: settingsLoading } = useSettings()
  const { onOpen } = useModal()

  useEffect(() => {
    if (settingsLoading) return
    if (!settings.hasSeenOnboarding) {
      onOpen('onboarding')
    }
  }, [settings.hasSeenOnboarding, settingsLoading, onOpen])

  return null
}

export default OnboardingTrigger
