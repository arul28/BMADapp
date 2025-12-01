"use client"

import { Calendar, Users, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function SprintPlanningCard() {
  return (
    <div className="p-5 bg-card rounded-lg border-2 border-primary/30 relative overflow-hidden">
      {/* Planning tag */}
      <Badge variant="default" className="absolute top-3 right-3 bg-primary text-primary-foreground">
        Planning
      </Badge>

      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">Sprint Planning</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Plan sprint backlog, prioritize stories, and assign work to team members
          </p>

          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Sprint 3
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />3 team members
            </span>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
            <div>
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-xs text-muted-foreground">Story Points</div>
            </div>
            <div>
              <div className="text-2xl font-bold">3</div>
              <div className="text-xs text-muted-foreground">Epics Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold">7</div>
              <div className="text-xs text-muted-foreground">Stories Ready</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
