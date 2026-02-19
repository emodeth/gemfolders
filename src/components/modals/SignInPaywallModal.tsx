import React, { useState } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../context/AuthContext';
import { signInWithGoogle } from '../../lib/googleAuth';
import GoogleIcon from '../ui/GoogleIcon';
import { FREE_TIER_LIMITS, NOT_LOGGED_IN_LIMITS } from '../../context/TierLimitsContext';

const SignInPaywallModal: React.FC = () => {
  const { onClose } = useModal();
  const { refreshSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message || 'Failed to sign in with Google');
      } else {
        await refreshSession();
        toast.success('Signed in successfully!', { duration: 1000 });
        onClose();
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Google sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const limits = [
    {
      label: 'Bookmarks',
      current: NOT_LOGGED_IN_LIMITS.maxBookmarks,
      upgraded: FREE_TIER_LIMITS.maxBookmarks,
    },
    {
      label: 'Folders',
      current: NOT_LOGGED_IN_LIMITS.maxFolders,
      upgraded: FREE_TIER_LIMITS.maxFolders,
    },
    {
      label: 'Subfolder Depth',
      current: NOT_LOGGED_IN_LIMITS.maxSubfolderDepth,
      upgraded: FREE_TIER_LIMITS.maxSubfolderDepth,
    },
  ];

  return (
    <div className="organizer-w-[420px] organizer-bg-bg-background organizer-rounded-md organizer-text-text-primary organizer-relative organizer-shadow-2xl organizer-border organizer-border-border-default">
      <div className="organizer-flex organizer-justify-between organizer-items-center organizer-p-4 organizer-pb-2">
        <h2 className="organizer-text-lg organizer-font-bold">Sign in for more</h2>
        <button
          onClick={onClose}
          className="organizer-p-1 hover:organizer-bg-bg-surface-hover organizer-rounded-full organizer-transition-colors"
        >
          <X size={20} className="organizer-text-text-secondary" />
        </button>
      </div>

      <div className="organizer-text-center organizer-mb-4">
        <div className="organizer-text-sm organizer-text-text-secondary organizer-mb-1">You've hit a limit</div>
        <h1 className="organizer-text-xl organizer-font-bold">
          Get <span className="organizer-text-transparent organizer-bg-clip-text organizer-bg-gradient-to-r organizer-from-[var(--color-primary)] organizer-to-blue-400">double the limits</span> for free
        </h1>
      </div>

      <div className="organizer-px-6 organizer-space-y-2 organizer-mb-4">
        {limits.map((item) => (
          <div
            key={item.label}
            className="organizer-flex organizer-items-center organizer-justify-between organizer-bg-bg-surface organizer-border organizer-border-border-default organizer-rounded-lg organizer-px-4 organizer-py-3"
          >
            <span className="organizer-text-sm organizer-font-medium">{item.label}</span>
            <div className="organizer-flex organizer-items-center organizer-gap-2">
              <span className="organizer-text-sm organizer-text-text-secondary">{item.current}</span>
              <ArrowRight size={14} className="organizer-text-[var(--color-primary)]" />
              <span className="organizer-text-sm organizer-font-bold organizer-text-[var(--color-primary)]">{item.upgraded}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="organizer-px-6 organizer-pb-4">
        <div className="organizer-flex organizer-items-start organizer-gap-2 organizer-mb-4">
          <div className="organizer-mt-0.5">
            <div className="organizer-bg-[var(--color-primary)]/20 organizer-p-1 organizer-rounded-full">
              <Check size={12} className="organizer-text-[var(--color-primary)]" />
            </div>
          </div>
          <span className="organizer-text-xs organizer-text-text-secondary">
            Sign in with Google to instantly unlock higher limits — <span className="organizer-font-bold organizer-text-text-primary">completely free</span>.
          </span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="organizer-w-full organizer-bg-surface organizer-text-sm organizer-text-text-primary organizer-font-medium organizer-py-2.5 organizer-rounded-lg organizer-flex organizer-items-center organizer-justify-center organizer-gap-2 hover:organizer-opacity-80 organizer-transition-colors organizer-border organizer-border-border-default disabled:organizer-opacity-50"
        >
          <GoogleIcon size={18} />
          <span>{isLoading ? 'Signing in...' : 'Sign in with Google'}</span>
        </button>
      </div>
    </div>
  );
};

export default SignInPaywallModal;
