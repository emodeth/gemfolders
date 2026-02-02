import React, { useState } from "react"
import toast from "react-hot-toast"

import { signInWithGoogle } from "~lib/googleAuth"

import MagicLinkLogin from "./MagicLinkLogin"
import GoogleIcon from "./ui/GoogleIcon"

const LoggedOutView: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const { error, email, requiresMagicLink } = await signInWithGoogle()
      if (error) {
        toast.error(error.message || "Failed to sign in with Google")
      } else if (requiresMagicLink && email) {
        toast.success(`Magic link sent to ${email}! Check your inbox.`, {
          duration: 5000
        })
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error("Google sign-in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="organizer-flex organizer-flex-col organizer-h-full organizer-px-1">
      <div className="organizer-mb-6">
        <h3 className="organizer-text-text-primary organizer-font-bold organizer-text-sm organizer-mb-2">
          Connect with Google
        </h3>
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="organizer-w-full organizer-bg-surface organizer-text-sm organizer-text-text-primary organizer-font-medium organizer-py-2 organizer-rounded-lg organizer-flex organizer-items-center organizer-justify-center organizer-gap-2 hover:organizer-opacity-80 organizer-transition-colors organizer-border organizer-border-border-default disabled:organizer-opacity-50"
        >
          <GoogleIcon size={18} />
          <span>{isLoading ? "Signing in..." : "Sign in with Google"}</span>
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
