"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCircle, AlertTriangle, Info, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  title: string
  message: string
  type: "success" | "warning" | "info"
  timestamp: Date
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Decision Approved",
    message: "Q4 Strategic Investment Review has been unanimously approved",
    type: "success",
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    read: false,
  },
  {
    id: "2",
    title: "Session Reminder",
    message: "Remote Work Policy 2025 session scheduled for tomorrow at 10:00 AM",
    type: "info",
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    read: false,
  },
  {
    id: "3",
    title: "Budget Alert",
    message: "Q4 budget utilization has reached 85% threshold",
    type: "warning",
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    read: true,
  },
]

interface NotificationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationsDialog({ open, onOpenChange }: NotificationsDialogProps) {
  const [notifications, setNotifications] = useState(mockNotifications)
  const { toast } = useToast()

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
    toast({
      title: "Notification removed",
      description: "The notification has been dismissed.",
    })
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
    toast({
      title: "All notifications marked as read",
      description: "All notifications have been marked as read.",
    })
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </DialogTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-colors ${
                  notification.read ? "bg-muted/30 border-border" : "bg-accent/20 border-accent"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getIcon(notification.type)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-destructive/20"
                        onClick={() => removeNotification(notification.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{notification.timestamp.toLocaleString()}</span>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
