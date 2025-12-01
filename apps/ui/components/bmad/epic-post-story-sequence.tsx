"use client"

import { cn } from "@/lib/utils"
import { type Epic, type WorkflowStep, getEpicPostStorySteps, getStepStatusColor, AGENTS } from "@/lib/bmad-data"
import { CheckCircle2, Circle, Loader2, AlertTriangle, SkipForward, ChevronRight, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface EpicPostStorySequenceProps {
  epic: Epic
  onStepClick: (step: WorkflowStep) => void
}

const statusIcons = {
  done: CheckCircle2,
  "in-progress": Loader2,
  review: AlertTriangle,
  skipped: SkipForward,
  "not-started": Circle,
}

export function EpicPostStorySequence({ epic, onStepClick }: EpicPostStorySequenceProps) {
  const steps = getEpicPostStorySteps(epic)
  const allStoriesDone = epic.stories.every((s) => s.status === "done")
  const storiesRemaining = epic.stories.filter((s) => s.status !== "done").length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          Post-Story Workflow
          {!allStoriesDone && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
        </h4>
        {!allStoriesDone && (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {storiesRemaining} {storiesRemaining === 1 ? "story" : "stories"} remaining
          </Badge>
        )}
      </div>

      {!allStoriesDone ? (
        <div className="p-4 border border-dashed border-muted-foreground/30 rounded-lg text-center">
          <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Complete all stories to unlock epic wrap-up steps</p>
          <p className="text-xs text-muted-foreground mt-1">
            {epic.stories.filter((s) => s.status === "done").length} of {epic.stories.length} stories complete
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {steps.map((step) => {
            const Icon = statusIcons[step.status]
            const agent = AGENTS[step.agent]
            const isCurrent = step.status === "in-progress"

            return (
              <button
                key={step.id}
                onClick={() => onStepClick(step)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                  "hover:bg-card border border-transparent",
                  isCurrent && "bg-primary/10 border-primary/30",
                  step.status === "done" && "opacity-75",
                  step.status === "skipped" && "opacity-50",
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                    getStepStatusColor(step.status),
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", step.status === "in-progress" && "animate-spin")} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-primary">{step.name}</span>
                    {step.isOptional && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">optional</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">{agent.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
