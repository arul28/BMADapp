"use client"

import { useState } from "react"
import { X, Send, AlertCircle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ChatPanelProps {
  open: boolean
  onClose: () => void
  hasProvider: boolean
  onOpenSettings: () => void
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export function ChatPanel({ open, onClose, hasProvider, onOpenSettings }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim() || !hasProvider) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
    }

    setMessages([...messages, userMessage])
    setInput("")

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "This is a placeholder response. Connect a real AI provider in Settings to enable chat functionality.",
      }
      setMessages((prev) => [...prev, assistantMessage])
    }, 500)
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-sidebar border-border flex flex-col">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="flex items-center justify-between">
            BYOK Chat
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        {/* No provider warning */}
        {!hasProvider && (
          <Alert className="mt-4 border-amber-500/50 bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">No AI provider configured</span>
              <Button variant="outline" size="sm" onClick={onOpenSettings}>
                <Settings className="w-3 h-3 mr-1" />
                Set provider
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              Start a conversation with your AI assistant
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 mt-4 pt-4 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <Input
              placeholder={hasProvider ? "Type a message..." : "Configure a provider first"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!hasProvider}
              className="flex-1"
            />
            <Button type="submit" disabled={!hasProvider || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
