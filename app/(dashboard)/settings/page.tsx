"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, X } from "lucide-react"

interface UserProfile {
  id: string
  name: string | null
  email: string | null
  company: string | null
  image: string | null
  role: string
  createdAt: string
  updatedAt: string
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    company: "",
  })
  const [preferences, setPreferences] = useState({
    defaultIndustry: "technology",
    simulationLength: "medium",
    autoSummaries: true,
    emailNotifications: true,
  })

  // Check if user is in demo mode
  const isDemoUser = session?.user?.email === 'demo@businessai.com' || 
                     session?.user?.email === 'demo@user.com' || 
                     session?.user?.name === 'Demo User'

  // Load user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Use demo data for demo users
        if (isDemoUser) {
          const demoProfile = {
            id: "demo-user-id",
            name: "Demo User",
            email: "demo@businessai.com",
            company: "TechCorp Inc.",
            role: "Executive",
            image: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          setProfile(demoProfile)
          setFormData({
            name: demoProfile.name,
            company: demoProfile.company,
          })
          setIsLoading(false)
          return
        }

        const response = await fetch("/api/user/profile")
        if (response.ok) {
          const data = await response.json()
          setProfile(data.user)
          setFormData({
            name: data.user.name || "",
            company: data.user.company || "",
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Profile fetch error:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchProfile()
    } else {
      setIsLoading(false)
    }
  }, [session, toast, isDemoUser])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePreferenceChange = (field: string, value: string | boolean) => {
    setPreferences(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Handle demo mode saving (simulate success)
      if (isDemoUser) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Update local state
        setProfile(prev => prev ? {
          ...prev,
          name: formData.name,
          company: formData.company,
          updatedAt: new Date().toISOString()
        } : null)
        
        toast({
          title: "Demo Mode",
          description: "Profile changes simulated successfully (demo mode)",
        })
        setIsSaving(false)
        return
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        company: profile.company || "",
      })
    }
    toast({
      title: "Changes cancelled",
      description: "Your changes have been discarded",
    })
  }

  const handleChangeAvatar = () => {
    toast({
      title: "Coming Soon",
      description: "Avatar upload functionality will be available soon",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    )
  }

  const userInitials = (profile?.name || session?.user?.name || "User")
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.image || session?.user?.image || "/placeholder-user.jpg"} alt="Profile" />
                <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" size="sm" onClick={handleChangeAvatar}>
                  Change Avatar
                </Button>
                <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={profile?.email || ""} 
                  disabled
                  className="opacity-50 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input 
                  id="company" 
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  placeholder="Enter your company name"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Simulation Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="defaultIndustry">Default Industry</Label>
              <Select 
                value={preferences.defaultIndustry} 
                onValueChange={(value) => handlePreferenceChange("defaultIndustry", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="simulationLength">Default Simulation Length</Label>
              <Select 
                value={preferences.simulationLength} 
                onValueChange={(value) => handlePreferenceChange("simulationLength", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select simulation length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (15-30 minutes)</SelectItem>
                  <SelectItem value="medium">Medium (30-60 minutes)</SelectItem>
                  <SelectItem value="long">Long (60+ minutes)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-generate summaries</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically create summaries when simulations complete
                </p>
              </div>
              <Switch 
                checked={preferences.autoSummaries} 
                onCheckedChange={(checked) => handlePreferenceChange("autoSummaries", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email updates about simulation completions</p>
              </div>
              <Switch 
                checked={preferences.emailNotifications} 
                onCheckedChange={(checked) => handlePreferenceChange("emailNotifications", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account created:</span>
                <span>{profile ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last updated:</span>
                <span>{profile ? new Date(profile.updatedAt).toLocaleDateString() : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account type:</span>
                <Badge variant="secondary">{profile?.role || "User"}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
