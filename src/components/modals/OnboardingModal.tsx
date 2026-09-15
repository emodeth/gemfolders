import gemfoldersIcon from "data-base64:../../../assets/icon.png"
import { Blocks, Sidebar } from "lucide-react"
import React from "react"
import toast from "react-hot-toast"

import { useModal } from "../../context/ModalContext"
import { useSettings } from "../../context/SettingsContext"

const OnboardingModal: React.FC = () => {
  const { onClose } = useModal()
  const { updateSettings } = useSettings()

  const handleChoice = async (hideFolders: boolean) => {
    await updateSettings({
      hideFoldersFromSidebar: hideFolders,
      hasSeenOnboarding: true
    })
    onClose()
    toast.success("You can change the setting in Settings", {
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
          Welcome to Gemfolders
        </h1>
        <p className="organizer-mt-1 organizer-text-pretty organizer-text-base organizer-font-normal organizer-leading-6 organizer-text-text-secondary">
          Choose how you want to access your folders
        </p>
      </div>

      <div className="organizer-grid organizer-grid-cols-2 organizer-gap-4 organizer-p-8 organizer-pt-4">
        <button
          onClick={() => handleChoice(true)}
          className="organizer-group organizer-relative organizer-flex organizer-min-h-[210px] organizer-flex-col organizer-items-start organizer-rounded-md organizer-bg-bg-card organizer-p-5 organizer-text-left organizer-shadow-md organizer-outline organizer-outline-1 organizer-outline-transparent organizer-transition-[outline-color,transform] organizer-duration-200 hover:organizer-outline-border-default active:organizer-scale-[0.96]">
          <span className="organizer-mb-3 organizer-flex organizer-h-10 organizer-w-10 organizer-items-center organizer-justify-center organizer-rounded-md organizer-bg-bg-surface-hover organizer-text-text-primary">
            <Blocks size={16} strokeWidth={2} />
          </span>
          <h3 className="organizer-mb-2 organizer-text-base organizer-font-semibold organizer-leading-6 organizer-text-text-primary">
            Extension only
          </h3>
          <p className="organizer-mb-4 organizer-text-sm organizer-leading-5 organizer-text-text-secondary">
            Keep Gemini's sidebar clean and access folders only through the
            extension sidebar.
          </p>
          <span className="organizer-mt-auto organizer-inline-flex organizer-items-center organizer-rounded-full organizer-bg-bg-surface organizer-px-2.5 organizer-py-0.5 organizer-text-xs organizer-font-medium organizer-leading-4 organizer-text-text-primary">
            Recommended
          </span>
        </button>

        <button
          onClick={() => handleChoice(false)}
          className="organizer-group organizer-relative organizer-flex organizer-min-h-[210px] organizer-flex-col organizer-items-start organizer-rounded-md organizer-bg-bg-card organizer-p-5 organizer-text-left organizer-shadow-md organizer-outline organizer-outline-1 organizer-outline-transparent organizer-transition-[outline-color,transform] organizer-duration-200 hover:organizer-outline-border-default active:organizer-scale-[0.96]">
          <span className="organizer-mb-3 organizer-flex organizer-h-10 organizer-w-10 organizer-items-center organizer-justify-center organizer-rounded-md organizer-bg-bg-surface-hover organizer-text-text-primary">
            <Sidebar size={16} strokeWidth={2} />
          </span>
          <h3 className="organizer-mb-2 organizer-text-base organizer-font-semibold organizer-leading-6 organizer-text-text-primary">
            Integrated mode
          </h3>
          <p className="organizer-text-sm organizer-leading-5 organizer-text-text-secondary">
            Use folders directly within Gemini's existing sidebar for a seamless
            experience.
          </p>
        </button>
      </div>
    </div>
  )
}

export default OnboardingModal
