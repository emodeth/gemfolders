import React from "react"

import { useAuth } from "~context/AuthContext"
import LoggedInView from "./LoggedInView"
import LoggedOutView from "./LoggedOutView"

const AccountTab: React.FC = () => {
  const { session, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (session?.user) {
    return <LoggedInView user={session} />
  }

  return <LoggedOutView />
}

export default AccountTab
