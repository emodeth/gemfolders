import { useEffect, useState } from "react"
import { supabase } from "~lib/supabase"
import "~style.css"

const AuthPage = () => {
  const [status, setStatus] = useState("Gemfolders'a giriş yapılıyor...")

  useEffect(() => {

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setStatus("Giriş başarılı! Gemini'ye yönlendiriliyorsunuz...")

        setTimeout(() => {
          window.location.href = "https://gemini.google.com"
        }, 500)
      } else if (event === "SIGNED_OUT") {
        setStatus("Giriş yapılamadı veya oturum kapalı.")
      }
    })
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#131314] text-white">
      <div className="p-8 bg-[#1e1e20] rounded-xl border border-gray-700 shadow-2xl text-center max-w-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>

        <h2 className="text-xl font-bold mb-2">Gemfolders</h2>
        <p className="text-gray-400 text-sm">{status}</p>
      </div>
    </div>
  )
}

export default AuthPage