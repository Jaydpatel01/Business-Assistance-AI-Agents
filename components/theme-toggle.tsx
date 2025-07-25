"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { toggleTheme, isLoading, getEffectiveTheme, theme, preferences } = useTheme()

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <div className="h-4 w-4 animate-pulse bg-muted rounded" />
      </Button>
    )
  }

  const currentTheme = getEffectiveTheme()
  const isSystemTheme = theme === 'system'

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme} 
      className="h-9 w-9 hover:bg-accent transition-colors"
      aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode${isSystemTheme ? ' (currently following system)' : ''}`}
      title={`Current: ${currentTheme}${isSystemTheme ? ' (system)' : ''}${preferences.autoSwitch ? ' • Auto-switch enabled' : ''}`}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
      {preferences.autoSwitch && (
        <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
      )}
    </Button>
  )
}
