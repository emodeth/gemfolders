import { supabase } from "~lib/supabase"

// Message types for communication between content/popup and background
export type GoogleAuthMessage = {
  type: "GOOGLE_SIGN_IN"
}

export type GoogleAuthResponse = {
  success: boolean
  error?: string
  email?: string
  requiresMagicLink?: boolean
}

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener(
  (message: GoogleAuthMessage, _sender, sendResponse) => {
    if (message.type === "GOOGLE_SIGN_IN") {
      handleGoogleSignIn()
        .then((result) => {
          sendResponse(result)
        })
        .catch((error) => {
          sendResponse({ success: false, error: error.message })
        })

      // Return true to indicate we will send response asynchronously
      return true
    }
  }
)

/**
 * Handles the Google Sign-In flow using getAuthToken
 * This gets an access token which we use to fetch the user's Google profile
 */
async function handleGoogleSignIn(): Promise<GoogleAuthResponse> {
  try {
    // Get access token from Chrome's identity API
    const token = await getAuthToken()

    if (!token) {
      return {
        success: false,
        error: "Failed to get Google authentication token"
      }
    }

    // Fetch user info from Google using the access token
    const userInfo = await fetchGoogleUserInfo(token)

    if (!userInfo?.email) {
      // If token is invalid, clear it and return error
      await clearAuthToken(token)
      return {
        success: false,
        error: "Failed to get user information from Google"
      }
    }

    // Check if user exists in Supabase with this email
    // Since we have an access token (not ID token), we need to use magic link
    // to properly authenticate with Supabase
    const { error } = await supabase.auth.signInWithOtp({
      email: userInfo.email,
      options: {
        shouldCreateUser: true
      }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      email: userInfo.email,
      requiresMagicLink: true
    }
  } catch (error) {
    console.error("Google sign-in error:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error during Google sign-in"
    }
  }
}

/**
 * Gets the Google auth token using Chrome's identity API
 */
function getAuthToken(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        console.error("Chrome identity error:", chrome.runtime.lastError)
        resolve(null)
        return
      }
      resolve(token || null)
    })
  })
}

/**
 * Clears a cached auth token
 */
function clearAuthToken(token: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.identity.removeCachedAuthToken({ token }, () => {
      resolve()
    })
  })
}

/**
 * Fetches user info from Google's userinfo API
 */
async function fetchGoogleUserInfo(
  accessToken: string
): Promise<{ email: string; name: string; picture: string } | null> {
  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )

    if (!response.ok) {
      console.error("Failed to fetch user info:", response.status)
      return null
    }

    const data = await response.json()
    return {
      email: data.email,
      name: data.name || "",
      picture: data.picture || ""
    }
  } catch (error) {
    console.error("Error fetching Google user info:", error)
    return null
  }
}

export {}
