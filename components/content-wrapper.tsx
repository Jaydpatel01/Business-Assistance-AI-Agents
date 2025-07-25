"use client"

import { useDemoMode } from "@/hooks/use-demo-mode"
import { DemoBanner } from "./demo-banner"
import { ReactNode } from "react"

interface ContentWrapperProps {
  children: ReactNode
  demoContent?: ReactNode
  className?: string
}

export function ContentWrapper({ children, demoContent, className }: ContentWrapperProps) {
  const { isDemo } = useDemoMode()

  return (
    <div className={className}>
      {isDemo && <DemoBanner className="mb-6" />}
      {isDemo && demoContent ? demoContent : children}
    </div>
  )
}
