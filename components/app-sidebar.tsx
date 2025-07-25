"use client"

import { Brain, LayoutDashboard, FileText, Users, ClipboardList, Settings, BarChart3, Upload, Bot } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { UserNav } from "@/components/user-nav"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Scenarios",
    url: "/scenarios",
    icon: FileText,
  },
  {
    title: "Board Sessions",
    url: "/board-sessions",
    icon: Users,
  },
  {
    title: "Decisions",
    url: "/decisions",
    icon: ClipboardList,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Documents",
    url: "/documents",
    icon: Upload,
  },
  {
    title: "Agents",
    url: "/agents",
    icon: Bot,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

// Update the sidebar to use icon mode by default
export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="icon" className="border-r bg-card">
      <SidebarHeader className="bg-card border-b">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="p-2 bg-primary rounded-xl shrink-0">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">Business AI</span>
              <Badge variant="secondary" className="text-xs">
                Pro
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Decision Intelligence Platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 bg-card">
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:sr-only px-2 mb-2">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={state === "collapsed" ? item.title : undefined}
                    className="mx-1"
                  >
                    <Link href={item.url} className="flex items-center gap-3 w-full">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="group-data-[collapsible=icon]:sr-only font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI Status Section */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden mt-auto">
          <SidebarGroupLabel className="px-2 mb-2">AI Status</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-2 bg-muted rounded-lg mx-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium">All Agents Online</span>
              </div>
              <p className="text-xs text-muted-foreground">4 AI executives ready</p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserNav />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
