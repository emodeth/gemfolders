import { useState } from "react"

import { signInWithGoogle } from "~lib/googleAuth"

import "./login-required.css"

const LoginRequired = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)

    const result = await signInWithGoogle()

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => {
        chrome.tabs.query({ url: "https://gemini.google.com/*" }, (tabs) => {
          if (tabs && tabs.length > 0) {
            tabs.forEach((tab) => {
              if (tab.id) chrome.tabs.reload(tab.id)
            })
            window.close()
          } else {
            chrome.tabs.create({ url: "https://gemini.google.com" }, () => {
              window.close()
            })
          }
        })
      }, 1500)
    }
  }

  return (
    <div className="login-required-container">
      <div className="login-required-card">
        <div className="lock-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
        </div>

        <h2 className="title">Login Required</h2>
        <p className="description">
          You need to be signed in to Gemfolders to purchase a subscription.
          Please log in with your Google account to continue.
        </p>

        {success ? (
          <p className="success-message">
            ✓ Signed in successfully! Redirecting to Gemini...
          </p>
        ) : (
          <>
            <button
              className={`login-button ${loading ? "loading" : ""}`}
              onClick={handleLogin}
              disabled={loading}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                width="18"
                height="18">
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              {loading ? "Signing in..." : "Sign in with Google"}
            </button>

            {error && <p className="error-message">{error}</p>}
          </>
        )}
      </div>
    </div>
  )
}

export default LoginRequired
