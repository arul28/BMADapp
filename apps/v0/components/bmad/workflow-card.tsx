"use client"

import { forwardRef } from "react"
import { type WorkflowCard, AGENTS } from "@/lib/bmad-data"
import { cn } from "@/lib/utils"
import { Clock, FileText, CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react"

interface WorkflowCardProps {
  workflow: WorkflowCard
  onClick: () => void
  isHighlighted?: boolean
  "data-workflow-id"?: string
}

const statusIcons = {
  pending: Circle,
  active: Loader2,
  complete: CheckCircle2,
  blocked: AlertCircle,
}

const statusColors = {
  pending: "text-status-pending",
  active: "text-status-active",
  complete: "text-status-complete",
  blocked: "text-status-blocked",
}

export const WorkflowCardComponent = forwardRef<HTMLButtonElement, WorkflowCardProps>(function WorkflowCardComponent(
  { workflow, onClick, isHighlighted, "data-workflow-id": dataWorkflowId },
  ref,
) {
  const StatusIcon = statusIcons[workflow.status]
  const agent = AGENTS[workflow.agent]

  return (
    <button
      ref={ref}
      onClick={onClick}
      data-workflow-id={dataWorkflowId}
      className={cn(
        "w-full p-4 bg-card rounded-lg border transition-all text-left",
        isHighlighted ? "border-primary ring-2 ring-primary/30 animate-pulse" : "border-border hover:border-primary/50",
      )}
    >
      {/* Status & Title */}
      <div className="flex items-start gap-3">
        <StatusIcon
          className={cn(
            "w-4 h-4 mt-0.5 flex-shrink-0",
            statusColors[workflow.status],
            workflow.status === "active" && "animate-spin",
          )}
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{workflow.title}</h4>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{workflow.description}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-secondary flex items-center justify-center text-[10px] font-medium">
            {agent.label[0]}
          </span>
          {agent.label}
        </span>
        {workflow.estimatedTime && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {workflow.estimatedTime}
          </span>
        )}
        {workflow.outputs && workflow.outputs.length > 0 && (
          <span className="flex items-center gap-1 ml-auto">
            <FileText className="w-3 h-3" />
            {workflow.outputs.length}
          </span>
        )}
      </div>
    </button>
  )
})
