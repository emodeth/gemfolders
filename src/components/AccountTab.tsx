import React from "react";
import { Chrome } from "lucide-react";
import MagicLinkLogin from "./MagicLinkLogin";

const AccountTab: React.FC = () => {

  return (
    <div className="organizer-flex organizer-flex-col organizer-h-full organizer-px-1">
      {/* Connect with Google */}
      <div className="organizer-mb-6">
        <h3 className="organizer-text-text-primary organizer-font-bold organizer-text-sm organizer-mb-2">
          Connect with Google
        </h3>
        <button className="organizer-w-full organizer-bg-surface organizer-text-text-primary organizer-font-medium organizer-py-3 organizer-px-4 organizer-rounded-xl organizer-flex organizer-items-center organizer-justify-center organizer-gap-2 hover:organizer-bg-surface-hover organizer-transition-colors organizer-border organizer-border-border-default">
          <Chrome size={18} />
          <span>Sign in with Google</span>
        </button>
      </div>



      <MagicLinkLogin />
      {/* Disclaimer */}
      <div className="organizer-mt-4">
        <p className="organizer-text-text-secondary organizer-text-xs organizer-leading-relaxed">
          If you are not receiving our emails, please whitelist:{" "}
          <span className="organizer-text-primary organizer-font-medium">
            emirhankeskindev@gmail.com
          </span>{" "}
          with your email provider, or try a different email (Gmail accounts are
          the most reliable).
        </p>
      </div>
    </div>
  );
};

export default AccountTab;
