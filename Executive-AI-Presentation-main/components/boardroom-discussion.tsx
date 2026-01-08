"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { getRoleColor } from "@/lib/utils"
import type { Role } from "@/lib/assistant-config"

interface BoardroomMessage {
  role: Role
  message: string
}

export function BoardroomDiscussion() {
  const [topic, setTopic] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [discussion, setDiscussion] = useState<BoardroomMessage[]>([])
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(["CEO", "CFO", "CTO", "HR"])
  const { toast } = useToast()

  const generateDiscussion = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for the boardroom discussion.",
        variant: "destructive",
      })
      return
    }

    if (selectedRoles.length === 0) {
      toast({
        title: "Roles required",
        description: "Please select at least one role for the discussion.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setDiscussion([])

    try {
      const response = await fetch("/api/boardroom-discussion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          roles: selectedRoles,
        }),
      })

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`)
      }

      const data = await response.json()
      setDiscussion(data.discussion)
    } catch (error) {
      console.error("Error generating boardroom discussion:", error)
      toast({
        title: "Error",
        description: "Failed to generate boardroom discussion. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRole = (role: Role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role))
    } else {
      setSelectedRoles([...selectedRoles, role])
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Boardroom Discussion Simulator</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Discussion Topic</label>
        <div className="flex gap-2">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a business topic for discussion..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={generateDiscussion} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Generate Discussion
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Participating Roles</label>
        <div className="flex flex-wrap gap-2">
          {(["CEO", "CFO", "CTO", "HR"] as Role[]).map((role) => (
            <Button
              key={role}
              variant={selectedRoles.includes(role) ? "default" : "outline"}
              onClick={() => toggleRole(role)}
              className="flex items-center"
              style={{
                backgroundColor: selectedRoles.includes(role) ? getRoleColor(role) : "transparent",
                color: selectedRoles.includes(role) ? "white" : undefined,
                borderColor: getRoleColor(role),
              }}
              disabled={isLoading}
            >
              {role}
            </Button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Generating boardroom discussion... This may take a minute.</p>
        </div>
      )}

      <AnimatePresence>
        {discussion.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h3 className="text-xl font-medium mb-4">Discussion on: {topic}</h3>
            <div className="space-y-4">
              {discussion.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="border-l-4" style={{ borderLeftColor: getRoleColor(item.role) }}>
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: getRoleColor(item.role) }}
                        ></div>
                        <span className="font-medium">{item.role}</span>
                      </div>
                      <p className="text-gray-700">{item.message}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
