"use client"

import { useEffect, useState } from "react"
import { formatDate, formatTime, formatDateTime } from "@/lib/date-utils"

interface ClientDateProps {
  date: string | Date
  format?: "date" | "time" | "datetime"
  fallback?: string
}

export function ClientDate({ date, format = "date", fallback = "—" }: ClientDateProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <span>{fallback}</span>
  }

  try {
    switch (format) {
      case "time":
        return <span>{formatTime(date)}</span>
      case "datetime":
        return <span>{formatDateTime(date)}</span>
      case "date":
      default:
        return <span>{formatDate(date)}</span>
    }
  } catch (error) {
    console.warn("Error formatting date:", error)
    return <span>{fallback}</span>
  }
}
