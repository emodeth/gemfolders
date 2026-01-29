import React from 'react';
import { Sidebar, Check, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useModal } from '../../context/ModalContext';
import { useSettings } from '../../context/SettingsContext';

const OnboardingModal: React.FC = () => {
  const { onClose } = useModal();
  const { updateSettings } = useSettings();

  const handleChoice = async (hideFolders: boolean) => {
    await updateSettings({
      hideFoldersFromSidebar: hideFolders,
      hasSeenOnboarding: true
    });
    onClose();
    toast.success('You can change the setting in Settings', {
      id: 'onboarding-toast',
      duration: 4000
    });
  };

  return (
    <div className="organizer-w-[600px] organizer-bg-bg-background organizer-rounded-md organizer-text-text-primary organizer-relative organizer-shadow-2xl organizer-border organizer-border-border-default">
      <div className="organizer-text-center organizer-p-8 organizer-pb-4">
        <h1 className="organizer-text-2xl organizer-font-bold organizer-mb-2">
          Welcome to Gemfolders
        </h1>
        <p className="organizer-text-text-secondary">
          Choose how you want to access your folders
        </p>
      </div>

      <div className="organizer-grid organizer-grid-cols-2 organizer-gap-4 organizer-p-8 organizer-pt-4">
        <button
          onClick={() => handleChoice(true)}
          className="organizer-group organizer-relative organizer-flex organizer-flex-col organizer-items-center organizer-justify-center organizer-p-6 organizer-rounded-xl organizer-border organizer-border-border-default hover:organizer-border-[var(--color-primary)] hover:organizer-bg-bg-surface-hover organizer-transition-all organizer-text-left"
        >
          <div className="organizer-mb-4 organizer-p-3 organizer-rounded-full organizer-bg-[var(--color-primary)]/10 group-hover:organizer-bg-[var(--color-primary)]/20 organizer-transition-colors">
            <Sparkles size={32} className="organizer-text-[var(--color-primary)]" />
          </div>
          <h3 className="organizer-font-bold organizer-text-lg organizer-mb-2">Extension Only</h3>
          <p className="organizer-text-sm organizer-text-text-secondary organizer-text-center organizer-mb-4">
            Keep Gemini's sidebar clean and access folders only through the extension sidebar.
          </p>
          <span className="organizer-inline-flex organizer-items-center organizer-text-xs organizer-font-medium organizer-text-white organizer-rounded-full organizer-px-2 organizer-py-0.5" style={{ backgroundColor: 'var(--color-primary)' }}>
            Recommended
          </span>
        </button>

        <button
          onClick={() => handleChoice(false)}
          className="organizer-group organizer-relative organizer-flex organizer-flex-col organizer-items-center organizer-justify-center organizer-p-6 organizer-rounded-xl organizer-border organizer-border-border-default hover:organizer-border-[var(--color-primary)] hover:organizer-bg-bg-surface-hover organizer-transition-all organizer-text-left"
        >
          <div className="organizer-mb-4 organizer-p-3 organizer-rounded-full organizer-bg-[var(--color-primary)]/10 group-hover:organizer-bg-[var(--color-primary)]/20 organizer-transition-colors">
            <Sidebar size={32} className="organizer-text-[var(--color-primary)]" />
          </div>
          <h3 className="organizer-font-bold organizer-text-lg organizer-mb-2">Integrated Mode</h3>
          <p className="organizer-text-sm organizer-text-text-secondary organizer-text-center organizer-mb-4">
            Use folders directly within Gemini's existing sidebar for a seamless experience.
          </p>
        </button>
      </div>
    </div>
  );
};

export default OnboardingModal;
