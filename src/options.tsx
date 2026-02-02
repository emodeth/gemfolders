import { useEffect, useState } from "react"
import { supabase } from "~lib/supabase"
import "./options.css"


const IndexOptions = () => {
  const [status, setStatus] = useState("Signing in to Gemfolders...")

  useEffect(() => {

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setStatus("Signed in successfully! You are being redirected to Gemini")

        setTimeout(() => {
          globalThis.location.href = "https://gemini.google.com"
        }, 1000)
      } else if (event === "SIGNED_OUT") {
        setStatus("Couldn't sign in or session expired.")
      }
    })
  }, [])

  return (
    <div className="options-container">
      <div className="options-card">
        <div className="spinner"></div>

        <h2 className="title">Gemfolders</h2>
        <p className="status">{status}</p>
      </div>
    </div>
  )
}

export default IndexOptions