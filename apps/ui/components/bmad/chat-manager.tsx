"use client"

import { MessageSquare, Plus, ExternalLink, Circle, AlertCircle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SlideSidebar } from "./slide-sidebar"
import type { ChatThread, WorkflowCard } from "@/lib/bmad-data"
import { cn } from "@/lib/utils"

interface ChatManagerProps {
  open: boolean
  onClose: () => void
  threads: ChatThread[]
  onCreateThread: (workflowId?: string, workflowTitle?: string) => void
  currentWorkflow?: WorkflowCard | null
  hasProvider: boolean
  onOpenSettings: () => void
}

export function ChatManager({
  open,
  onClose,
  threads,
  onCreateThread,
  currentWorkflow,
  hasProvider,
  onOpenSettings,
}: ChatManagerProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  return (
    <SlideSidebar
      isOpen={open}
      onClose={onClose}
      title="Chat Manager"
      icon={<MessageSquare className="w-5 h-5" />}
      defaultWidth={500}
      minWidth={400}
      maxWidth={800}
    >
      <div className="p-6 pl-8 flex-1 flex flex-col gap-4 h-full">
        {/* No provider warning */}
        {!hasProvider && (
          <Alert className="border-amber-500/50 bg-amber-500/10">
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

        {/* New Thread Button */}
        <Button
          onClick={() => onCreateThread(currentWorkflow?.id, currentWorkflow?.title)}
          className="w-full gap-2"
          disabled={!hasProvider}
        >
          <Plus className="w-4 h-4" />
          New Chat Thread
          {currentWorkflow && <span className="text-xs opacity-75">({currentWorkflow.title})</span>}
        </Button>

        {/* Threads List */}
        <div className="flex-1 flex flex-col">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Threads</h4>
          <ScrollArea className="flex-1">
            {threads.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">No chat threads yet</div>
            ) : (
              <div className="space-y-2 pr-4">
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    className="p-3 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Circle
                            className={cn(
                              "w-2 h-2 flex-shrink-0",
                              thread.status === "active"
                                ? "fill-status-active text-status-active"
                                : "fill-muted text-muted",
                            )}
                          />
                          <span className="text-sm font-medium truncate">
                            {thread.originWorkflowTitle || "General Chat"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {thread.providerName && (
                            <span className="text-xs px-1.5 py-0.5 bg-secondary rounded">{thread.providerName}</span>
                          )}
                          <span className="text-xs text-muted-foreground">{thread.messageCount} messages</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(thread.createdAt)} · {thread.status}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </SlideSidebar>
  )
}
