"use client"
import { Settings, Terminal, MessageSquare, ChevronDown, Zap, FileText, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { type Phase, PHASES } from "@/lib/bmad-data"
import { RepositoryPicker } from "./repository-picker"
import type { BmadRepository } from "@/lib/repository-store"

interface HeaderProps {
  activePhase: Phase | "all"
  setActivePhase: (phase: Phase | "all") => void
  onOpenSettings: () => void
  onOpenChat: () => void
  onOpenTerminal: () => void
  onOpenDocs: () => void
  onOpenAgents: () => void
  repositories: BmadRepository[]
  activeRepository: BmadRepository | null
  onSelectRepository: (repo: BmadRepository) => void
  onRemoveRepository: (id: string) => void
}

export function Header({
  activePhase,
  setActivePhase,
  onOpenSettings,
  onOpenChat,
  onOpenTerminal,
  onOpenDocs,
  onOpenAgents,
  repositories,
  activeRepository,
  onSelectRepository,
  onRemoveRepository,
}: HeaderProps) {
  const currentPhaseLabel =
    activePhase === "all" ? "All Phases" : PHASES.find((p) => p.id === activePhase)?.label || "All Phases"

  return (
    <header className="h-14 border-b border-border bg-sidebar flex items-center justify-between px-4">
      {/* Left: Logo & Repository Picker & Phase Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">BMAD</span>
        </div>

        <div className="h-6 w-px bg-border" />

        <RepositoryPicker
          repositories={repositories}
          activeRepository={activeRepository}
          onSelectRepository={onSelectRepository}
          onRemoveRepository={onRemoveRepository}
        />

        {/* Only show phase selector if we have an active repository */}
        {activeRepository && (
          <>
            <div className="h-6 w-px bg-border" />

            {/* Phase Selector Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <span className="text-sm">{currentPhaseLabel}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setActivePhase("all")}>All Phases</DropdownMenuItem>
                {PHASES.map((phase) => (
                  <DropdownMenuItem key={phase.id} onClick={() => setActivePhase(phase.id)}>
                    <div className={cn("w-2 h-2 rounded-full mr-2", phase.color)} />
                    {phase.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Agents Guide button */}
        <Button variant="ghost" size="icon" onClick={onOpenAgents} title="Agents Guide">
          <Users className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onOpenDocs} title="Docs">
          <FileText className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onOpenTerminal} title="Terminal Manager">
          <Terminal className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onOpenChat} title="Chat Manager">
          <MessageSquare className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onOpenSettings} title="Settings">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
