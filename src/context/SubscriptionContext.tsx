import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react"

import { supabase } from "~lib/supabase"
import type { AccessLevel, UserAccess } from "~types/subscription"

import { useAuth } from "./AuthContext"

interface SubscriptionContextType {
  userAccess: UserAccess | null
  isLoading: boolean
  isPro: boolean
  accessLevel: AccessLevel
  refreshSubscription: () => Promise<void>
}

const ACCESS_CACHE_TTL = 60 * 1000

// Shared by every SubscriptionProvider in this page so multiple widgets don't
// each query user_access.
let accessCache: {
  userId: string
  data: UserAccess | null
  fetchedAt: number
} | null = null
let accessInFlight: {
  userId: string
  promise: Promise<UserAccess | null | undefined>
} | null = null

/** Resolves to undefined when the fetch failed and state should be kept. */
const loadUserAccess = (
  userId: string,
  force: boolean
): Promise<UserAccess | null | undefined> => {
  if (
    !force &&
    accessCache?.userId === userId &&
    Date.now() - accessCache.fetchedAt < ACCESS_CACHE_TTL
  ) {
    return Promise.resolve(accessCache.data)
  }
  if (accessInFlight?.userId === userId) return accessInFlight.promise

  const promise = (async () => {
    try {
      const { data, error } = await supabase
        .from("user_access")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user access:", error)
        return undefined
      }

      const access = error ? null : (data as UserAccess)
      accessCache = { userId, data: access, fetchedAt: Date.now() }
      return access
    } catch (err) {
      console.error("Error fetching subscription:", err)
      return undefined
    } finally {
      accessInFlight = null
    }
  })()

  accessInFlight = { userId, promise }
  return promise
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
)

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { user } = useAuth()
  const [userAccess, setUserAccess] = useState<UserAccess | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserAccess = useCallback(
    async (force = false) => {
      if (!user?.id) {
        setUserAccess(null)
        setIsLoading(false)
        return
      }

      try {
        const result = await loadUserAccess(user.id, force)
        if (result !== undefined) setUserAccess(result)
      } finally {
        setIsLoading(false)
      }
    },
    [user?.id]
  )

  const refreshSubscription = useCallback(async () => {
    setIsLoading(true)
    await fetchUserAccess(true)
  }, [fetchUserAccess])

  useEffect(() => {
    fetchUserAccess()
  }, [fetchUserAccess])

  // Re-check when the user comes back to the tab (e.g. after checkout) instead
  // of keeping a Realtime channel open in every Gemini tab.
  useEffect(() => {
    if (!user?.id) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchUserAccess()
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [user?.id, fetchUserAccess])

  const accessLevel: AccessLevel = useMemo(() => {
    if (!userAccess) return "free"

    if (userAccess.access_status === "lifetime") {
      return "lifetime"
    }

    if (userAccess.current_period_end) {
      const endDate = new Date(userAccess.current_period_end)
      if (endDate > new Date()) {
        return userAccess.access_status
      }
    }

    return "free"
  }, [userAccess])

  const isPro = useMemo(() => {
    return accessLevel !== "free"
  }, [accessLevel])

  const value = useMemo(
    () => ({
      userAccess,
      isLoading,
      isPro,
      accessLevel,
      refreshSubscription
    }),
    [userAccess, isLoading, isPro, accessLevel, refreshSubscription]
  )

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    )
  }
  return context
}
