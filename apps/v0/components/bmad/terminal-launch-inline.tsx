"use client"

import { useState, useEffect, useRef } from "react"
import { Bot, Play, ChevronRight, Pencil, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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

interface TerminalLaunchInlineProps {
  config: TerminalLaunchConfig
  defaultTerminalAgent: TerminalAgent
  onLaunch: (
    agentLaunchCommand: string,
    workflowCommand: string,
    terminalAgent: TerminalAgent,
    workflowName: string,
  ) => void
  persistedCommand?: string
  onCommandEdit?: (workflowId: string, command: string) => void
}

export function TerminalLaunchInline({
  config,
  defaultTerminalAgent,
  onLaunch,
  persistedCommand,
  onCommandEdit,
}: TerminalLaunchInlineProps) {
  const initialCommand = persistedCommand || config.workflowTrigger
  const [workflowCommand, setWorkflowCommand] = useState(initialCommand)
  const [isEditing, setIsEditing] = useState(false)
  const lastConfigRef = useRef(config.workflowTrigger)

  // Get the BMAD agent info
  const bmadAgent: Agent | undefined = config?.agentId ? getAgentById(config.agentId) : undefined
  const agentLaunchCommand = bmadAgent?.launchCommand || "bmad"

  // Get terminal agent info
  const terminalAgentInfo = TERMINAL_AGENTS.find((a) => a.id === defaultTerminalAgent) || TERMINAL_AGENTS[0]

  useEffect(() => {
    if (config.workflowTrigger !== lastConfigRef.current) {
      lastConfigRef.current = config.workflowTrigger
      setWorkflowCommand(persistedCommand || config.workflowTrigger)
      setIsEditing(false)
    }
  }, [config.workflowTrigger, persistedCommand])

  const handleCommandChange = (newCommand: string) => {
    setWorkflowCommand(newCommand)
  }

  const handleBlur = () => {
    if (onCommandEdit && workflowCommand !== (persistedCommand || config.workflowTrigger)) {
      onCommandEdit(config.workflowName, workflowCommand)
    }
  }

  const handleCloseEditing = () => {
    setIsEditing(false)
    if (onCommandEdit && workflowCommand !== (persistedCommand || config.workflowTrigger)) {
      onCommandEdit(config.workflowName, workflowCommand)
    }
  }

  const handleLaunch = () => {
    if (onCommandEdit && workflowCommand !== (persistedCommand || config.workflowTrigger)) {
      onCommandEdit(config.workflowName, workflowCommand)
    }
    onLaunch(agentLaunchCommand, workflowCommand, defaultTerminalAgent, config.workflowName)
  }

  const isEdited = workflowCommand !== config.workflowTrigger

  return (
    <div className="space-y-4">
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => (isEditing ? handleCloseEditing() : setIsEditing(true))}
                  >
                    <Pencil className={cn("w-3 h-3", isEditing && "text-primary")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isEditing ? "Close editor" : "Edit command to add extra details"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {isEdited && (
              <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/50">
                Edited
              </Badge>
            )}
          </div>

          {isEditing ? (
            <div className="ml-8">
              <Textarea
                value={workflowCommand}
                onChange={(e) => handleCommandChange(e.target.value)}
                onBlur={handleBlur}
                className="font-mono text-sm bg-black/40 border-primary/50 text-green-400 min-h-[80px]"
                placeholder="Enter workflow command..."
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-2">
                You can add extra details after the command, e.g., "{config.workflowTrigger} focusing on authentication
                flow"
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
        The terminal will open with <span className="font-medium">{terminalAgentInfo.name}</span>, automatically send
        the agent launch command, then send your workflow command.
      </div>

      {/* Launch button */}
      <Button onClick={handleLaunch} className="w-full gap-2 h-11">
        <Play className="w-4 h-4" />
        Run in Terminal
      </Button>
    </div>
  )
}
