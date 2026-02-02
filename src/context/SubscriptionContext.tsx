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

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
)

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { user } = useAuth()
  const [userAccess, setUserAccess] = useState<UserAccess | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserAccess = useCallback(async () => {
    if (!user?.id) {
      setUserAccess(null)
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("user_access")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          setUserAccess(null)
        } else {
          console.error("Error fetching user access:", error)
        }
      } else {
        setUserAccess(data)
      }
    } catch (err) {
      console.error("Error fetching subscription:", err)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  const refreshSubscription = useCallback(async () => {
    setIsLoading(true)
    await fetchUserAccess()
  }, [fetchUserAccess])

  useEffect(() => {
    fetchUserAccess()
  }, [fetchUserAccess])

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`user_access_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_access",
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setUserAccess(null)
          } else {
            setUserAccess(payload.new as UserAccess)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

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
