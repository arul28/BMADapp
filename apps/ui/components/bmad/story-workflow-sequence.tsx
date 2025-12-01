"use client"

import { cn } from "@/lib/utils"
import { type Story, type WorkflowStep, getStoryWorkflowSteps, getStepStatusColor, AGENTS } from "@/lib/bmad-data"
import { CheckCircle2, Circle, Loader2, AlertTriangle, SkipForward, ChevronRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface StoryWorkflowSequenceProps {
  story: Story
  onStepClick: (step: WorkflowStep) => void
  variant?: "full" | "compact" | "inline"
}

const statusIcons = {
  done: CheckCircle2,
  "in-progress": Loader2,
  review: AlertTriangle,
  skipped: SkipForward,
  "not-started": Circle,
}

export function StoryWorkflowSequence({ story, onStepClick, variant = "full" }: StoryWorkflowSequenceProps) {
  const steps = getStoryWorkflowSteps(story)
  const currentStepIndex = steps.findIndex((s) => s.status === "in-progress")

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-1 overflow-x-auto py-2">
        {steps.map((step, index) => {
          const Icon = statusIcons[step.status]
          const isCurrent = step.status === "in-progress"

          return (
            <TooltipProvider key={step.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onStepClick(step)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded text-xs transition-all",
                      isCurrent && "bg-primary/20 ring-1 ring-primary",
                      step.status === "done" && "text-status-complete",
                      step.status === "skipped" && "text-muted-foreground opacity-50",
                      step.status === "not-started" && "text-muted-foreground",
                      step.isOptional && "border border-dashed border-muted-foreground/30",
                    )}
                  >
                    <Icon className={cn("w-3 h-3", step.status === "in-progress" && "animate-spin")} />
                    <span className="font-mono hidden sm:inline">{step.name}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{step.displayName}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                  {step.isOptional && <p className="text-xs text-amber-400 mt-1">Optional step</p>}
                </TooltipContent>
              </Tooltip>
              {index < steps.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />}
            </TooltipProvider>
          )
        })}
      </div>
    )
  }

  if (variant === "compact") {
    const completedCount = steps.filter((s) => s.status === "done" || s.status === "skipped").length
    const currentStep = steps.find((s) => s.status === "in-progress")

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {completedCount}/{steps.length} steps
          </span>
          {currentStep && <span className="text-primary font-mono">{currentStep.name}</span>}
        </div>
        <div className="flex gap-0.5">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => onStepClick(step)}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-all hover:scale-y-150",
                step.status === "done" && "bg-status-complete",
                step.status === "in-progress" && "bg-primary animate-pulse",
                step.status === "review" && "bg-amber-500",
                step.status === "skipped" && "bg-muted-foreground/30",
                step.status === "not-started" && "bg-secondary",
              )}
            />
          ))}
        </div>
      </div>
    )
  }

  // Full variant
  return (
    <div className="space-y-1">
      {steps.map((step, index) => {
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
  )
}
