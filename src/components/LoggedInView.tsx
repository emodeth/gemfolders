import { Chrome, Crown, Mail, Sparkles } from "lucide-react"
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
        <span className="organizer-bg-bg-surface-hover organizer-text-text-secondary organizer-text-xs organizer-px-2 organizer-py-1 organizer-rounded organizer-animate-pulse">
          Loading...
        </span>
      )
    }

    switch (accessLevel) {
      case 'lifetime':
        return (
          <span className="organizer-bg-gradient-to-r organizer-from-amber-500 organizer-to-yellow-400 organizer-text-white organizer-text-xs organizer-px-2 organizer-py-1 organizer-rounded organizer-flex organizer-items-center organizer-gap-1">
            <Crown size={12} />
            Lifetime
          </span>
        )
      case 'yearly':
        return (
          <span className="organizer-bg-gradient-to-r organizer-from-[var(--color-primary)] organizer-to-blue-400 organizer-text-white organizer-text-xs organizer-px-2 organizer-py-1 organizer-rounded organizer-flex organizer-items-center organizer-gap-1">
            <Sparkles size={12} />
            Yearly
          </span>
        )
      case 'pro':
        return (
          <span className="organizer-bg-gradient-to-r organizer-from-[var(--color-primary)] organizer-to-blue-400 organizer-text-white organizer-text-xs organizer-px-2 organizer-py-1 organizer-rounded organizer-flex organizer-items-center organizer-gap-1">
            <Sparkles size={12} />
            Pro
          </span>
        )
      default:
        return (
          <span className="organizer-bg-bg-surface-hover organizer-text-text-secondary organizer-text-xs organizer-px-2 organizer-py-1 organizer-rounded">
            Free
          </span>
        )
    }
  }

  return (
    <div className="organizer-flex organizer-flex-col organizer-h-full organizer-px-1 organizer-gap-6">
      <div>
        {getAccessBadge()}
      </div>

      <div className="organizer-flex organizer-flex-col organizer-gap-4">
        <div className="organizer-flex organizer-justify-between organizer-items-center">
          <span className="organizer-text-text-primary organizer-font-medium organizer-text-sm">
            {user.user.email}
          </span>
          <button
            onClick={handleLogout}
            className="organizer-bg-bg-surface-hover organizer-text-text-primary organizer-text-xs organizer-px-3 organizer-py-2 organizer-rounded-lg hover:organizer-opacity-80 organizer-transition-opacity">
            Logout
          </button>
        </div>

        {!isPro && (
          <button
            onClick={() => onOpen('paywall')}
            className="organizer-w-full organizer-bg-primary organizer-text-white organizer-font-medium organizer-py-2 organizer-rounded-lg hover:organizer-opacity-90 organizer-transition-opacity">
            Upgrade
          </button>
        )}
      </div>

      <div>
        <h3 className="organizer-text-text-primary organizer-font-bold organizer-text-sm organizer-mb-3">
          Linked accounts
        </h3>
        <div className="organizer-space-y-3">
          {user.user.identities?.map((identity: any) => (
            <div
              key={identity.id}
              className="organizer-flex organizer-items-center organizer-gap-3 organizer-text-text-secondary organizer-text-sm">
              {identity.provider === "google" ? (
                <Chrome size={16} />
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

