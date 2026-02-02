import type { GoogleAuthResponse } from "~background"

import { supabase } from "./supabase"

export async function signInWithGoogle(): Promise<{
  error: Error | null
  email?: string
}> {
  try {
    if (!chrome?.runtime?.sendMessage) {
      console.error("chrome.runtime.sendMessage is not available")
      return {
        error: new Error(
          "Extension API not available. Please refresh the page."
        )
      }
    }

    const response = await new Promise<GoogleAuthResponse>(
      (resolve, reject) => {
        chrome.runtime.sendMessage({ type: "GOOGLE_SIGN_IN" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("sendMessage error:", chrome.runtime.lastError)
            reject(new Error(chrome.runtime.lastError.message))
            return
          }
          resolve(response)
        })
      }
    )

    if (!response) {
      return {
        error: new Error(
          "No response from background script. Please refresh the extension."
        )
      }
    }

    if (!response.success) {
      return {
        error: new Error(response.error || "Failed to sign in with Google")
      }
    }

    return {
      error: null,
      email: response.email
    }
  } catch (error) {
    console.error("Google sign-in error:", error)
    return {
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error during Google sign-in")
    }
  }
}
export async function signOutFromGoogle(): Promise<void> {
  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error("Sign out error:", error)
  }
}
