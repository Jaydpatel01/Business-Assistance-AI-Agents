"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Send } from "lucide-react"

interface MessageInputProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({ 
  onSendMessage, 
  isLoading = false, 
  disabled = false,
  placeholder = "Ask a strategic question to begin the executive discussion..."
}: MessageInputProps) {
  const [inputMessage, setInputMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim() && !isLoading && !disabled) {
      onSendMessage(inputMessage.trim())
      setInputMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={3}
            disabled={disabled || isLoading}
            className="resize-none"
            aria-label="Strategic question input"
          />
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Press Enter to send, Shift+Enter for new line
            </div>
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isLoading || disabled}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
