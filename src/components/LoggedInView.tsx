import { Mail } from "lucide-react"

import GoogleIcon from "./ui/GoogleIcon"
import React from "react"

import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import { useModal } from "../context/ModalContext"
import { useSubscription } from "../context/SubscriptionContext"

interface LoggedInViewProps {
  user: any
}

const LoggedInView: React.FC<LoggedInViewProps> = ({ user }) => {
  const { onOpen } = useModal()
  const { logout } = useAuth()
  const { isPro, accessLevel, isLoading: isSubscriptionLoading } = useSubscription()

  const handleLogout = async () => {
    await logout()
    toast.success("Logged out successfully")
  }

  const getAccessBadge = () => {
    if (isSubscriptionLoading) {
      return (
        <span className="organizer-bg-bg-surface-hover organizer-text-text-secondary organizer-text-xs organizer-px-2 organizer-py-1 organizer-rounded organizer-animate-pulse organizer-w-fit">
          Loading...
        </span>
      )
    }

    if (accessLevel === "lifetime" || accessLevel === "yearly" || accessLevel === "pro") {
      return (
        <span className="organizer-font-semibold organizer-bg-[var(--color-primary)] organizer-text-white organizer-text-xs organizer-px-2 organizer-py-1 organizer-rounded organizer-w-fit">
          Superuser
        </span>
      )
    } else if (accessLevel === "free") {
      return (
        <span className="organizer-font-semibold organizer-bg-bg-surface-hover organizer-text-text-secondary organizer-text-xs organizer-px-2 organizer-py-1 organizer-rounded organizer-w-fit">
          Free
        </span>
      )
    }


  }

  const handleManageAccount = () => {
    window.open('https://polar.sh/settings', '_blank')
  }

  return (
    <div className="organizer-flex organizer-flex-col organizer-h-full organizer-gap-4">
      <div>
        {getAccessBadge()}
      </div>

      <div className="organizer-flex organizer-flex-col organizer-gap-3">
        <div className="organizer-flex organizer-justify-between organizer-items-center">
          <span className="organizer-text-text-primary organizer-font-medium organizer-text-sm">
            {user.user.email}
          </span>
          <button
            onClick={handleLogout}
            className="organizer-bg-bg-surface-hover organizer-text-text-primary organizer-text-xs organizer-px-3 organizer-py-1.5 organizer-rounded-lg hover:organizer-opacity-80 organizer-transition-opacity">
            Logout
          </button>
        </div>

        {isPro && (
          <button
            onClick={handleManageAccount}
            className="organizer-w-full organizer-bg-bg-surface-hover organizer-text-text-primary organizer-text-sm organizer-p-4  organizer-py-3 organizer-font-semibold organizer-rounded-lg hover:organizer-opacity-80 organizer-transition-opacity">
            Manage account
          </button>

        )}
        {!isPro && (
          <button
            onClick={() => onOpen('paywall')}
            className="organizer-w-full organizer-bg-primary organizer-text-white organizer-font-medium organizer-py-2 organizer-rounded-lg hover:organizer-opacity-90 organizer-transition-opacity">
            Upgrade
          </button>
        )}
      </div>

      <div>
        <h3 className="organizer-text-text-primary organizer-font-medium organizer-text-sm organizer-mb-3">
          Linked accounts
        </h3>
        <div className="organizer-space-y-3">
          {user.user.identities?.map((identity: any) => (
            <div
              key={identity.id}
              className="organizer-flex organizer-items-center organizer-gap-3 organizer-text-text-secondary organizer-text-sm">
              {identity.provider === "google" ? (
                <GoogleIcon size={16} />
              ) : (
                <Mail size={16} />
              )}
              <span>{identity.identity_data?.email || user.user.email}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LoggedInView

