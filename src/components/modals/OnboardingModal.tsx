import gemfoldersIcon from "data-base64:../../../assets/icon.png"
import { Blocks, Sidebar } from "lucide-react"
import React from "react"
import toast from "react-hot-toast"

import { useModal } from "../../context/ModalContext"
import { useSettings } from "../../context/SettingsContext"
import { useI18n } from "../../lib/i18n"
import LanguageSelect from "../ui/LanguageSelect"

const OnboardingModal: React.FC = () => {
  const { onClose } = useModal()
  const { settings, updateSettings } = useSettings()
  const { t } = useI18n()

  const handleChoice = async (hideFolders: boolean) => {
    await updateSettings({
      hideFoldersFromSidebar: hideFolders,
      hasSeenOnboarding: true,
      languagePreferenceSet: true
    })
    onClose()
    toast.success(t("settingChanged"), {
      id: "onboarding-toast",
      duration: 4000
    })
  }

  return (
    <div className="organizer-w-[600px] organizer-bg-bg-surface organizer-rounded-lg organizer-text-text-primary organizer-relative organizer-shadow-2xl">
      <div className="organizer-px-8 organizer-pb-5 organizer-pt-8 organizer-text-center">
        <span className="organizer-mx-auto organizer-mb-3 organizer-flex organizer-h-16 organizer-w-16 organizer-items-center organizer-justify-center organizer-rounded-full organizer-bg-bg-background organizer-shadow-md">
          <img
            src={gemfoldersIcon}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="organizer-h-10 organizer-w-10 organizer-select-none organizer-object-contain"
          />
        </span>
        <h1 className="organizer-text-balance organizer-text-2xl organizer-font-semibold organizer-leading-8 organizer-tracking-[-0.01em] organizer-text-text-primary">
          {t("welcome")}
        </h1>
        <p className="organizer-mt-1 organizer-text-pretty organizer-text-base organizer-font-normal organizer-leading-6 organizer-text-text-secondary">
          {t("chooseAccess")}
        </p>
      </div>

      <div className="organizer-grid organizer-grid-cols-2 organizer-gap-4 organizer-px-8 organizer-pb-4">
        <button
          onClick={() => handleChoice(true)}
          className="organizer-group organizer-relative organizer-flex organizer-min-h-[210px] organizer-flex-col organizer-items-start organizer-rounded-md organizer-bg-bg-card organizer-p-5 organizer-text-left organizer-shadow-md organizer-outline organizer-outline-1 organizer-outline-transparent organizer-transition-[outline-color,transform] organizer-duration-200 hover:organizer-outline-border-default active:organizer-scale-[0.96]">
          <span className="organizer-mb-3 organizer-flex organizer-h-10 organizer-w-10 organizer-items-center organizer-justify-center organizer-rounded-md organizer-bg-bg-surface-hover organizer-text-text-primary">
            <Blocks size={16} strokeWidth={2} />
          </span>
          <h3 className="organizer-mb-2 organizer-text-base organizer-font-semibold organizer-leading-6 organizer-text-text-primary">
            {t("extensionOnly")}
          </h3>
          <p className="organizer-mb-4 organizer-text-sm organizer-leading-5 organizer-text-text-secondary">
            {t("extensionOnlyHelp")}
          </p>
          <span className="organizer-mt-auto organizer-inline-flex organizer-items-center organizer-rounded-full organizer-bg-bg-surface organizer-px-2.5 organizer-py-0.5 organizer-text-xs organizer-font-medium organizer-leading-4 organizer-text-text-primary">
            {t("recommended")}
          </span>
        </button>

        <button
          onClick={() => handleChoice(false)}
          className="organizer-group organizer-relative organizer-flex organizer-min-h-[210px] organizer-flex-col organizer-items-start organizer-rounded-md organizer-bg-bg-card organizer-p-5 organizer-text-left organizer-shadow-md organizer-outline organizer-outline-1 organizer-outline-transparent organizer-transition-[outline-color,transform] organizer-duration-200 hover:organizer-outline-border-default active:organizer-scale-[0.96]">
          <span className="organizer-mb-3 organizer-flex organizer-h-10 organizer-w-10 organizer-items-center organizer-justify-center organizer-rounded-md organizer-bg-bg-surface-hover organizer-text-text-primary">
            <Sidebar size={16} strokeWidth={2} />
          </span>
          <h3 className="organizer-mb-2 organizer-text-base organizer-font-semibold organizer-leading-6 organizer-text-text-primary">
            {t("integratedMode")}
          </h3>
          <p className="organizer-text-sm organizer-leading-5 organizer-text-text-secondary">
            {t("integratedModeHelp")}
          </p>
        </button>
      </div>

      <div className="organizer-px-8 organizer-pb-8">
        <div className="organizer-w-full organizer-rounded-xl organizer-bg-bg-background organizer-p-4 organizer-shadow-sm">
          <label
            htmlFor="gemfolders-onboarding-language"
            className="organizer-mb-3 organizer-block organizer-text-pretty organizer-text-left organizer-text-sm organizer-font-medium organizer-text-text-primary"
          >
            {t("chooseLanguage")}
          </label>
          <LanguageSelect
            id="gemfolders-onboarding-language"
            value={settings.language || "en"}
            onChange={(language) =>
              updateSettings({ language, languagePreferenceSet: true })
            }
            className="organizer-w-full"
          />
        </div>
      </div>
    </div>
  )
}

export default OnboardingModal
