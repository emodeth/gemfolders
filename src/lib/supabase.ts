import { createClient } from "@supabase/supabase-js"

import { Storage } from "@plasmohq/storage"

const storage = new Storage({
  area: "local"
})

export const supabase = createClient(
  process.env.PLASMO_PUBLIC_SUPABASE_URL,
  process.env.PLASMO_PUBLIC_SUPABASE_KEY,
  {
    auth: {
      storage: {
        getItem: async (key) => {
          const val = await storage.get(key)
          return val ? JSON.stringify(val) : null
        },
        setItem: async (key, value) => {
          try {
            const parsed = JSON.parse(value)
            await storage.set(key, parsed)
          } catch {
            await storage.set(key, value)
          }
        },
        removeItem: (key) => storage.remove(key)
      },
      storageKey: "gemfolders-user",
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)
