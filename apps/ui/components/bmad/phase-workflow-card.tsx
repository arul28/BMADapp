"use client"

import type React from "react"
import { useState } from "react"
import type { PhaseWorkflow, SprintPlanningWorkflow } from "@/lib/bmad-data"
import { AGENTS } from "@/lib/bmad-data"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  Circle,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  Terminal,
  Copy,
  MessageSquare,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface PhaseWorkflowCardProps {
  workflow: PhaseWorkflow | SprintPlanningWorkflow
  onClick: () => void
  isHighlighted?: boolean
  isLocked?: boolean
  lockMessage?: string
}

const statusColors = {
  pending: "border-status-pending bg-status-pending/5",
  active: "border-status-active bg-status-active/10 ring-1 ring-status-active/30",
  complete: "border-status-complete bg-status-complete/5",
  blocked: "border-status-blocked bg-status-blocked/5",
  review: "border-amber-500 bg-amber-500/5",
}

const statusIcons = {
  pending: Circle,
  active: Loader2,
  complete: CheckCircle2,
  blocked: AlertTriangle,
  review: AlertTriangle,
}

export function PhaseWorkflowCard({ workflow, onClick, isHighlighted, isLocked, lockMessage }: PhaseWorkflowCardProps) {
  const [expanded, setExpanded] = useState(false)

  const StatusIcon = statusIcons[workflow.status]
  const agent = AGENTS[workflow.agent]

  const handleCardClick = () => {
    if (!isLocked) {
      onClick()
    }
  }

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded(!expanded)
  }

  const handleCopyCommand = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(workflow.command)
    toast.success("Command copied to clipboard")
  }

  return (
    <div
      className={cn(
        "p-4 rounded-lg border-2 transition-all",
        isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-primary/50",
        statusColors[workflow.status],
        isHighlighted && "ring-2 ring-primary animate-pulse",
      )}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <StatusIcon
          className={cn(
            "w-5 h-5 mt-0.5 flex-shrink-0",
            workflow.status === "active" && "animate-spin text-status-active",
            workflow.status === "complete" && "text-status-complete",
            workflow.status === "pending" && "text-status-pending",
            workflow.status === "review" && "text-amber-400",
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{workflow.title}</h3>
            {isLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
            <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
              {agent.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{workflow.description}</p>

          {isLocked && lockMessage && <p className="text-xs text-amber-400 mt-2">{lockMessage}</p>}
        </div>
      </div>

      {/* Output path if exists */}
      {workflow.outputPath && (
        <div className="flex items-center gap-2 mt-3 text-xs">
          <CheckCircle2 className="w-3 h-3 text-status-complete" />
          <span className="font-mono text-status-complete truncate">{workflow.outputPath}</span>
        </div>
      )}

      {/* Expand toggle */}
      <button
        onClick={handleExpandClick}
        className="w-full mt-3 pt-2 border-t border-border flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? (
          <>
            <ChevronUp className="w-3 h-3" />
            Hide details
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3" />
            Show inputs & run options
          </>
        )}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
          {/* Inputs */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Inputs</p>
            <div className="space-y-1">
              {workflow.inputs.map((input, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2 text-xs p-2 rounded",
                    input.exists ? "bg-status-complete/10" : "bg-secondary",
                  )}
                >
                  {input.exists ? (
                    <CheckCircle2 className="w-3 h-3 text-status-complete" />
                  ) : (
                    <Circle className="w-3 h-3 text-muted-foreground" />
                  )}
                  <span className={cn(!input.required && "text-muted-foreground")}>
                    {input.label}
                    {!input.required && " (optional)"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Output pattern */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Output</p>
            <div className="flex items-center gap-2 text-xs p-2 rounded bg-secondary">
              <FileText className="w-3 h-3 text-muted-foreground" />
              <span className="font-mono text-muted-foreground">{workflow.outputPattern}</span>
            </div>
          </div>

          {/* Run options */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Run via</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent text-xs" disabled={isLocked}>
                <Terminal className="w-3 h-3 mr-1" />
                Terminal
              </Button>
              <Button variant="outline" size="sm" className="flex-1 bg-transparent text-xs" disabled={isLocked}>
                <MessageSquare className="w-3 h-3 mr-1" />
                Chat
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent text-xs" onClick={handleCopyCommand}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
