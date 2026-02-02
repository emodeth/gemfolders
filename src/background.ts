import { supabase } from "~lib/supabase"

export type GoogleAuthMessage = {
  type: "GOOGLE_SIGN_IN"
}

export type GoogleAuthResponse = {
  success: boolean
  error?: string
  email?: string
}

const SUPABASE_URL = process.env.PLASMO_PUBLIC_SUPABASE_URL
const GOOGLE_AUTH_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/google-auth`

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
      return true
    }
  }
)

async function handleGoogleSignIn(): Promise<GoogleAuthResponse> {
  try {
    const accessToken = await getAuthToken()

    if (!accessToken) {
      return {
        success: false,
        error: "Failed to get Google authentication token"
      }
    }

    const response = await fetch(GOOGLE_AUTH_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ access_token: accessToken })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.error || "Failed to authenticate with Google"
      }
    }

    const { token_hash, type, email } = await response.json()

    if (!token_hash) {
      return {
        success: false,
        error: "Failed to get authentication token"
      }
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type: type || "magiclink"
    })

    if (verifyError) {
      console.error("Verify OTP error:", verifyError)
      return {
        success: false,
        error: verifyError.message
      }
    }

    return {
      success: true,
      email
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
