import type { GoogleAuthResponse } from "~background"

import { supabase } from "./supabase"

/**
 * Initiates Google Sign-In by sending a message to the background script
 * The background script uses chrome.identity.getAuthToken to get the user's Google account
 * Then sends a magic link to their email for Supabase authentication
 */
export async function signInWithGoogle(): Promise<{
  error: Error | null
  email?: string
  requiresMagicLink?: boolean
}> {
  try {
    // Send message to background script to handle Google sign-in
    const response = (await chrome.runtime.sendMessage({
      type: "GOOGLE_SIGN_IN"
    })) as GoogleAuthResponse

    if (!response.success) {
      return {
        error: new Error(response.error || "Failed to sign in with Google")
      }
    }

    return {
      error: null,
      email: response.email,
      requiresMagicLink: response.requiresMagicLink
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

/**
 * Signs out - clears any cached auth state
 */
export async function signOutFromGoogle(): Promise<void> {
  try {
    // Clear the Supabase session
    await supabase.auth.signOut()

    // Also try to revoke the cached Google token
    try {
      await chrome.runtime.sendMessage({ type: "GOOGLE_SIGN_OUT" })
    } catch {
      // Ignore if background script doesn't handle this
    }
  } catch (error) {
    console.error("Sign out error:", error)
  }
}
