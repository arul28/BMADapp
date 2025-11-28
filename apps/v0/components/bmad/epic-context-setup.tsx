"use client"

import { useState } from "react"
import type { Epic } from "@/lib/bmad-data"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  Circle,
  FileCode2,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Terminal,
  MessageSquare,
  Copy,
} from "lucide-react"
import { TerminalLaunchInline } from "./terminal-launch-inline"
import { ChatLaunchInline } from "./chat-launch-inline"
import { CopyCommandsInline } from "./copy-commands-inline"
import type { TerminalAgent } from "./terminal-manager"

interface EpicContextSetupProps {
  epic: Epic
  onTerminalLaunch: (
    agentLaunchCommand: string,
    workflowCommand: string,
    terminalAgent: TerminalAgent,
    workflowName: string,
  ) => void
  onChatLaunch: (agentLaunchCommand: string, workflowCommand: string, workflowName: string) => void
  onMarkContextDone: () => void
  onMarkValidated: () => void
  defaultTerminalAgent: TerminalAgent
  persistedCommands?: Record<string, string>
  onCommandEdit?: (workflowId: string, command: string) => void
}

export function EpicContextSetup({
  epic,
  onTerminalLaunch,
  onChatLaunch,
  onMarkContextDone,
  onMarkValidated,
  defaultTerminalAgent,
  persistedCommands,
  onCommandEdit,
}: EpicContextSetupProps) {
  const techContextStatus = epic.techContextStatus || "not-started"
  const [expandedStep, setExpandedStep] = useState<"context" | "validate" | null>(null)
  const [runMode, setRunMode] = useState<"terminal" | "chat" | "copy">("terminal")

  const isContextDone = techContextStatus === "context-done" || techContextStatus === "validated"
  const isValidated = techContextStatus === "validated"
  const canProceed = isContextDone

  const contextConfig = {
    workflowName: "Epic Tech Context",
    workflowTrigger: "*epic-tech-context",
    agentId: "sa",
  }

  const validateConfig = {
    workflowName: "Validate Epic Tech Context",
    workflowTrigger: "*validate-epic-tech-context",
    agentId: "sa",
  }

  const handleStepClick = (step: "context" | "validate") => {
    if (expandedStep === step) {
      setExpandedStep(null)
    } else {
      setExpandedStep(step)
    }
  }

  return (
    <div className="p-6 bg-card rounded-lg border border-amber-500/30 mb-6">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-amber-500/10">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">Epic Context Setup Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Before starting stories in this epic, you need to run the Epic Tech Context workflow to establish the
            technical foundation. Validation is optional but recommended.
          </p>

          <div className="space-y-3">
            {/* Step 1: Epic Tech Context */}
            <div
              className={cn(
                "rounded-lg border transition-all",
                isContextDone ? "bg-status-complete/5 border-status-complete/30" : "bg-secondary/50 border-border",
              )}
            >
              <button
                onClick={() => !isContextDone && handleStepClick("context")}
                className={cn(
                  "w-full flex items-center justify-between p-4",
                  !isContextDone && "cursor-pointer hover:bg-secondary/70",
                )}
              >
                <div className="flex items-center gap-3">
                  {isContextDone ? (
                    <CheckCircle2 className="w-5 h-5 text-status-complete" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <FileCode2 className="w-4 h-4 text-primary" />
                      <span className="font-medium">Epic Tech Context</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">Required</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Generate technical context specific to this epic
                    </p>
                  </div>
                </div>
                {!isContextDone && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      onMarkContextDone()
                    }}
                    className="text-xs"
                  >
                    Mark Done
                  </Button>
                )}
              </button>

              {expandedStep === "context" && !isContextDone && (
                <div className="px-4 pb-4 border-t border-border mt-2 pt-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={runMode === "terminal" ? "default" : "outline"}
                        className="flex flex-col items-center gap-1.5 h-auto py-2"
                        onClick={() => setRunMode("terminal")}
                        size="sm"
                      >
                        <Terminal className="w-4 h-4" />
                        <span className="text-xs">Terminal</span>
                      </Button>
                      <Button
                        variant={runMode === "chat" ? "default" : "outline"}
                        className="flex flex-col items-center gap-1.5 h-auto py-2"
                        onClick={() => setRunMode("chat")}
                        size="sm"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs">Chat</span>
                      </Button>
                      <Button
                        variant={runMode === "copy" ? "default" : "outline"}
                        className="flex flex-col items-center gap-1.5 h-auto py-2"
                        onClick={() => setRunMode("copy")}
                        size="sm"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="text-xs">Copy</span>
                      </Button>
                    </div>

                    {runMode === "terminal" && (
                      <TerminalLaunchInline
                        config={contextConfig}
                        defaultTerminalAgent={defaultTerminalAgent}
                        onLaunch={(agentCmd, workflowCmd, termAgent, workflowName) => {
                          onTerminalLaunch(agentCmd, workflowCmd, termAgent, workflowName)
                          setExpandedStep(null)
                        }}
                        persistedCommand={persistedCommands?.[contextConfig.workflowName]}
                        onCommandEdit={onCommandEdit}
                      />
                    )}

                    {runMode === "chat" && (
                      <ChatLaunchInline
                        config={contextConfig}
                        onLaunch={(agentCmd, workflowCmd, workflowName) => {
                          onChatLaunch(agentCmd, workflowCmd, workflowName)
                          setExpandedStep(null)
                        }}
                        persistedCommand={persistedCommands?.[contextConfig.workflowName]}
                        onCommandEdit={onCommandEdit}
                      />
                    )}

                    {runMode === "copy" && (
                      <CopyCommandsInline
                        config={contextConfig}
                        persistedCommand={persistedCommands?.[contextConfig.workflowName]}
                        onCommandEdit={onCommandEdit}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Validate Epic Tech Context (Optional) */}
            <div
              className={cn(
                "rounded-lg border transition-all",
                isValidated
                  ? "bg-status-complete/5 border-status-complete/30"
                  : isContextDone
                    ? "bg-secondary/50 border-border"
                    : "bg-secondary/20 border-border/50 opacity-60",
              )}
            >
              <button
                onClick={() => isContextDone && !isValidated && handleStepClick("validate")}
                disabled={!isContextDone}
                className={cn(
                  "w-full flex items-center justify-between p-4",
                  isContextDone && !isValidated && "cursor-pointer hover:bg-secondary/70",
                )}
              >
                <div className="flex items-center gap-3">
                  {isValidated ? (
                    <CheckCircle2 className="w-5 h-5 text-status-complete" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <span className="font-medium">Validate Epic Tech Context</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">Optional</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Validate the generated technical context for accuracy
                    </p>
                  </div>
                </div>
                {isContextDone && !isValidated && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      onMarkValidated()
                    }}
                    className="text-xs"
                  >
                    Mark Done
                  </Button>
                )}
              </button>

              {expandedStep === "validate" && isContextDone && !isValidated && (
                <div className="px-4 pb-4 border-t border-border mt-2 pt-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={runMode === "terminal" ? "default" : "outline"}
                        className="flex flex-col items-center gap-1.5 h-auto py-2"
                        onClick={() => setRunMode("terminal")}
                        size="sm"
                      >
                        <Terminal className="w-4 h-4" />
                        <span className="text-xs">Terminal</span>
                      </Button>
                      <Button
                        variant={runMode === "chat" ? "default" : "outline"}
                        className="flex flex-col items-center gap-1.5 h-auto py-2"
                        onClick={() => setRunMode("chat")}
                        size="sm"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs">Chat</span>
                      </Button>
                      <Button
                        variant={runMode === "copy" ? "default" : "outline"}
                        className="flex flex-col items-center gap-1.5 h-auto py-2"
                        onClick={() => setRunMode("copy")}
                        size="sm"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="text-xs">Copy</span>
                      </Button>
                    </div>

                    {runMode === "terminal" && (
                      <TerminalLaunchInline
                        config={validateConfig}
                        defaultTerminalAgent={defaultTerminalAgent}
                        onLaunch={(agentCmd, workflowCmd, termAgent, workflowName) => {
                          onTerminalLaunch(agentCmd, workflowCmd, termAgent, workflowName)
                          setExpandedStep(null)
                        }}
                        persistedCommand={persistedCommands?.[validateConfig.workflowName]}
                        onCommandEdit={onCommandEdit}
                      />
                    )}

                    {runMode === "chat" && (
                      <ChatLaunchInline
                        config={validateConfig}
                        onLaunch={(agentCmd, workflowCmd, workflowName) => {
                          onChatLaunch(agentCmd, workflowCmd, workflowName)
                          setExpandedStep(null)
                        }}
                        persistedCommand={persistedCommands?.[validateConfig.workflowName]}
                        onCommandEdit={onCommandEdit}
                      />
                    )}

                    {runMode === "copy" && (
                      <CopyCommandsInline
                        config={validateConfig}
                        persistedCommand={persistedCommands?.[validateConfig.workflowName]}
                        onCommandEdit={onCommandEdit}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Proceed Button */}
          {canProceed && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="text-sm text-status-complete">
                  Epic context is ready. You can now start working on stories.
                </p>
                <ArrowRight className="w-5 h-5 text-status-complete" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
