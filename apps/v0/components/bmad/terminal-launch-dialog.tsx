"use client"

import { useState } from "react"
import { Terminal, Bot, Play, ChevronRight, Pencil, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TERMINAL_AGENTS, type TerminalAgent } from "./terminal-manager"
import { getAgentById, type Agent } from "@/lib/agents-data"
import { cn } from "@/lib/utils"

export interface TerminalLaunchConfig {
  workflowName: string
  workflowTrigger: string
  agentId?: string
  slashCommand?: string
}

interface TerminalLaunchDialogProps {
  open: boolean
  onClose: () => void
  config: TerminalLaunchConfig | null
  defaultTerminalAgent: TerminalAgent
  onLaunch: (
    agentLaunchCommand: string,
    workflowCommand: string,
    terminalAgent: TerminalAgent,
    workflowName: string,
  ) => void
}

export function TerminalLaunchDialog({
  open,
  onClose,
  config,
  defaultTerminalAgent,
  onLaunch,
}: TerminalLaunchDialogProps) {
  const [workflowCommand, setWorkflowCommand] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  // Get the BMAD agent info
  const bmadAgent: Agent | undefined = config?.agentId ? getAgentById(config.agentId) : undefined
  const agentLaunchCommand = bmadAgent?.launchCommand || "bmad"

  // Get terminal agent info
  const terminalAgentInfo = TERMINAL_AGENTS.find((a) => a.id === defaultTerminalAgent) || TERMINAL_AGENTS[0]

  // Reset state when dialog opens with new config
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && config) {
      setWorkflowCommand(config.workflowTrigger)
      setIsEditing(false)
    }
    if (!isOpen) {
      onClose()
    }
  }

  // Initialize workflow command when config changes
  if (config && workflowCommand !== config.workflowTrigger && !isEditing) {
    setWorkflowCommand(config.workflowTrigger)
  }

  const handleLaunch = () => {
    if (config) {
      onLaunch(agentLaunchCommand, workflowCommand, defaultTerminalAgent, config.workflowName)
      onClose()
    }
  }

  if (!config) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Run in Terminal
          </DialogTitle>
          <DialogDescription>
            Configure and launch <span className="font-medium text-foreground">{config.workflowName}</span> in terminal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Terminal Agent Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
            <Bot className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <div className="text-sm font-medium">Using {terminalAgentInfo.name}</div>
              <div className="text-xs text-muted-foreground">{terminalAgentInfo.description}</div>
            </div>
            <Badge variant="outline" className="text-xs">
              Default
            </Badge>
          </div>

          {/* Command Sequence */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Info className="w-4 h-4" />
              Commands to be executed:
            </div>

            {/* Step 1: Launch BMAD Agent */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                  1
                </div>
                <span className="text-sm font-medium">Launch BMAD Agent</span>
                {bmadAgent && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <span>{bmadAgent.emoji}</span>
                    {bmadAgent.name}
                  </Badge>
                )}
              </div>
              <div className="ml-8 p-3 rounded-lg bg-black/40 font-mono text-sm text-green-400 border border-border">
                <span className="text-muted-foreground">$</span> {agentLaunchCommand}
              </div>
            </div>

            {/* Arrow connector */}
            <div className="flex justify-center">
              <ChevronRight className="w-5 h-5 text-muted-foreground rotate-90" />
            </div>

            {/* Step 2: Run Workflow Command */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                  2
                </div>
                <span className="text-sm font-medium">Run Workflow</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditing(!isEditing)}>
                        <Pencil className={cn("w-3 h-3", isEditing && "text-primary")} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit command to add extra details</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {isEditing ? (
                <div className="ml-8">
                  <Textarea
                    value={workflowCommand}
                    onChange={(e) => setWorkflowCommand(e.target.value)}
                    className="font-mono text-sm bg-black/40 border-primary/50 text-green-400 min-h-[80px]"
                    placeholder="Enter workflow command..."
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    You can add extra details after the command, e.g., "{config.workflowTrigger} focusing on
                    authentication flow"
                  </p>
                </div>
              ) : (
                <div
                  className="ml-8 p-3 rounded-lg bg-black/40 font-mono text-sm text-green-400 border border-border cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  <span className="text-muted-foreground">{">"}</span> {workflowCommand}
                </div>
              )}
            </div>
          </div>

          {/* Info note */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            The terminal will open with <span className="font-medium">{terminalAgentInfo.name}</span>, automatically
            send the agent launch command, then send your workflow command. You can customize the workflow command to
            add specific focus areas or requirements.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleLaunch} className="gap-2">
            <Play className="w-4 h-4" />
            Run in Terminal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
