import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Role } from "@/lib/assistant-config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRoleColor(role: Role) {
  switch (role) {
    case "CEO":
      return "#4f46e5" // indigo
    case "CFO":
      return "#0ea5e9" // sky blue
    case "CTO":
      return "#8b5cf6" // purple
    case "HR":
      return "#ec4899" // pink
    default:
      return "#4f46e5" // default to indigo
  }
}
