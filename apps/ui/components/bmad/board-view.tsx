"use client"

import { useState, useEffect, useRef } from "react"
import {
  type Phase,
  PHASES,
  VERSIC_EPICS,
  DISCOVERY_WORKFLOWS,
  PLANNING_WORKFLOWS,
  SOLUTIONING_WORKFLOWS,
  SPRINT_PLANNING_WORKFLOW,
  type WorkflowCard,
  type Story,
  type Epic,
  type WorkflowStep,
  type DiscoveryWorkflow,
  type PhaseWorkflow,
  getStatusColor,
  getStatusLabel,
} from "@/lib/bmad-data"
import { Breadcrumb } from "./breadcrumb"
import { DiscoveryWorkflowCard } from "./discovery-workflow-card"
import { PhaseWorkflowCard } from "./phase-workflow-card"
import { EpicCard } from "./epic-card"
import { StoryWorkflowSequence } from "./story-workflow-sequence"
import { EpicPostStorySequence } from "./epic-post-story-sequence"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  Circle,
  Loader2,
  AlertTriangle,
  Clock,
  Lock,
  Target,
  ChevronDown,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SprintRetroCard } from "./sprint-retro-card"
import { EpicContextSetup } from "./epic-context-setup"
import type { TerminalAgent } from "./terminal-manager"

interface BoardViewProps {
  activePhase: Phase | "all"
  onSelectWorkflow: (workflow: WorkflowCard) => void
  onSelectDiscoveryWorkflow: (workflow: DiscoveryWorkflow) => void
  onSelectPhaseWorkflow: (workflow: PhaseWorkflow) => void
  onSelectStory: (story: Story, epic: Epic) => void
  highlightedWorkflowId?: string | null
  highlightedStoryId?: string | null
  activeStoryId?: string | null
  onSelectStep?: (step: WorkflowStep, epicId: string, storyId?: string) => void
  onSwitchToImplementation?: () => void
  onRunInTerminal?: (command: string, name: string) => void
  onTerminalLaunch?: (
    agentLaunchCommand: string,
    workflowCommand: string,
    terminalAgent: TerminalAgent,
    workflowName: string,
  ) => void
  onChatLaunch?: (agentLaunchCommand: string, workflowCommand: string, workflowName: string) => void
  defaultTerminalAgent?: TerminalAgent
  persistedCommands?: Record<string, string>
  onCommandEdit?: (workflowId: string, command: string) => void
}

type DrilldownLevel = "workflows" | "epics" | "stories"

const statusIcons = {
  done: CheckCircle2,
  "in-progress": Loader2,
  "ready-for-dev": Clock,
  review: AlertTriangle,
  drafted: Circle,
  backlog: Circle,
}

function StatusLegend() {
  return (
    <div className="flex items-center gap-6 text-sm">
      <span className="text-muted-foreground font-medium">Status:</span>
      <div className="flex items-center gap-2">
        <Circle className="w-3 h-3 text-status-pending" />
        <span className="text-muted-foreground">Pending</span>
      </div>
      <div className="flex items-center gap-2">
        <Loader2 className="w-3 h-3 text-status-active animate-spin" />
        <span className="text-muted-foreground">Active</span>
      </div>
      <div className="flex items-center gap-2">
        <AlertCircle className="w-3 h-3 text-amber-400" />
        <span className="text-muted-foreground">Review</span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-3 h-3 text-status-complete" />
        <span className="text-muted-foreground">Complete</span>
      </div>
    </div>
  )
}

export function BoardView({
  activePhase,
  onSelectWorkflow,
  onSelectDiscoveryWorkflow,
  onSelectPhaseWorkflow,
  onSelectStory,
  highlightedWorkflowId,
  highlightedStoryId,
  activeStoryId,
  onSelectStep,
  onSwitchToImplementation,
  onRunInTerminal,
  onTerminalLaunch,
  onChatLaunch,
  defaultTerminalAgent = "claude-code",
  persistedCommands,
  onCommandEdit,
}: BoardViewProps) {
  const [drilldownLevel, setDrilldownLevel] = useState<DrilldownLevel>("workflows")
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null)
  const [implViewMode, setImplViewMode] = useState<"epics" | "stories">("epics")
  const [epicContextOverrides, setEpicContextOverrides] = useState<Record<string, "context-done" | "validated">>({})
  const containerRef = useRef<HTMLDivElement>(null)

  const isSprintPlanningDone =
    SPRINT_PLANNING_WORKFLOW.status === "complete" || SPRINT_PLANNING_WORKFLOW.status === "active"

  useEffect(() => {
    if (highlightedWorkflowId && containerRef.current) {
      const card = containerRef.current.querySelector(`[data-workflow-id="${highlightedWorkflowId}"]`)
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
      }
    }
  }, [highlightedWorkflowId])

  useEffect(() => {
    if (highlightedStoryId && containerRef.current) {
      const card = containerRef.current.querySelector(`[data-story-id="${highlightedStoryId}"]`)
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
      }
    }
  }, [highlightedStoryId])

  const isDiscoveryView = activePhase === "discovery"
  const isPlanningView = activePhase === "planning"
  const isSolutioningView = activePhase === "solutioning"
  const isImplementationView = activePhase === "implementation"

  const activeStory = VERSIC_EPICS.flatMap((e) => e.stories).find((s) => s.status === "in-progress")
  const activeStoryEpic = activeStory ? VERSIC_EPICS.find((e) => e.id === activeStory.epicId) : null

  const handleEpicClick = (epic: Epic) => {
    setSelectedEpic(epic)
    setDrilldownLevel("stories")
    if (activePhase === "all" && onSwitchToImplementation) {
      onSwitchToImplementation()
    }
  }

  const handleBackToEpics = () => {
    setSelectedEpic(null)
    setDrilldownLevel("epics")
  }

  const handleBackToAll = () => {
    setDrilldownLevel("workflows")
    setSelectedEpic(null)
  }

  const getEpicStats = (epic: Epic) => {
    const total = epic.stories.length
    const done = epic.stories.filter((s) => s.status === "done").length
    const inProgress = epic.stories.filter((s) => s.status === "in-progress" || s.status === "review").length
    return { total, done, inProgress, progress: total > 0 ? Math.round((done / total) * 100) : 0 }
  }

  const handleStepClick = (step: WorkflowStep, epicId: string, storyId?: string) => {
    if (onSelectStep) {
      onSelectStep(step, epicId, storyId)
    }
  }

  const getStoryNodeStatus = (story: Story) => {
    switch (story.status) {
      case "done":
        return "complete"
      case "in-progress":
        return "active"
      case "review":
        return "review"
      default:
        return "pending"
    }
  }

  const getEffectiveTechContextStatus = (epic: Epic) => {
    return epicContextOverrides[epic.id] || epic.techContextStatus || "not-started"
  }

  const handleMarkContextDone = (epicId: string) => {
    setEpicContextOverrides((prev) => ({ ...prev, [epicId]: "context-done" }))
  }

  const handleMarkValidated = (epicId: string) => {
    setEpicContextOverrides((prev) => ({ ...prev, [epicId]: "validated" }))
  }

  if (isDiscoveryView) {
    return (
      <div ref={containerRef} className="h-full p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <StatusLegend />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-phase-discovery" />
            <h2 className="text-xl font-semibold">Discovery</h2>
            <span className="text-sm text-muted-foreground">Optional workflows to explore and define your project</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DISCOVERY_WORKFLOWS.map((workflow) => (
              <DiscoveryWorkflowCard
                key={workflow.id}
                workflow={workflow}
                onClick={() => onSelectDiscoveryWorkflow(workflow)}
                isHighlighted={workflow.id === highlightedWorkflowId}
              />
            ))}
          </div>
          <div className="mt-8 p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground mb-2">Discovery Outputs</p>
            <div className="flex flex-wrap gap-2">
              {DISCOVERY_WORKFLOWS.filter((w) => w.outputPath).map((w) => (
                <span key={w.id} className="text-xs px-2 py-1 rounded bg-status-complete/20 text-status-complete">
                  {w.outputPath?.split("/").pop()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isPlanningView) {
    return (
      <div ref={containerRef} className="h-full p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <StatusLegend />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-phase-planning" />
            <h2 className="text-xl font-semibold">Planning</h2>
            <span className="text-sm text-muted-foreground">
              Define requirements, validate PRD, and create design specs
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANNING_WORKFLOWS.map((workflow) => (
              <PhaseWorkflowCard
                key={workflow.id}
                workflow={workflow}
                onClick={() => onSelectPhaseWorkflow(workflow)}
                isHighlighted={workflow.id === highlightedWorkflowId}
              />
            ))}
          </div>
          <div className="mt-8 p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground mb-2">Planning Outputs</p>
            <div className="flex flex-wrap gap-2">
              {PLANNING_WORKFLOWS.filter((w) => w.outputPath).map((w) => (
                <span key={w.id} className="text-xs px-2 py-1 rounded bg-status-complete/20 text-status-complete">
                  {w.outputPath?.split("/").pop()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isSolutioningView) {
    return (
      <div ref={containerRef} className="h-full p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <StatusLegend />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-phase-solutioning" />
            <h2 className="text-xl font-semibold">Solutioning</h2>
            <span className="text-sm text-muted-foreground">
              Architecture, epics, test design, and implementation readiness
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SOLUTIONING_WORKFLOWS.map((workflow) => (
              <PhaseWorkflowCard
                key={workflow.id}
                workflow={workflow}
                onClick={() => onSelectPhaseWorkflow(workflow)}
                isHighlighted={workflow.id === highlightedWorkflowId}
              />
            ))}
          </div>
          <div className="mt-8 p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground mb-2">Solutioning Outputs</p>
            <div className="flex flex-wrap gap-2">
              {SOLUTIONING_WORKFLOWS.filter((w) => w.outputPath).map((w) => (
                <span key={w.id} className="text-xs px-2 py-1 rounded bg-status-complete/20 text-status-complete">
                  {w.outputPath?.split("/").pop()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isImplementationView) {
    const allStoriesDoneInActiveEpic = activeStoryEpic
      ? activeStoryEpic.stories.every((s) => s.status === "done")
      : false

    const breadcrumbItems = [{ label: "Implementation", onClick: handleBackToAll }]
    if (drilldownLevel === "stories" && selectedEpic) {
      breadcrumbItems.push({ label: "All Epics", onClick: handleBackToEpics }, { label: selectedEpic.title })
    } else {
      breadcrumbItems.push({ label: "All Epics" })
    }

    if (drilldownLevel === "stories" && selectedEpic) {
      const effectiveStatus = getEffectiveTechContextStatus(selectedEpic)
      const needsContextSetup = selectedEpic.status === "backlog" && effectiveStatus === "not-started"
      const showContextSetup = selectedEpic.status === "backlog" && effectiveStatus !== "validated"

      return (
        <div ref={containerRef} className="h-full p-6 overflow-auto">
          <div className="mb-4">
            <StatusLegend />
          </div>
          <Breadcrumb items={breadcrumbItems} onBack={handleBackToEpics} />
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">{selectedEpic.title}</h2>
                <p className="text-muted-foreground text-sm">{selectedEpic.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded capitalize",
                      selectedEpic.status === "contexted"
                        ? "bg-status-complete/20 text-status-complete"
                        : "bg-status-pending/20 text-status-pending",
                    )}
                  >
                    {selectedEpic.status}
                  </span>
                  {effectiveStatus !== "not-started" && (
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded",
                        effectiveStatus === "validated"
                          ? "bg-status-complete/20 text-status-complete"
                          : "bg-blue-500/20 text-blue-400",
                      )}
                    >
                      {effectiveStatus === "validated" ? "Context Validated" : "Context Done"}
                    </span>
                  )}
                  {selectedEpic.retroStatus === "completed" && (
                    <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">Retro Done</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">
                    {getEpicStats(selectedEpic).done}/{getEpicStats(selectedEpic).total} stories
                  </div>
                  <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${getEpicStats(selectedEpic).progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {showContextSetup && (
              <EpicContextSetup
                epic={{ ...selectedEpic, techContextStatus: effectiveStatus }}
                onTerminalLaunch={(agentCmd, workflowCmd, termAgent, workflowName) => {
                  onTerminalLaunch?.(agentCmd, workflowCmd, termAgent, workflowName)
                }}
                onChatLaunch={(agentCmd, workflowCmd, workflowName) => {
                  onChatLaunch?.(agentCmd, workflowCmd, workflowName)
                }}
                onMarkContextDone={() => handleMarkContextDone(selectedEpic.id)}
                onMarkValidated={() => handleMarkValidated(selectedEpic.id)}
                defaultTerminalAgent={defaultTerminalAgent}
                persistedCommands={persistedCommands}
                onCommandEdit={onCommandEdit}
              />
            )}

            <div className="mb-6 p-4 bg-card/50 rounded-lg border border-border">
              <EpicPostStorySequence
                epic={selectedEpic}
                onStepClick={(step) => handleStepClick(step, selectedEpic.id)}
              />
            </div>

            {needsContextSetup ? (
              <div className="p-6 bg-secondary/30 rounded-lg border border-dashed border-border text-center">
                <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Complete the Epic Tech Context setup above to unlock stories for this epic.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {[
                  { key: "backlog", label: "Backlog", statuses: ["backlog", "drafted"] },
                  { key: "ready", label: "Ready for Dev", statuses: ["ready-for-dev"] },
                  { key: "active", label: "In Progress", statuses: ["in-progress"] },
                  { key: "done", label: "Done", statuses: ["review", "done"] },
                ].map((column) => (
                  <div key={column.key} className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      {column.label}
                      <span className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                        {selectedEpic.stories.filter((s) => column.statuses.includes(s.status)).length}
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {selectedEpic.stories
                        .filter((s) => column.statuses.includes(s.status))
                        .map((story) => {
                          const StatusIcon = statusIcons[story.status] || Circle
                          const isHighlighted = story.id === highlightedStoryId
                          return (
                            <button
                              key={story.id}
                              data-story-id={story.id}
                              onClick={() => onSelectStory(story, selectedEpic)}
                              className={cn(
                                "w-full p-4 bg-card rounded-lg border transition-all text-left",
                                isHighlighted
                                  ? "border-primary ring-2 ring-primary/30 animate-pulse"
                                  : "border-border hover:border-primary/50",
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 flex-1">
                                  <StatusIcon
                                    className={cn(
                                      "w-4 h-4 mt-0.5 flex-shrink-0",
                                      story.status === "done" && "text-status-complete",
                                      story.status === "in-progress" && "text-status-active animate-spin",
                                      story.status === "review" && "text-amber-400",
                                      (story.status === "backlog" || story.status === "drafted") &&
                                        "text-status-pending",
                                    )}
                                  />
                                  <h4 className="font-medium text-sm">{story.title}</h4>
                                </div>
                                <span
                                  className={cn(
                                    "text-xs px-1.5 py-0.5 rounded capitalize flex-shrink-0",
                                    getStatusColor(story.status),
                                  )}
                                >
                                  {getStatusLabel(story.status)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 ml-6">
                                {story.description}
                              </p>
                              {story.status === "in-progress" && (
                                <div className="mt-3 ml-6">
                                  <StoryWorkflowSequence
                                    story={story}
                                    onStepClick={(step) => handleStepClick(step, selectedEpic.id, story.id)}
                                    variant="compact"
                                  />
                                </div>
                              )}
                            </button>
                          )
                        })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div ref={containerRef} className="h-full p-6 overflow-auto">
        <div className="mb-4">
          <StatusLegend />
        </div>
        <Breadcrumb items={breadcrumbItems} onBack={undefined} />
        <div className="space-y-4">
          <div className="p-5 bg-card rounded-lg border-2 border-primary/30 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span
                className={cn(
                  "text-xs px-2 py-1 rounded",
                  SPRINT_PLANNING_WORKFLOW.status === "complete"
                    ? "bg-status-complete/20 text-status-complete"
                    : SPRINT_PLANNING_WORKFLOW.status === "active"
                      ? "bg-status-active/20 text-status-active"
                      : "bg-primary/20 text-primary",
                )}
              >
                {SPRINT_PLANNING_WORKFLOW.status === "complete"
                  ? "Complete"
                  : SPRINT_PLANNING_WORKFLOW.status === "active"
                    ? "In Progress"
                    : "Required"}
              </span>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Sprint Planning</h3>
                <p className="text-sm text-muted-foreground mt-1">{SPRINT_PLANNING_WORKFLOW.description}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="font-mono bg-secondary px-2 py-1 rounded">{SPRINT_PLANNING_WORKFLOW.command}</span>
                  <span>Output: {SPRINT_PLANNING_WORKFLOW.outputPattern}</span>
                </div>
              </div>
            </div>
          </div>

          {!isSprintPlanningDone && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3">
              <Lock className="w-5 h-5 text-amber-400" />
              <p className="text-sm text-amber-300">Complete Sprint Planning to unlock epics and stories board.</p>
            </div>
          )}

          {activeStory && activeStoryEpic && isSprintPlanningDone && (
            <div className="p-4 bg-primary/5 border border-primary/30 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-status-active animate-spin" />
                  <div>
                    <p className="text-sm text-muted-foreground">Currently Active</p>
                    <p className="font-medium">{activeStory.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activeStoryEpic.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedEpic(activeStoryEpic)
                    setDrilldownLevel("stories")
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  View Story
                </button>
              </div>
              <div className="border-t border-primary/20 pt-3">
                <p className="text-xs text-muted-foreground mb-2">Story Workflow Progress</p>
                <StoryWorkflowSequence
                  story={activeStory}
                  onStepClick={(step) => handleStepClick(step, activeStoryEpic.id, activeStory.id)}
                  variant="inline"
                />
              </div>
            </div>
          )}

          {activeStoryEpic && allStoriesDoneInActiveEpic && isSprintPlanningDone && (
            <div className="p-4 bg-status-complete/5 border border-status-complete/30 rounded-lg">
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-status-complete" />
                All stories complete - Epic wrap-up
              </p>
              <EpicPostStorySequence
                epic={activeStoryEpic}
                onStepClick={(step) => handleStepClick(step, activeStoryEpic.id)}
              />
            </div>
          )}

          {isSprintPlanningDone && (
            <>
              <h2 className="text-lg font-semibold mt-6">Epics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {VERSIC_EPICS.map((epic) => (
                  <EpicCard key={epic.id} epic={epic} onClick={() => handleEpicClick(epic)} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  const phasesToShow = PHASES

  const allStories = VERSIC_EPICS.flatMap((epic) =>
    epic.stories.map((story) => ({ ...story, epicTitle: epic.title, epicId: epic.id })),
  )

  return (
    <div ref={containerRef} className="h-full p-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <StatusLegend />
        {isSprintPlanningDone && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                Implementation: {implViewMode === "epics" ? "Epics" : "Stories"}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setImplViewMode("epics")}>View Epics</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setImplViewMode("stories")}>View Stories</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex gap-4 min-w-max h-full">
        {phasesToShow.map((phase) => (
          <div key={phase.id} className="w-80 flex-shrink-0 flex flex-col">
            <div className="flex items-center gap-2 mb-4 px-1">
              <div className={cn("w-2 h-2 rounded-full", phase.color)} />
              <h3 className="font-medium text-sm">{phase.label}</h3>
              <span className="text-xs text-muted-foreground ml-auto">
                {phase.id === "discovery"
                  ? DISCOVERY_WORKFLOWS.length
                  : phase.id === "planning"
                    ? PLANNING_WORKFLOWS.length
                    : phase.id === "solutioning"
                      ? SOLUTIONING_WORKFLOWS.length
                      : isSprintPlanningDone
                        ? implViewMode === "epics"
                          ? 1 + VERSIC_EPICS.length
                          : 1 + allStories.length
                        : 1}
              </span>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto pb-4">
              {phase.id === "discovery" &&
                DISCOVERY_WORKFLOWS.map((workflow) => (
                  <DiscoveryWorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onClick={() => onSelectDiscoveryWorkflow(workflow)}
                    isHighlighted={workflow.id === highlightedWorkflowId}
                  />
                ))}
              {phase.id === "planning" &&
                PLANNING_WORKFLOWS.map((workflow) => (
                  <PhaseWorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onClick={() => onSelectPhaseWorkflow(workflow)}
                    isHighlighted={workflow.id === highlightedWorkflowId}
                  />
                ))}
              {phase.id === "solutioning" &&
                SOLUTIONING_WORKFLOWS.map((workflow) => (
                  <PhaseWorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onClick={() => onSelectPhaseWorkflow(workflow)}
                    isHighlighted={workflow.id === highlightedWorkflowId}
                  />
                ))}
              {phase.id === "implementation" && (
                <>
                  <PhaseWorkflowCard
                    workflow={SPRINT_PLANNING_WORKFLOW}
                    onClick={() => onSelectPhaseWorkflow(SPRINT_PLANNING_WORKFLOW as PhaseWorkflow)}
                    isHighlighted={SPRINT_PLANNING_WORKFLOW.id === highlightedWorkflowId}
                  />
                  {isSprintPlanningDone &&
                    implViewMode === "epics" &&
                    VERSIC_EPICS.map((epic) => (
                      <EpicCard key={epic.id} epic={epic} onClick={() => handleEpicClick(epic)} />
                    ))}
                  {isSprintPlanningDone &&
                    implViewMode === "stories" &&
                    allStories.map((story) => {
                      const StatusIcon = statusIcons[story.status] || Circle
                      const statusNodeClass = getStoryNodeStatus(story)
                      return (
                        <button
                          key={story.id}
                          data-story-id={story.id}
                          onClick={() => {
                            const epic = VERSIC_EPICS.find((e) => e.id === story.epicId)
                            if (epic) {
                              onSelectStory(story, epic)
                            }
                          }}
                          className={cn(
                            "w-full p-3 bg-card rounded-lg border transition-all text-left",
                            story.id === highlightedStoryId
                              ? "border-primary ring-2 ring-primary/30"
                              : "border-border hover:border-primary/50",
                            statusNodeClass === "complete" && "border-status-complete/50",
                            statusNodeClass === "active" && "border-status-active/50 ring-1 ring-status-active/20",
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <StatusIcon
                              className={cn(
                                "w-4 h-4 mt-0.5 flex-shrink-0",
                                story.status === "done" && "text-status-complete",
                                story.status === "in-progress" && "text-status-active animate-spin",
                                story.status === "review" && "text-amber-400",
                                (story.status === "backlog" || story.status === "drafted") && "text-status-pending",
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{story.title}</h4>
                              <p className="text-xs text-muted-foreground truncate">{story.epicTitle}</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                </>
              )}
            </div>
          </div>
        ))}
        {isImplementationView && (
          <div className="w-80 flex-shrink-0 flex flex-col">
            <div className="flex items-center gap-2 mb-4 px-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <h3 className="font-medium text-sm">Sprint Retro</h3>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto pb-4">
              <SprintRetroCard />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
