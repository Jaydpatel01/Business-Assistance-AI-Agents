"use client"

import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"

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
  const searchParams = useSearchParams()
  
  const extendedUser = session?.user as ExtendedUser | undefined
  const isDemo = extendedUser?.isDemo || false
  const isDemoCredentials = extendedUser?.email && [
    "demo@businessai.com",
    "test@example.com", 
    "guest@demo.com"
  ].includes(extendedUser.email)
  
  // Also check URL parameters for demo mode
  const isDemoFromUrl = searchParams?.get('demo') === 'true'
  
  // Check if sessionId contains 'demo-' pattern (for demo sessions)
  const currentUrl = typeof window !== 'undefined' ? window.location.pathname : ''
  const isDemoSession = currentUrl.includes('/demo-') || currentUrl.includes('demo=true')
  
  const finalDemoState = isDemo || isDemoCredentials || isDemoFromUrl || isDemoSession
  
  console.log('🔍 Demo mode detection:', {
    isDemo,
    isDemoCredentials,
    isDemoFromUrl,
    isDemoSession,
    finalDemoState,
    currentUrl,
    searchParams: searchParams ? Object.fromEntries(searchParams.entries()) : null
  })
  
  return {
    isDemo: finalDemoState,
    user: session?.user,
    isAuthenticated: !!session?.user
  }
}
