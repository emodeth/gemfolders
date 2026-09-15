import { ArrowRight, Check, X } from "lucide-react"
import React, { useState } from "react"
import toast from "react-hot-toast"

import { useAuth } from "../../context/AuthContext"
import { useModal } from "../../context/ModalContext"
import {
  FREE_TIER_LIMITS,
  NOT_LOGGED_IN_LIMITS
} from "../../context/TierLimitsContext"
import { signInWithGoogle } from "../../lib/googleAuth"
import { useI18n } from "../../lib/i18n"
import GoogleIcon from "../ui/GoogleIcon"

const SignInPaywallModal: React.FC = () => {
  const { onClose } = useModal()
  const { refreshSession } = useAuth()
  const { t } = useI18n()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        toast.error(error.message || t("signInFailed"))
      } else {
        await refreshSession()
        toast.success(t("signInSuccess"), { duration: 1000 })
        onClose()
      }
    } catch (error) {
      toast.error(t("unexpectedError"))
      console.error("Google sign-in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const limits = [
    {
      label: t("bookmarks"),
      current: NOT_LOGGED_IN_LIMITS.maxBookmarks,
      upgraded: FREE_TIER_LIMITS.maxBookmarks
    },
    {
      label: t("folders"),
      current: NOT_LOGGED_IN_LIMITS.maxFolders,
      upgraded: FREE_TIER_LIMITS.maxFolders
    },
    {
      label: t("subfolderDepth"),
      current: NOT_LOGGED_IN_LIMITS.maxSubfolderDepth,
      upgraded: FREE_TIER_LIMITS.maxSubfolderDepth
    }
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gemfolders-sign-in-title"
      className="organizer-relative organizer-w-[420px] organizer-max-w-[calc(100vw-32px)] organizer-overflow-hidden organizer-rounded-md organizer-bg-bg-background organizer-text-text-primary organizer-shadow-2xl">
      <div className="organizer-flex organizer-items-center organizer-justify-between organizer-px-5 organizer-pb-2 organizer-pt-4">
        <h2
          id="gemfolders-sign-in-title"
          className="organizer-text-balance organizer-text-lg organizer-font-semibold">
          {t("signInForMore")}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="organizer-flex organizer-h-10 organizer-w-10 organizer-items-center organizer-justify-center organizer-rounded-full organizer-text-text-secondary organizer-transition-[background-color,color,transform] organizer-duration-200 hover:organizer-bg-bg-surface-hover hover:organizer-text-text-primary active:organizer-scale-[0.96]">
          <X size={20} />
        </button>
      </div>

      <div className="organizer-mb-4 organizer-px-6 organizer-text-center">
        <div className="organizer-mb-1 organizer-text-sm organizer-text-text-secondary">
          {t("limitReached")}
        </div>
        <h1 className="organizer-text-balance organizer-text-xl organizer-font-bold">
          {t("signInUpgradePrefix")}
          <span className="organizer-bg-gradient-to-r organizer-from-[var(--color-primary)] organizer-to-blue-400 organizer-bg-clip-text organizer-text-transparent">
            {t("signInUpgradeHighlight")}
          </span>
          {t("signInUpgradeSuffix")}
        </h1>
      </div>

      <div className="organizer-mb-4 organizer-space-y-2 organizer-px-6">
        {limits.map((item) => (
          <div
            key={item.label}
            className="organizer-flex organizer-items-center organizer-justify-between organizer-rounded-md organizer-bg-bg-surface-hover organizer-px-4 organizer-py-3 organizer-shadow-sm">
            <span className="organizer-text-sm organizer-font-medium">
              {item.label}
            </span>
            <div className="organizer-flex organizer-items-center organizer-gap-2 organizer-tabular-nums">
              <span className="organizer-text-sm organizer-text-text-secondary">
                {item.current}
              </span>
              <ArrowRight
                aria-hidden="true"
                size={14}
                className="organizer-text-[var(--color-primary)]"
              />
              <span className="organizer-text-sm organizer-font-bold organizer-text-[var(--color-primary)]">
                {item.upgraded}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="organizer-px-6 organizer-pb-5">
        <div className="organizer-mb-4 organizer-flex organizer-items-start organizer-gap-2">
          <div className="organizer-mt-0.5">
            <div className="organizer-rounded-full organizer-bg-[var(--color-primary)]/20 organizer-p-1">
              <Check
                aria-hidden="true"
                size={12}
                className="organizer-text-[var(--color-primary)]"
              />
            </div>
          </div>
          <span className="organizer-text-pretty organizer-text-xs organizer-text-text-secondary">
            {t("instantUnlockPrefix")}
            <span className="organizer-font-bold organizer-text-text-primary">
              {t("completelyFree")}
            </span>
            {t("sentencePeriod")}
          </span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="organizer-flex organizer-min-h-11 organizer-w-full organizer-items-center organizer-justify-center organizer-gap-2 organizer-rounded-md organizer-bg-bg-button-surface organizer-px-4 organizer-py-2.5 organizer-text-sm organizer-font-medium organizer-text-text-primary organizer-shadow-sm organizer-transition-[background-color,box-shadow,opacity,transform] organizer-duration-200 hover:organizer-bg-bg-surface-hover hover:organizer-shadow-md active:organizer-scale-[0.96] disabled:organizer-cursor-not-allowed disabled:organizer-opacity-50 disabled:active:organizer-scale-100">
          <GoogleIcon size={18} />
          <span>{isLoading ? t("signingIn") : t("signInGoogle")}</span>
        </button>
      </div>
    </div>
  )
}

export default SignInPaywallModal
