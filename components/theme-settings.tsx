"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/hooks/use-theme"
import { 
  Palette, 
  Clock, 
  Eye, 
  Download, 
  Upload, 
  RotateCcw,
  Sun,
  Moon,
  Monitor
} from "lucide-react"

export function ThemeSettings() {
  const {
    theme,
    preferences,
    setPreferences,
    setTheme,
    previewTheme,
    setPreviewTheme,
    enableAutoSwitch,
    disableAutoSwitch,
    resetToDefaults,
    exportPreferences,
    importPreferences,
  } = useTheme()
  
  const [importText, setImportText] = useState("")

  const handleExport = () => {
    const data = exportPreferences()
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(data)
    }
    // You could show a toast here
  }

  const handleImport = () => {
    if (importPreferences(importText)) {
      setImportText("")
      // You could show a success toast here
    } else {
      // You could show an error toast here
    }
  }

  const handleAutoSwitchToggle = (enabled: boolean) => {
    if (enabled) {
      enableAutoSwitch(preferences.autoSwitchTimes || { light: "06:00", dark: "18:00" })
    } else {
      disableAutoSwitch()
    }
  }

  const handleTimeChange = (type: 'light' | 'dark', value: string) => {
    const currentTimes = preferences.autoSwitchTimes || { light: "06:00", dark: "18:00" }
    const newTimes = {
      ...currentTimes,
      [type]: value
    }
    setPreferences({ autoSwitchTimes: newTimes })
    
    if (preferences.autoSwitch) {
      enableAutoSwitch(newTimes)
    }
  }

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {['light', 'dark', 'system'].map((themeOption) => (
              <Button
                key={themeOption}
                variant={theme === themeOption ? 'default' : 'outline'}
                className="h-20 flex flex-col gap-2"
                onClick={() => setTheme(themeOption)}
              >
                {themeOption === 'light' && <Sun className="h-6 w-6" />}
                {themeOption === 'dark' && <Moon className="h-6 w-6" />}
                {themeOption === 'system' && <Monitor className="h-6 w-6" />}
                <span className="capitalize">{themeOption}</span>
              </Button>
            ))}
          </div>
          
          {/* Theme Preview */}
          <div className="flex items-center gap-4">
            <Label htmlFor="preview">Preview Theme:</Label>
            <div className="flex gap-2">
              {['light', 'dark'].map((previewOption) => (
                <Button
                  key={previewOption}
                  size="sm"
                  variant={previewTheme === previewOption ? 'default' : 'outline'}
                  onClick={() => 
                    setPreviewTheme(previewTheme === previewOption ? null : previewOption)
                  }
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {previewOption}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Switch Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Automatic Theme Switching
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-switch">Enable Auto-Switch</Label>
              <p className="text-sm text-muted-foreground">
                Automatically switch between light and dark themes based on time
              </p>
            </div>
            <Switch
              id="auto-switch"
              checked={preferences.autoSwitch}
              onCheckedChange={handleAutoSwitchToggle}
            />
          </div>
          
          {preferences.autoSwitch && (
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="light-time">Light Mode Time</Label>
                <Input
                  id="light-time"
                  type="time"
                  value={preferences.autoSwitchTimes?.light || "06:00"}
                  onChange={(e) => handleTimeChange('light', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dark-time">Dark Mode Time</Label>
                <Input
                  id="dark-time"
                  type="time"
                  value={preferences.autoSwitchTimes?.dark || "18:00"}
                  onChange={(e) => handleTimeChange('dark', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="high-contrast">High Contrast</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={preferences.highContrast}
              onCheckedChange={(checked) => setPreferences({ highContrast: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="reduced-motion">Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={preferences.reducedMotion}
              onCheckedChange={(checked) => setPreferences({ reducedMotion: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Import/Export */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Settings
            </Button>
            <Button onClick={resetToDefaults} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="import-settings">Import Settings</Label>
            <div className="flex gap-2">
              <Input
                id="import-settings"
                placeholder="Paste exported settings JSON here..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
              <Button onClick={handleImport} disabled={!importText.trim()}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Theme: {theme}</Badge>
            {preferences.autoSwitch && <Badge variant="secondary">Auto-Switch Active</Badge>}
            {preferences.highContrast && <Badge variant="secondary">High Contrast</Badge>}
            {preferences.reducedMotion && <Badge variant="secondary">Reduced Motion</Badge>}
            {previewTheme && <Badge variant="destructive">Previewing: {previewTheme}</Badge>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
