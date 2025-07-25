"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { User, Settings, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useSidebar } from "@/components/ui/sidebar"
import { useDemoMode } from "@/hooks/use-demo-mode"
import { signOut } from "next-auth/react"

export function UserNav() {
  const router = useRouter()
  const { toast } = useToast()
  const { state } = useSidebar()
  const { isDemo, user } = useDemoMode()

  const handleProfileClick = () => {
    router.push("/settings")
    toast({
      title: "Profile",
      description: "Redirecting to profile settings...",
    })
  }

  const handleSettingsClick = () => {
    router.push("/settings")
    toast({
      title: "Settings",
      description: "Opening settings page...",
    })
  }

  const handleLogoutClick = async () => {
    if (isDemo) {
      toast({
        title: "Demo session ended",
        description: "Thank you for trying our demo!",
      })
    } else {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
    }
    
    await signOut({ callbackUrl: "/login" })
  }

  const userName = user?.name || "User"
  const userEmail = user?.email || ""
  const userCompany = (user as { company?: string })?.company || ""
  const userInitials = userName.split(" ").map(n => n[0]).join("").toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-full justify-start hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
        >
          <Avatar className="h-8 w-8 shrink-0 group-data-[collapsible=icon]:mr-0 mr-2">
            <AvatarImage src={user?.image || "/placeholder-user.jpg"} alt={userName} />
            <AvatarFallback className="bg-sidebar-primary/10 text-sidebar-primary">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-sm group-data-[collapsible=icon]:hidden overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sidebar-foreground">{userName}</span>
              {isDemo && <Badge variant="secondary" className="text-xs px-1 py-0">Demo</Badge>}
            </div>
            <span className="text-xs text-sidebar-foreground/70">{userEmail}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-popover border-border"
        align={state === "collapsed" ? "start" : "end"}
        side={state === "collapsed" ? "right" : "bottom"}
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none text-popover-foreground">{userName}</p>
              {isDemo && <Badge variant="outline" className="text-xs">Demo User</Badge>}
            </div>
            <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
            {userCompany && !isDemo && (
              <p className="text-xs leading-none text-muted-foreground">{userCompany}</p>
            )}
            {isDemo && (
              <p className="text-xs leading-none text-blue-600">
                Sign in with Google for full access
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={handleProfileClick}
          className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSettingsClick}
          className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={handleLogoutClick}
          className="cursor-pointer hover:bg-accent hover:text-accent-foreground text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
