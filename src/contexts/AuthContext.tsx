"use client"

import * as React from "react"
import type { User } from "firebase/auth"

import {
  signIn as fbSignIn,
  signOut as fbSignOut,
  watchAuth,
  isAdminUid,
} from "@/lib/firebase/auth"
import {
  firebaseConfigured,
  ADMIN_UID,
} from "@/lib/firebase/config"

type AuthState = {
  user: User | null
  loading: boolean
  isAdmin: boolean
  /** `true` se as env vars do Firebase estão preenchidas. */
  configured: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = React.createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState<boolean>(firebaseConfigured)

  React.useEffect(() => {
    if (!firebaseConfigured) {
      setLoading(false)
      return
    }
    const unsub = watchAuth((u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const signIn = React.useCallback(async (email: string, password: string) => {
    await fbSignIn(email, password)
  }, [])

  const signOut = React.useCallback(async () => {
    await fbSignOut()
  }, [])

  const value: AuthState = React.useMemo(
    () => ({
      user,
      loading,
      isAdmin: isAdminUid(user?.uid) && Boolean(ADMIN_UID),
      configured: firebaseConfigured,
      signIn,
      signOut,
    }),
    [user, loading, signIn, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = React.useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
