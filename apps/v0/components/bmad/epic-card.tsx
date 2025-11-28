"use client"

import type { Epic } from "@/lib/bmad-data"
import { cn } from "@/lib/utils"
import { ChevronRight, CheckCircle2, Loader2, AlertTriangle, FileCode2 } from "lucide-react"

interface EpicCardProps {
  epic: Epic
  onClick: () => void
}

const statusColors = {
  backlog: "bg-status-pending/20 text-status-pending",
  contexted: "bg-status-complete/20 text-status-complete",
}

export function EpicCard({ epic, onClick }: EpicCardProps) {
  const completedStories = epic.stories.filter((s) => s.status === "done").length
  const inProgressStories = epic.stories.filter((s) => s.status === "in-progress" || s.status === "review").length
  const totalStories = epic.stories.length
  const progress = totalStories > 0 ? Math.round((completedStories / totalStories) * 100) : 0

  const techContextStatus = epic.techContextStatus || "not-started"
  const needsContextSetup = epic.status === "backlog" && techContextStatus === "not-started"

  const getEpicVisualStatus = () => {
    const allStoriesDone = completedStories === totalStories && totalStories > 0
    const retroDone = epic.retroStatus === "completed"

    if (allStoriesDone && retroDone) return "complete"
    if (allStoriesDone && !retroDone) return "active"
    if (inProgressStories > 0) return "active"
    if (epic.status === "contexted") return "ready"
    if (needsContextSetup) return "pending-setup"
    return "pending"
  }

  const visualStatus = getEpicVisualStatus()
  const allStoriesDone = completedStories === totalStories && totalStories > 0
  const needsRetro = allStoriesDone && epic.retroStatus !== "completed"

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-5 bg-card rounded-lg border transition-all text-left group",
        visualStatus === "complete" && "border-status-complete/50 hover:border-status-complete",
        visualStatus === "active" && "border-status-active/50 hover:border-status-active",
        visualStatus === "ready" && "border-primary/30 hover:border-primary/50",
        visualStatus === "pending" && "border-border hover:border-primary/50",
        visualStatus === "pending-setup" && "border-amber-500/30 hover:border-amber-500/50",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", statusColors[epic.status])}>
              {epic.status}
            </span>
            {needsContextSetup && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium flex items-center gap-1">
                <FileCode2 className="w-3 h-3" />
                Setup Required
              </span>
            )}
            {techContextStatus === "context-done" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">
                Context Done
              </span>
            )}
            {techContextStatus === "validated" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-status-complete/20 text-status-complete font-medium">
                Context Validated
              </span>
            )}
            {epic.retroStatus === "completed" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">
                Retro Done
              </span>
            )}
            {needsRetro && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                Retro Needed
              </span>
            )}
            {epic.priority && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{epic.priority}</span>
            )}
          </div>
          <h3 className="font-semibold text-base truncate">{epic.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{epic.description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
      </div>

      {totalStories > 0 && (
        <div className="mt-4 flex items-center gap-3 text-xs">
          {completedStories > 0 && (
            <span className="flex items-center gap-1 text-status-complete">
              <CheckCircle2 className="w-3 h-3" />
              {completedStories} done
            </span>
          )}
          {inProgressStories > 0 && (
            <span className="flex items-center gap-1 text-status-active">
              <Loader2 className="w-3 h-3 animate-spin" />
              {inProgressStories} active
            </span>
          )}
          {epic.stories.filter((s) => s.status === "review").length > 0 && (
            <span className="flex items-center gap-1 text-amber-400">
              <AlertTriangle className="w-3 h-3" />
              {epic.stories.filter((s) => s.status === "review").length} review
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>
            {completedStories} of {totalStories} stories
          </span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              visualStatus === "complete" ? "bg-status-complete" : "bg-primary",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </button>
  )
}
