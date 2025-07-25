"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Eye, ArrowRight } from "lucide-react"
import Link from "next/link"

interface DemoBannerProps {
  className?: string
}

export function DemoBanner({ className }: DemoBannerProps) {
  return (
    <Alert className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-blue-800 ${className}`}>
      <Play className="h-4 w-4 text-blue-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            <Eye className="h-3 w-3 mr-1" />
            Demo Mode
          </Badge>
          <span className="text-sm">
            You're viewing demo content. 
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium ml-1 underline">
              Sign in with Google
            </Link> for the full experience.
          </span>
        </div>
        <Button size="sm" variant="outline" asChild className="hidden sm:flex">
          <Link href="/login">
            Get Full Access
            <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}
