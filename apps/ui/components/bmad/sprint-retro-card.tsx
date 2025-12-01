"use client"

import { cn } from "@/lib/utils"
import { RefreshCw, CheckCircle2, Circle } from "lucide-react"

export function SprintRetroCard() {
  // Mock data - in a real app this would come from sprint status
  const retroStatus = "optional" // "optional" | "in-progress" | "completed"

  const getStatusInfo = () => {
    switch (retroStatus) {
      case "completed":
        return {
          label: "Completed",
          color: "bg-status-complete/20 text-status-complete",
          borderColor: "border-status-complete/50",
          icon: CheckCircle2,
        }
      case "in-progress":
        return {
          label: "In Progress",
          color: "bg-status-active/20 text-status-active",
          borderColor: "border-status-active/50",
          icon: RefreshCw,
        }
      default:
        return {
          label: "Optional",
          color: "bg-secondary text-muted-foreground",
          borderColor: "border-border",
          icon: Circle,
        }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <div className={cn("p-4 bg-card rounded-lg border transition-all", statusInfo.borderColor)}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <RefreshCw className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm">Sprint Retrospective</h4>
            <span className={cn("text-xs px-2 py-0.5 rounded-full", statusInfo.color)}>{statusInfo.label}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Review sprint outcomes, capture learnings, and identify improvements for the next cycle.
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono bg-secondary px-1.5 py-0.5 rounded">*sprint-retrospective</span>
          </div>
        </div>
      </div>
    </div>
  )
}
