"use client"

import { useState, useEffect } from "react"
import { Terminal, MessageSquare, ExternalLink, FileText, RefreshCw, CheckCircle2, Circle, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { type PhaseWorkflow, type FileChange, AGENTS } from "@/lib/bmad-data"
import { cn } from "@/lib/utils"
import { TerminalLaunchInline } from "./terminal-launch-inline"
import { ChatLaunchInline } from "./chat-launch-inline"
import { CopyCommandsInline } from "./copy-commands-inline"
import type { TerminalAgent } from "./terminal-manager"

interface PhaseActionDrawerProps {
  workflow: PhaseWorkflow | null
  onClose: () => void
  onTerminalLaunch: (
    agentLaunchCommand: string,
    workflowCommand: string,
    terminalAgent: TerminalAgent,
    workflowName: string,
  ) => void
  onOpenChat: (workflowId: string, workflowTitle: string) => void
  onChatLaunch?: (agentLaunchCommand: string, workflowCommand: string, workflowName: string) => void
  onRunSprintPlanning?: () => void
  defaultTerminalAgent: TerminalAgent
  persistedCommands?: Record<string, string>
  onCommandEdit?: (workflowId: string, command: string) => void
}

export function PhaseActionDrawer({
  workflow,
  onClose,
  onTerminalLaunch,
  onOpenChat,
  onChatLaunch,
  defaultTerminalAgent,
  persistedCommands,
  onCommandEdit,
}: PhaseActionDrawerProps) {
  const [runMode, setRunMode] = useState<"terminal" | "chat" | "copy">("terminal")
  const [fileChanges, setFileChanges] = useState<FileChange[]>([])

  useEffect(() => {
    if (!workflow) return

    const initialChanges: FileChange[] = workflow.outputPath
      ? [
          {
            id: `fc-expected-0`,
            filename: workflow.outputPath.split("/").pop() || "",
            path: workflow.outputPath,
            changeType: workflow.status === "complete" ? "created" : "modified",
            timestamp: new Date(Date.now() - Math.random() * 3600000),
          },
        ]
      : []
    setFileChanges(initialChanges)
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

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date)
  }

  const persistedCommand = persistedCommands?.[workflow.title]

  return (
    <Sheet open={!!workflow} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-[500px] sm:max-w-[500px] bg-sidebar border-border overflow-y-auto p-0">
        <div className="p-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-xl">{workflow.title}</SheetTitle>
          </SheetHeader>

          <div className="space-y-6">
            {/* Workflow info */}
            <div className="p-4 bg-card rounded-lg border border-border">
              <p className="text-sm text-muted-foreground leading-relaxed">{workflow.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-secondary flex items-center justify-center text-xs font-medium">
                    {agent.label[0]}
                  </span>
                  {agent.label}
                </span>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded capitalize",
                    workflow.status === "complete"
                      ? "bg-status-complete/20 text-status-complete"
                      : workflow.status === "active"
                        ? "bg-status-active/20 text-status-active"
                        : "bg-status-pending/20 text-status-pending",
                  )}
                >
                  {workflow.status}
                </span>
              </div>
            </div>

            {/* Inputs */}
            {workflow.inputs.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Inputs</h4>
                <div className="space-y-2">
                  {workflow.inputs.map((input, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-3 text-sm p-4 rounded-lg border",
                        input.exists
                          ? "bg-status-complete/5 border-status-complete/20"
                          : "bg-secondary/50 border-border",
                      )}
                    >
                      {input.exists ? (
                        <CheckCircle2 className="w-4 h-4 text-status-complete flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {input.label}
                          {!input.required && (
                            <span className="text-muted-foreground font-normal ml-2">(optional)</span>
                          )}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground mt-1 truncate">{input.path}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expected Output */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Expected Output</h4>
              <div className="p-4 rounded-lg bg-secondary border border-border">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-mono">{workflow.outputPattern}</span>
                </div>
              </div>

              {workflow.outputPath && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-status-complete/10 border border-status-complete/20">
                  <CheckCircle2 className="w-4 h-4 text-status-complete flex-shrink-0" />
                  <span className="text-sm font-mono flex-1">{workflow.outputPath}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              )}
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
                  workflowTrigger: workflow.command,
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
                  workflowTrigger: workflow.command,
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
                  workflowTrigger: workflow.command,
                  agentId: agentId,
                }}
                persistedCommand={persistedCommand}
                onCommandEdit={onCommandEdit}
              />
            )}

            {/* File activity */}
            {fileChanges.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Recent Activity</h4>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    <RefreshCw className="w-3 h-3" />
                    Live
                  </Button>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {fileChanges.map((change) => (
                    <div
                      key={change.id}
                      className="flex items-center justify-between p-3 bg-card rounded-lg border border-border text-sm"
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
                        <span className="font-mono truncate">{change.filename}</span>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-3">
                        {formatTime(change.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
