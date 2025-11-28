"use client"

import { ArrowLeft, FileText, ExternalLink, RefreshCw, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { Story, Epic, WorkflowStep } from "@/lib/bmad-data"
import { getStatusColor, getStatusLabel } from "@/lib/bmad-data"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { StoryWorkflowSequence } from "./story-workflow-sequence"

interface StoryPanelProps {
  story: Story | null
  epic: Epic | null
  onClose: () => void
  onReturnToEpic?: () => void
  onStepClick?: (step: WorkflowStep) => void
}

export function StoryPanel({ story, epic, onClose, onReturnToEpic, onStepClick }: StoryPanelProps) {
  const [fileChanges, setFileChanges] = useState<{ filename: string; changeType: string; time: Date }[]>([])

  useEffect(() => {
    if (!story) return

    const initial = (story.outputs || []).map((o) => ({
      filename: o.filename,
      changeType: "exists",
      time: new Date(Date.now() - Math.random() * 3600000),
    }))
    setFileChanges(initial)

    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const mockFiles = ["validation-report.md", "test-results.json", ".context.xml"]
        const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)]
        setFileChanges((prev) => [
          {
            filename: randomFile,
            changeType: Math.random() > 0.5 ? "created" : "modified",
            time: new Date(),
          },
          ...prev.slice(0, 5),
        ])
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [story])

  if (!story) return null

  const allStoriesDone = epic ? epic.stories.every((s) => s.status === "done") : false

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  const handleStepClick = (step: WorkflowStep) => {
    if (onStepClick) {
      onStepClick(step)
    }
  }

  return (
    <Sheet open={!!story} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-[900px] sm:w-[1000px] sm:max-w-[1000px] bg-sidebar border-border overflow-y-auto p-0">
        <div className="p-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-3 text-xl">
              {story.title}
              <Badge variant="secondary" className={cn(getStatusColor(story.status))}>
                {getStatusLabel(story.status)}
              </Badge>
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6">
            {/* Epic context */}
            {epic && (
              <div className="p-4 bg-card rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Part of Epic</p>
                <p className="text-sm font-medium">{epic.title}</p>
              </div>
            )}

            {/* Description */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed p-4 bg-secondary/30 rounded-lg border border-border">
                {story.description}
              </p>
            </div>

            {/* Acceptance Criteria */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Acceptance Criteria</h4>
              <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                <ul className="space-y-3">
                  {story.acceptanceCriteria.map((ac, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0 font-medium">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed pt-0.5">{ac}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Story Workflow */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Story Workflow</h4>
              <p className="text-xs text-muted-foreground">
                Click a step to run it via Terminal, Chat, or copy the prompt
              </p>
              <div className="border border-border rounded-lg p-4 bg-card">
                <StoryWorkflowSequence story={story} onStepClick={handleStepClick} variant="full" />
              </div>
            </div>

            {/* Outputs & Activity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Outputs & Activity</h4>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  <RefreshCw className="w-3 h-3" />
                  Live
                </Button>
              </div>

              {story.outputs && story.outputs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Story files:</p>
                  <div className="space-y-2">
                    {story.outputs.map((output, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-card rounded-lg border border-border text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded",
                              output.type === "markdown" && "bg-blue-500/20 text-blue-400",
                              output.type === "context" && "bg-purple-500/20 text-purple-400",
                              output.type === "validation" && "bg-green-500/20 text-green-400",
                            )}
                          >
                            {output.type}
                          </span>
                          <span className="font-mono text-xs">{output.filename}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {fileChanges.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Recent activity:</p>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {fileChanges.slice(0, 5).map((change, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-card rounded-lg border border-border text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded",
                              change.changeType === "created"
                                ? "bg-green-500/20 text-green-400"
                                : change.changeType === "modified"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-secondary text-muted-foreground",
                            )}
                          >
                            {change.changeType}
                          </span>
                          <span className="font-mono text-xs">{change.filename}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatTime(change.time)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-border">
              {onReturnToEpic && (
                <Button variant="outline" className="w-full gap-2 bg-transparent h-11" onClick={onReturnToEpic}>
                  <ArrowLeft className="w-4 h-4" />
                  Return to Epic
                </Button>
              )}

              {allStoriesDone && (
                <div className="flex items-center gap-2 p-3 bg-status-complete/10 border border-status-complete/20 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-status-complete" />
                  <p className="text-xs text-status-complete">
                    All stories complete. Next: Epic post-story workflow (including retrospective)
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button className="flex-1 h-11" disabled={story.status === "done"}>
                  {story.status === "in-progress" ? "Continue" : "Start Working"}
                </Button>
                <Button variant="outline" className="h-11 bg-transparent" disabled={story.status === "done"}>
                  Mark Complete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
