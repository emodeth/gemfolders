import React, { useState } from "react"
import toast from "react-hot-toast"

import { useAuth } from "~context/AuthContext"
import { signInWithGoogle } from "~lib/googleAuth"

import MagicLinkLogin from "./MagicLinkLogin"
import GoogleIcon from "./ui/GoogleIcon"
import { useI18n } from "~lib/i18n"

const LoggedOutView: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { refreshSession } = useAuth()
  const { t } = useI18n()

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        toast.error(error.message || t("signInFailed"))
      } else {
        await refreshSession()
        globalThis.location.reload()
        toast.success(t("signInSuccess"), { duration: 1000 })
      }
    } catch (error) {
      toast.error(t("unexpectedError"))
      console.error("Google sign-in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="organizer-flex organizer-flex-col organizer-h-full organizer-px-1">
      <div className="organizer-mb-6">
        <h3 className="organizer-text-text-primary organizer-font-bold organizer-text-sm organizer-mb-2">
          {t("connectGoogle")}
        </h3>
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="organizer-w-full organizer-bg-bg-surface-hover organizer-text-sm organizer-text-text-primary organizer-font-medium organizer-py-2 organizer-rounded-md organizer-flex organizer-items-center organizer-justify-center organizer-gap-2 hover:organizer-opacity-90 organizer-transition-opacity organizer-cursor-pointer disabled:organizer-opacity-50 disabled:organizer-cursor-not-allowed"
        >
          <GoogleIcon size={18} />
          <span>{isLoading ? t("signingIn") : t("signInGoogle")}</span>
        </button>
      </div>

      <MagicLinkLogin />
      <div className="organizer-mt-4">
        <p className="organizer-text-text-secondary organizer-text-xs organizer-leading-relaxed">
          {t("emailHelp", { email: "emirhankeskindev@gmail.com" })}
        </p>
      </div>
    </div>
  )
}

export default LoggedOutView
