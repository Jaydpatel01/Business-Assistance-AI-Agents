"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import type React from "react"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
        storageKey="business-ai-theme"
      >
        <div id="root" className="min-h-screen flex flex-col">
          {children}
        </div>
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
}
