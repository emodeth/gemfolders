import { useState } from "react"
import toast from "react-hot-toast"
import { Send } from "lucide-react"

import { supabase } from "~lib/supabase"
import { Input } from "~components/ui/Input"

function MagicLinkLogin() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      })
      if (error) throw error
      toast.success("Magic link sent! Check your email.")
    } catch (error) {
      toast.error(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleMagicLinkLogin}>
      <h3 className="organizer-text-text-primary organizer-font-bold organizer-text-sm organizer-mb-2">
        Login with Magic Links
      </h3>
      <p className="organizer-text-text-secondary organizer-text-xs organizer-mb-3 organizer-leading-relaxed">
        Enter your email to receive a{" "}
        <span className="organizer-text-primary organizer-font-medium">
          Magic Link
        </span>{" "}
        for secure login. If you don't have an account, this will automatically
        create one for you.
      </p>

      <div className="organizer-mb-3">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@mail.com"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="organizer-w-full organizer-bg-surface organizer-text-sm organizer-text-text-primary organizer-font-medium organizer-py-2 organizer-rounded-lg organizer-flex organizer-items-center organizer-justify-center organizer-gap-2 hover:organizer-opacity-80 organizer-transition-colors organizer-border organizer-border-border-default"      >
        <span>{loading ? "Sending..." : "Send Magic Link"}</span>
        <Send size={14} className="organizer-text-primary" />
      </button>
    </form>
  )
}

export default MagicLinkLogin