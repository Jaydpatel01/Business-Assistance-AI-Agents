"use client"

import { useSession } from "next-auth/react"

interface ExtendedUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
  role: string
  company?: string
  isDemo?: boolean
}

export function useDemoMode() {
  const { data: session } = useSession()
  
  const extendedUser = session?.user as ExtendedUser | undefined
  const isDemo = extendedUser?.isDemo || false
  const isDemoCredentials = extendedUser?.email && [
    "demo@businessai.com",
    "test@example.com", 
    "guest@demo.com"
  ].includes(extendedUser.email)
  
  return {
    isDemo: isDemo || isDemoCredentials,
    user: session?.user,
    isAuthenticated: !!session?.user
  }
}
