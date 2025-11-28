"use client"

import type React from "react"

import { useState } from "react"
import type { DiscoveryWorkflow, ResearchType } from "@/lib/bmad-data"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  Circle,
  Loader2,
  AlertTriangle,
  Lightbulb,
  Search,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Terminal,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface DiscoveryWorkflowCardProps {
  workflow: DiscoveryWorkflow
  onClick: () => void
  isHighlighted?: boolean
}

const workflowIcons = {
  "brainstorm-project": Lightbulb,
  research: Search,
  "product-brief": FileText,
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

const researchTypeLabels: Record<ResearchType, string> = {
  market: "Market Research",
  competitive: "Competitive Analysis",
  user: "User Research",
  technical: "Technical Research",
  domain: "Domain Research",
  "deep-prompt": "Deep Research Prompt",
}

export function DiscoveryWorkflowCard({ workflow, onClick, isHighlighted }: DiscoveryWorkflowCardProps) {
  const [expanded, setExpanded] = useState(false)

  const WorkflowIcon = workflowIcons[workflow.workflowId as keyof typeof workflowIcons] || FileText
  const StatusIcon = statusIcons[workflow.status]

  const handleCardClick = () => {
    onClick()
  }

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded(!expanded)
  }

  return (
    <div
      className={cn(
        "p-4 rounded-lg border-2 transition-all cursor-pointer",
        statusColors[workflow.status],
        isHighlighted && "ring-2 ring-primary animate-pulse",
        "hover:border-primary/50",
      )}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-secondary">
          <WorkflowIcon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{workflow.title}</h3>
            <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">optional</span>
            <StatusIcon
              className={cn(
                "w-4 h-4 ml-auto",
                workflow.status === "active" && "animate-spin text-status-active",
                workflow.status === "complete" && "text-status-complete",
                workflow.status === "pending" && "text-status-pending",
              )}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">{workflow.description}</p>

          {/* Research type badge */}
          {workflow.researchType && (
            <div className="mt-2">
              <span className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-400">
                {researchTypeLabels[workflow.researchType]}
              </span>
            </div>
          )}
        </div>
      </div>

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
            Show inputs & outputs
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

          {/* Output */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Output</p>
            <div className="flex items-center gap-2 text-xs p-2 rounded bg-secondary">
              <FileText className="w-3 h-3 text-muted-foreground" />
              <span className="font-mono text-muted-foreground">{workflow.outputPattern}</span>
            </div>
            {workflow.outputPath && (
              <div className="flex items-center gap-2 text-xs p-2 rounded bg-status-complete/10 mt-1">
                <CheckCircle2 className="w-3 h-3 text-status-complete" />
                <span className="font-mono flex-1 truncate">{workflow.outputPath}</span>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Command */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Command</p>
            <div className="flex items-center gap-2 text-xs p-2 rounded bg-secondary font-mono">
              <Terminal className="w-3 h-3 text-muted-foreground" />
              <span className="flex-1">{workflow.command}</span>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Anti-hallucination note for research */}
          {workflow.workflowId === "research" && (
            <div className="flex items-start gap-2 p-2 rounded bg-amber-500/10 text-xs">
              <Info className="w-3 h-3 text-amber-400 mt-0.5" />
              <span className="text-amber-300">
                Anti-hallucination: Requires citations with URLs, 2+ sources for critical claims, confidence marking.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
