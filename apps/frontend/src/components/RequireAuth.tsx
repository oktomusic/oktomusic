import { useEffect, useState } from "react"
import { Navigate, useLocation } from "react-router"
import { useAtom } from "jotai"

import { getSession } from "../api/axios/endpoints/auth"
import { authSessionAtom } from "../atoms/auth/atoms"

interface RequireAuthProps {
  children: React.ReactNode
}

/**
 * A component that protects routes by requiring authentication.
 * If the user is not authenticated, they are redirected to the login page.
 * The original location is passed as state so the user can be redirected back after login.
 */
export default function RequireAuth({ children }: RequireAuthProps) {
  const [authSession, setAuthSession] = useAtom(authSessionAtom)
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    // Check session status on mount
    // Note: setAuthSession is a stable function from jotai's useAtom
    getSession()
      .then((session) => {
        setAuthSession(session)
        setIsLoading(false)
      })
      .catch(() => {
        // On error, treat as unauthenticated
        setAuthSession({ authenticated: false })
        setIsLoading(false)
      })
  }, [setAuthSession])

  if (isLoading) {
    // Show loading state while checking authentication
    return null
  }

  if (!authSession.authenticated) {
    // Redirect to login page with the current location as state
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
