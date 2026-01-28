import { Chrome } from "lucide-react"
import React from "react"

import MagicLinkLogin from "./MagicLinkLogin"

const LoggedOutView: React.FC = () => {
  return (
    <div className="organizer-flex organizer-flex-col organizer-h-full organizer-px-1">
      <div className="organizer-mb-6">
        <h3 className="organizer-text-text-primary organizer-font-bold organizer-text-sm organizer-mb-2">
          Connect with Google
        </h3>
        <button className="organizer-w-full organizer-bg-surface organizer-text-sm organizer-text-text-primary organizer-font-medium organizer-py-2 organizer-rounded-lg organizer-flex organizer-items-center organizer-justify-center organizer-gap-2 hover:organizer-opacity-80 organizer-transition-colors organizer-border organizer-border-border-default">
          <Chrome size={18} />
          <span>Sign in with Google</span>
        </button>
      </div>

      <MagicLinkLogin />
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
  )
}

export default LoggedOutView
