import React from 'react';
import { X, Check } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../context/AuthContext';
import { POLAR_CHECKOUT_LINKS } from '../../types/subscription';

const PaywallModal: React.FC = () => {
  const { onClose } = useModal();
  const { user } = useAuth();

  const openCheckout = (url: string) => {
    const checkoutUrl = new URL(url);
    if (user?.email) {
      checkoutUrl.searchParams.set('customer_email', user.email);
      checkoutUrl.searchParams.set('metadata[user_email]', user.email);
    }
    window.open(checkoutUrl.toString(), '_blank');
    onClose();
  };

  return (
    <div className="organizer-w-[500px] organizer-bg-bg-background organizer-rounded-md organizer-text-text-primary organizer-relative organizer-shadow-2xl organizer-border organizer-border-border-default">
      <div className="organizer-flex organizer-justify-between organizer-items-center organizer-p-4 organizer-pb-2">
        <h2 className="organizer-text-lg organizer-font-bold">Purchase Gemfolders</h2>
        <button
          onClick={onClose}
          className="organizer-p-1 hover:organizer-bg-bg-surface-hover organizer-rounded-full organizer-transition-colors"
        >
          <X size={20} className="organizer-text-text-secondary" />
        </button>
      </div>

      <div className="organizer-text-center organizer-mb-6">
        <div className="organizer-text-sm organizer-text-text-secondary organizer-mb-1">Unlock full potential</div>
        <h1 className="organizer-text-2xl organizer-font-bold">
          Become a <span className="organizer-text-transparent organizer-bg-clip-text organizer-bg-gradient-to-r organizer-from-[var(--color-primary)] organizer-to-blue-400">Superuser</span>
        </h1>
      </div>

      <div className="organizer-px-6 organizer-space-y-3">
        <div
          onClick={() => openCheckout(POLAR_CHECKOUT_LINKS.lifetime)}
          className="organizer-bg-bg-surface hover:organizer-bg-bg-surface-hover organizer-border organizer-border-border-default organizer-rounded-xl organizer-p-4 organizer-flex organizer-flex-col organizer-items-center organizer-justify-center organizer-cursor-pointer organizer-transition-colors"
        >
          <div className="organizer-text-xs organizer-font-bold organizer-text-text-secondary organizer-uppercase organizer-tracking-wider organizer-mb-1">Lifetime</div>
          <div className="organizer-text-2xl organizer-font-bold">$49.99</div>
        </div>

        <div
          onClick={() => openCheckout(POLAR_CHECKOUT_LINKS.yearly)}
          className="organizer-relative organizer-group organizer-cursor-pointer"
        >
          <div className="organizer-absolute -organizer-inset-0.5 organizer-bg-gradient-to-r organizer-from-[var(--color-primary)] organizer-to-cyan-500 organizer-rounded-xl organizer-opacity-75 group-hover:organizer-opacity-100 organizer-blur-[2px] organizer-transition-all"></div>
          <div className="organizer-relative organizer-bg-bg-surface group-hover:organizer-bg-bg-surface-hover organizer-rounded-xl organizer-p-4 organizer-flex organizer-flex-col organizer-items-center organizer-justify-center organizer-border organizer-border-[var(--color-primary)]/30 organizer-transition-colors">
            <div className="organizer-absolute organizer-top-0 organizer-right-0 organizer-transform organizer-translate-x-2 -organizer-translate-y-2">
              <span className="organizer-bg-primary organizer-text-white organizer-text-[10px] organizer-font-bold organizer-px-2 organizer-py-0.5 organizer-rounded-full organizer-uppercase organizer-tracking-wide">
                Most Popular
              </span>
            </div>
            <div className="organizer-text-xs organizer-font-bold organizer-text-text-secondary organizer-uppercase organizer-tracking-wider organizer-mb-1">Yearly</div>
            <div className="organizer-flex organizer-items-baseline organizer-gap-1">
              <span className="organizer-text-2xl organizer-font-bold">$29.99</span>
              <span className="organizer-text-sm organizer-text-text-secondary">/year</span>
            </div>
          </div>
        </div>

        <div
          onClick={() => openCheckout(POLAR_CHECKOUT_LINKS.monthly)}
          className="organizer-bg-bg-surface hover:organizer-bg-bg-surface-hover organizer-border organizer-border-border-default organizer-rounded-xl organizer-p-4 organizer-flex organizer-flex-col organizer-items-center organizer-justify-center organizer-cursor-pointer organizer-transition-colors"
        >
          <div className="organizer-text-xs organizer-font-bold organizer-text-text-secondary organizer-uppercase organizer-tracking-wider organizer-mb-1">Monthly</div>
          <div className="organizer-flex organizer-items-baseline organizer-gap-1">
            <span className="organizer-text-2xl organizer-font-bold">$4.99</span>
            <span className="organizer-text-sm organizer-text-text-secondary">/month</span>
          </div>
        </div>

        <p className="organizer-text-xs organizer-text-text-tertiary organizer-text-center organizer-mt-3">
          Prices exclude taxes. Final amount may vary.
        </p>
      </div>

      <div className="organizer-p-6 organizer-pb-8">
        <div className="organizer-flex organizer-items-start organizer-gap-2 organizer-mb-4">
          <div className="organizer-mt-1">
            <div className="organizer-bg-[var(--color-primary)]/20 organizer-p-1 organizer-rounded-full">
              <Check size={14} className="organizer-text-[var(--color-primary)]" />
            </div>
          </div>
          <div>
            <div className="organizer-font-bold organizer-text-[var(--color-primary)] organizer-text-sm organizer-mb-1">Get full access to all features:</div>
            <div className="organizer-text-xs organizer-text-text-secondary organizer-leading-relaxed">
              Unlimited Folders for Chats • Bookmarks • Plus more...
            </div>

          </div>
        </div>

        <div className="organizer-flex organizer-items-start organizer-gap-2">
          <div className="organizer-mt-1">
            <div className="organizer-bg-[var(--color-primary)]/20 organizer-p-1 organizer-rounded-full">
              <Check size={14} className="organizer-text-[var(--color-primary)]" />
            </div>
          </div>
          <div>
            <div className="organizer-font-bold organizer-text-[var(--color-primary)] organizer-text-sm organizer-mb-1">Support an Indie Developer</div>
            <div className="organizer-text-xs organizer-text-text-secondary organizer-leading-relaxed">
              Your support helps me dedicate more time to <span className="organizer-font-bold organizer-text-text-primary">building new features, fixing bugs, and making the extension better for everyone.</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
