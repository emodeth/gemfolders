import { supabase } from "~lib/supabase"
import { POLAR_CHECKOUT_LINKS } from "~types/subscription"

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

// Sign in With Google

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

// Gemfolders website payment redirection

chrome.runtime.onMessageExternal.addListener(
  (request, _sender, sendResponse) => {
    if (request.action === "TRIGGER_PURCHASE") {
      ;(async () => {
        try {
          const { data: session } = await supabase.auth.getSession()
          const user = session?.session?.user

          if (user && user.email) {
            let url: string = POLAR_CHECKOUT_LINKS.yearly
            switch (request.plan) {
              case "Monthly":
                url = POLAR_CHECKOUT_LINKS.monthly
                break
              case "Yearly":
                url = POLAR_CHECKOUT_LINKS.yearly
                break
              case "Lifetime":
                url = POLAR_CHECKOUT_LINKS.lifetime
                break
              default:
                url = POLAR_CHECKOUT_LINKS.yearly
            }

            const checkoutUrl = new URL(url)
            checkoutUrl.searchParams.set("email", user.email)
            checkoutUrl.searchParams.set("metadata[user_email]", user.email)

            chrome.tabs.create({ url: checkoutUrl.toString() })
            sendResponse({ success: true, message: "Redirecting to payment" })
          } else {
            chrome.tabs.create({
              url: chrome.runtime.getURL("tabs/login-required.html")
            })
            sendResponse({
              success: false,
              message: "User not logged in, opened login page"
            })
          }
        } catch (e) {
          console.error("Error in external message handler:", e)
          sendResponse({ success: false, error: "Internal error" })
        }
      })()
    }
    // Return true to indicate we wish to send a response asynchronously
    return true
  }
)
