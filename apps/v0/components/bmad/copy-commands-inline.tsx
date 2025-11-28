"use client"

import { useState, useEffect, useRef } from "react"
import { Copy, ChevronRight, Pencil, Info, Check, ExternalLink, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getAgentById, type Agent } from "@/lib/agents-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export interface CopyCommandsConfig {
  workflowName: string
  workflowTrigger: string
  agentId?: string
  slashCommand?: string
}

interface CopyCommandsInlineProps {
  config: CopyCommandsConfig
  persistedCommand?: string
  onCommandEdit?: (workflowId: string, command: string) => void
}

export function CopyCommandsInline({ config, persistedCommand, onCommandEdit }: CopyCommandsInlineProps) {
  const initialCommand = persistedCommand || config.workflowTrigger
  const [workflowCommand, setWorkflowCommand] = useState(initialCommand)
  const [isEditing, setIsEditing] = useState(false)
  const [copiedStep, setCopiedStep] = useState<1 | 2 | "both" | null>(null)
  const lastConfigRef = useRef(config.workflowTrigger)

  // Get the BMAD agent info
  const bmadAgent: Agent | undefined = config?.agentId ? getAgentById(config.agentId) : undefined
  const agentLaunchCommand = bmadAgent?.launchCommand || "bmad"

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

  // Check if command has been edited from original
  const isEdited = workflowCommand !== config.workflowTrigger

  const handleCopy = async (text: string, step: 1 | 2 | "both") => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStep(step)
      toast.success(step === "both" ? "Both commands copied!" : `Step ${step} copied!`)
      setTimeout(() => setCopiedStep(null), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const handleCopyBoth = () => {
    // Persist before copying
    if (onCommandEdit && workflowCommand !== (persistedCommand || config.workflowTrigger)) {
      onCommandEdit(config.workflowName, workflowCommand)
    }
    const combined = `${agentLaunchCommand}\n${workflowCommand}`
    handleCopy(combined, "both")
  }

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
        <Copy className="w-5 h-5 text-primary" />
        <div className="flex-1">
          <div className="text-sm font-medium">Copy Commands</div>
          <div className="text-xs text-muted-foreground">Copy to use in external AI agents</div>
        </div>
      </div>

      {/* Command Sequence */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Info className="w-4 h-4" />
          Commands to run:
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-auto"
                    onClick={() => handleCopy(agentLaunchCommand, 1)}
                  >
                    {copiedStep === 1 ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy command</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
                  <p>{isEditing ? "Close editor" : "Edit command"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {isEdited && (
              <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/50">
                Edited
              </Badge>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-auto"
                    onClick={() => handleCopy(workflowCommand, 2)}
                  >
                    {copiedStep === 2 ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy command</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
                Add extra details after the command, e.g., "{config.workflowTrigger} focusing on authentication flow"
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

      {/* Copy Both Button */}
      <Button onClick={handleCopyBoth} variant="outline" className="w-full gap-2 h-11 bg-transparent">
        {copiedStep === "both" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        Copy Both Commands
      </Button>

      {/* Usage Instructions */}
      <div className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          How to use in external agents
        </h4>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Claude Code / Codex CLI / Gemini CLI:</span>
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Open your preferred AI terminal agent</li>
            <li>
              Paste <span className="font-mono text-primary">{agentLaunchCommand}</span> to launch the BMAD agent
            </li>
            <li>Wait for the agent to initialize</li>
            <li>
              Paste the workflow command <span className="font-mono text-primary">{config.workflowTrigger}</span>
            </li>
          </ol>
        </div>

        {config.slashCommand && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">
              <span className="font-medium text-foreground">Alternative:</span> Use the slash command directly
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 rounded bg-black/40 font-mono text-xs text-green-400">
                {config.slashCommand}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleCopy(config.slashCommand!, 2)}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-border">
          <a
            href="https://bmad.dev/docs/cli"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Learn more about BMAD CLI
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
