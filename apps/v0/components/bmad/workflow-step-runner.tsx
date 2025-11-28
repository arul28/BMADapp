"use client"

import { useState, useEffect } from "react"
import { Terminal, MessageSquare, ExternalLink, FileText, RefreshCw, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { type WorkflowStep, type FileChange, AGENTS, getStepStatusColor } from "@/lib/bmad-data"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { TerminalLaunchInline } from "./terminal-launch-inline"
import { ChatLaunchInline } from "./chat-launch-inline"
import { CopyCommandsInline } from "./copy-commands-inline"
import type { TerminalAgent } from "./terminal-manager"

interface WorkflowStepRunnerProps {
  step: WorkflowStep | null
  epicId?: string
  storyId?: string
  onClose: () => void
  onTerminalLaunch: (
    agentLaunchCommand: string,
    workflowCommand: string,
    terminalAgent: TerminalAgent,
    workflowName: string,
  ) => void
  onOpenChat: (stepId: string, stepName: string) => void
  onChatLaunch?: (agentLaunchCommand: string, workflowCommand: string, workflowName: string) => void
  defaultTerminalAgent: TerminalAgent
  persistedCommands?: Record<string, string>
  onCommandEdit?: (workflowId: string, command: string) => void
}

export function WorkflowStepRunner({
  step,
  epicId,
  storyId,
  onClose,
  onTerminalLaunch,
  onOpenChat,
  onChatLaunch,
  defaultTerminalAgent,
  persistedCommands,
  onCommandEdit,
}: WorkflowStepRunnerProps) {
  const [runMode, setRunMode] = useState<"terminal" | "chat" | "copy">("terminal")
  const [fileChanges, setFileChanges] = useState<FileChange[]>([])

  useEffect(() => {
    if (!step) return

    const initialChanges: FileChange[] = (step.outputs || []).map((output, i) => ({
      id: `fc-step-${i}`,
      filename: output,
      path: `devDocs/stories/${storyId || epicId}/${output}`,
      changeType: step.status === "done" ? "created" : "modified",
      timestamp: new Date(Date.now() - Math.random() * 3600000),
    }))
    setFileChanges(initialChanges)

    const interval = setInterval(() => {
      if (Math.random() > 0.75) {
        const mockFiles = ["draft.md", "validation.json", "context-update.xml"]
        const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)]
        setFileChanges((prev) => [
          {
            id: `fc-${Date.now()}`,
            filename: randomFile,
            path: `devDocs/stories/${storyId || epicId}/${randomFile}`,
            changeType: Math.random() > 0.5 ? "created" : "modified",
            timestamp: new Date(),
          },
          ...prev.slice(0, 5),
        ])
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [step, epicId, storyId])

  if (!step) return null

  const agent = AGENTS[step.agent]
  const command = step.command?.replace("{epicId}", epicId || "").replace("{storyId}", storyId || "") || ""

  const agentIdMap: Record<string, string> = {
    analyst: "ba",
    architect: "sa",
    pm: "pm",
    dev: "sm",
    po: "po",
  }
  const agentId = agentIdMap[step.agent] || "sm"

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "done":
        return "Done"
      case "in-progress":
        return "In Progress"
      case "review":
        return "Review"
      case "skipped":
        return "Skipped"
      default:
        return "Not Started"
    }
  }

  const isDisabled = step.status === "done" || step.status === "skipped"

  const persistedCommand = persistedCommands?.[step.displayName]

  return (
    <Sheet open={!!step} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-[500px] sm:max-w-[500px] bg-sidebar border-border overflow-y-auto p-0">
        <div className="p-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-3 text-xl">
              <span className="font-mono text-primary">{step.name}</span>
              <Badge variant="secondary" className={cn(getStepStatusColor(step.status))}>
                {getStatusLabel(step.status)}
              </Badge>
              {step.isOptional && (
                <Badge variant="outline" className="text-muted-foreground">
                  Optional
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6">
            <div className="p-4 bg-card rounded-lg border border-border">
              <h4 className="font-medium mb-2">{step.displayName}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                    {agent.label[0]}
                  </span>
                  <span className="text-muted-foreground">Agent:</span>
                  <span className="font-medium">{agent.label}</span>
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Run via</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={runMode === "terminal" ? "default" : "outline"}
                  className="flex flex-col items-center gap-2 h-auto py-3"
                  onClick={() => setRunMode("terminal")}
                  disabled={isDisabled}
                >
                  <Terminal className="w-5 h-5" />
                  <span className="text-xs font-medium">Terminal</span>
                </Button>
                <Button
                  variant={runMode === "chat" ? "default" : "outline"}
                  className="flex flex-col items-center gap-2 h-auto py-3"
                  onClick={() => setRunMode("chat")}
                  disabled={isDisabled}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-xs font-medium">BMAD Chat</span>
                </Button>
                <Button
                  variant={runMode === "copy" ? "default" : "outline"}
                  className="flex flex-col items-center gap-2 h-auto py-3"
                  onClick={() => setRunMode("copy")}
                  disabled={isDisabled}
                >
                  <Copy className="w-5 h-5" />
                  <span className="text-xs font-medium">Copy</span>
                </Button>
              </div>
            </div>

            {runMode === "terminal" && !isDisabled && (
              <TerminalLaunchInline
                config={{
                  workflowName: step.displayName,
                  workflowTrigger: command,
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

            {runMode === "chat" && !isDisabled && (
              <ChatLaunchInline
                config={{
                  workflowName: step.displayName,
                  workflowTrigger: command,
                  agentId: agentId,
                }}
                onLaunch={(agentCmd, workflowCmd, workflowName) => {
                  if (onChatLaunch) {
                    onChatLaunch(agentCmd, workflowCmd, workflowName)
                  } else {
                    onOpenChat(step.id, step.displayName)
                  }
                  onClose()
                }}
                persistedCommand={persistedCommand}
                onCommandEdit={onCommandEdit}
              />
            )}

            {runMode === "copy" && !isDisabled && (
              <CopyCommandsInline
                config={{
                  workflowName: step.displayName,
                  workflowTrigger: command,
                  agentId: agentId,
                }}
                persistedCommand={persistedCommand}
                onCommandEdit={onCommandEdit}
              />
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Outputs & Activity</h4>
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Live
                </Button>
              </div>

              {step.outputs && step.outputs.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-3">Expected outputs:</p>
                  <div className="flex flex-wrap gap-2">
                    {step.outputs.map((output) => (
                      <span
                        key={output}
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-mono"
                      >
                        {output}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="max-h-48 overflow-y-auto space-y-2">
                {fileChanges.map((change) => (
                  <div
                    key={change.id}
                    className="flex items-center justify-between p-3 bg-card rounded-lg border border-border text-sm hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded flex-shrink-0",
                          change.changeType === "created"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-blue-500/20 text-blue-400",
                        )}
                      >
                        {change.changeType}
                      </span>
                      <span className="font-mono truncate text-sm">{change.filename}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">{formatTime(change.timestamp)}</span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
