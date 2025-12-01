"use client"

import { useState, useEffect } from "react"
import { Terminal, MessageSquare, ExternalLink, FileText, RefreshCw, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { type WorkflowCard, type FileChange, AGENTS } from "@/lib/bmad-data"
import { cn } from "@/lib/utils"
import { TerminalLaunchInline } from "./terminal-launch-inline"
import { ChatLaunchInline } from "./chat-launch-inline"
import { CopyCommandsInline } from "./copy-commands-inline"
import type { TerminalAgent } from "./terminal-manager"

interface ActionDrawerProps {
  workflow: WorkflowCard | null
  onClose: () => void
  onTerminalLaunch: (
    agentLaunchCommand: string,
    workflowCommand: string,
    terminalAgent: TerminalAgent,
    workflowName: string,
  ) => void
  onOpenChat: (workflowId: string, workflowTitle: string) => void
  onChatLaunch?: (agentLaunchCommand: string, workflowCommand: string, workflowName: string) => void
  defaultTerminalAgent: TerminalAgent
  persistedCommands?: Record<string, string>
  onCommandEdit?: (workflowId: string, command: string) => void
}

type RunMode = "terminal" | "chat" | "copy"

export function ActionDrawer({
  workflow,
  onClose,
  onTerminalLaunch,
  onOpenChat,
  onChatLaunch,
  defaultTerminalAgent,
  persistedCommands,
  onCommandEdit,
}: ActionDrawerProps) {
  const [runMode, setRunMode] = useState<RunMode>("terminal")
  const [fileChanges, setFileChanges] = useState<FileChange[]>([])

  useEffect(() => {
    if (!workflow) return

    const initialChanges: FileChange[] = (workflow.outputs || []).map((output, i) => ({
      id: `fc-expected-${i}`,
      filename: output,
      path: `devDocs/${output}`,
      changeType: workflow.status === "complete" ? "created" : "modified",
      timestamp: new Date(Date.now() - Math.random() * 3600000),
    }))
    setFileChanges(initialChanges)

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const mockFiles = ["notes.md", "draft.md", "temp.json", "log.txt"]
        const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)]
        setFileChanges((prev) => [
          {
            id: `fc-${Date.now()}`,
            filename: randomFile,
            path: `devDocs/${randomFile}`,
            changeType: Math.random() > 0.5 ? "created" : "modified",
            timestamp: new Date(),
          },
          ...prev.slice(0, 9),
        ])
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [workflow])

  if (!workflow) return null

  const agent = AGENTS[workflow.agent]

  const agentIdMap: Record<string, string> = {
    analyst: "ba",
    architect: "sa",
    pm: "pm",
    dev: "sm",
    po: "po",
  }
  const agentId = agentIdMap[workflow.agent] || "pm"

  const persistedCommand = persistedCommands?.[workflow.title]

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date)
  }

  return (
    <Sheet open={!!workflow} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-[500px] sm:max-w-[500px] bg-sidebar border-border overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{workflow.title}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Workflow info */}
          <div className="p-4 bg-card rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">{workflow.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-secondary flex items-center justify-center text-xs font-medium">
                  {agent.label[0]}
                </span>
                {agent.label}
              </span>
              {workflow.estimatedTime && <span className="text-muted-foreground">~{workflow.estimatedTime}</span>}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Run via</h4>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={runMode === "terminal" ? "default" : "outline"}
                className="flex flex-col items-center gap-2 h-auto py-3"
                onClick={() => setRunMode("terminal")}
              >
                <Terminal className="w-5 h-5" />
                <span className="text-xs font-medium">Terminal</span>
              </Button>
              <Button
                variant={runMode === "chat" ? "default" : "outline"}
                className="flex flex-col items-center gap-2 h-auto py-3"
                onClick={() => setRunMode("chat")}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs font-medium">BMAD Chat</span>
              </Button>
              <Button
                variant={runMode === "copy" ? "default" : "outline"}
                className="flex flex-col items-center gap-2 h-auto py-3"
                onClick={() => setRunMode("copy")}
              >
                <Copy className="w-5 h-5" />
                <span className="text-xs font-medium">Copy</span>
              </Button>
            </div>
          </div>

          {runMode === "terminal" && (
            <TerminalLaunchInline
              config={{
                workflowName: workflow.title,
                workflowTrigger: `*${workflow.id}`,
                agentId: agentId,
              }}
              defaultTerminalAgent={defaultTerminalAgent}
              onLaunch={(agentCmd, workflowCmd, termAgent, workflowName) => {
                onTerminalLaunch(agentCmd, workflowCmd, termAgent, workflowName)
                onClose()
              }}
              persistedCommand={persistedCommand}
              onCommandEdit={onCommandEdit}
            />
          )}

          {runMode === "chat" && (
            <ChatLaunchInline
              config={{
                workflowName: workflow.title,
                workflowTrigger: `*${workflow.id}`,
                agentId: agentId,
              }}
              onLaunch={(agentCmd, workflowCmd, workflowName) => {
                if (onChatLaunch) {
                  onChatLaunch(agentCmd, workflowCmd, workflowName)
                } else {
                  onOpenChat(workflow.id, workflow.title)
                }
                onClose()
              }}
              persistedCommand={persistedCommand}
              onCommandEdit={onCommandEdit}
            />
          )}

          {runMode === "copy" && (
            <CopyCommandsInline
              config={{
                workflowName: workflow.title,
                workflowTrigger: `*${workflow.id}`,
                agentId: agentId,
              }}
              persistedCommand={persistedCommand}
              onCommandEdit={onCommandEdit}
            />
          )}

          {/* Outputs & Activity section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Outputs & Activity</h4>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                <RefreshCw className="w-3.5 h-3.5" />
                Live
              </Button>
            </div>

            {workflow.outputs && workflow.outputs.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">Expected outputs:</p>
                <div className="flex flex-wrap gap-2">
                  {workflow.outputs.map((output) => (
                    <span key={output} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-mono">
                      {output}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="max-h-48 overflow-y-auto space-y-1.5">
              {fileChanges.map((change) => (
                <div
                  key={change.id}
                  className="flex items-center justify-between p-2 bg-card rounded border border-border text-sm hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded flex-shrink-0",
                        change.changeType === "created"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-blue-500/20 text-blue-400",
                      )}
                    >
                      {change.changeType}
                    </span>
                    <span className="font-mono truncate">{change.filename}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">{formatTime(change.timestamp)}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
