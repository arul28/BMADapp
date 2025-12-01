"use client"

import { useState } from "react"
import { Terminal, Plus, X, Circle, Bot, Play, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { SlideSidebar } from "./slide-sidebar"
import type { TerminalSession, WorkflowCard } from "@/lib/bmad-data"
import { cn } from "@/lib/utils"

export type TerminalAgent = "claude-code" | "codex" | "gemini-cli" | "aider" | "none"

export const TERMINAL_AGENTS: { id: TerminalAgent; name: string; description: string; command: string }[] = [
  { id: "claude-code", name: "Claude Code", description: "Anthropic's Claude for coding", command: "claude" },
  { id: "codex", name: "Codex CLI", description: "OpenAI Codex terminal", command: "codex" },
  { id: "gemini-cli", name: "Gemini CLI", description: "Google's Gemini in terminal", command: "gemini" },
  { id: "aider", name: "Aider", description: "AI pair programming", command: "aider" },
  { id: "none", name: "Plain Terminal", description: "Standard terminal session", command: "" },
]

interface TerminalManagerProps {
  open: boolean
  onClose: () => void
  sessions: TerminalSession[]
  onCreateSession: (workflowId?: string, workflowTitle?: string, agent?: TerminalAgent) => void
  currentWorkflow?: WorkflowCard | null
  defaultAgent?: TerminalAgent
}

export function TerminalManager({
  open,
  onClose,
  sessions,
  onCreateSession,
  currentWorkflow,
  defaultAgent = "claude-code",
}: TerminalManagerProps) {
  const [activeTabId, setActiveTabId] = useState<string | null>(sessions[0]?.id || null)

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  const handleCreateSession = (agent: TerminalAgent) => {
    onCreateSession(currentWorkflow?.id, currentWorkflow?.title, agent)
  }

  const getAgentInfo = (agentId: TerminalAgent) => {
    return TERMINAL_AGENTS.find((a) => a.id === agentId) || TERMINAL_AGENTS[4]
  }

  const activeSession = sessions.find((s) => s.id === activeTabId)

  return (
    <SlideSidebar
      isOpen={open}
      onClose={onClose}
      title="Terminal"
      icon={<Terminal className="w-5 h-5" />}
      defaultWidth={500}
      minWidth={400}
      maxWidth={1200}
    >
      <div className="flex-1 flex flex-col h-full">
        {/* Terminal Tabs Bar */}
        <div className="flex items-center gap-2 px-4 pl-6 py-2 border-b border-border bg-card/50 overflow-x-auto">
          {sessions.length > 0 ? (
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setActiveTabId(session.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors min-w-0 max-w-[200px] group",
                    activeTabId === session.id
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "bg-card hover:bg-secondary text-muted-foreground hover:text-foreground border border-transparent",
                  )}
                >
                  <Circle
                    className={cn(
                      "w-2 h-2 flex-shrink-0",
                      session.status === "active" ? "fill-status-active text-status-active" : "fill-muted text-muted",
                    )}
                  />
                  <span className="truncate">{session.originWorkflowTitle || "Terminal"}</span>
                  <X
                    className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Would handle close here
                    }}
                  />
                </button>
              ))}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">No terminals open</span>
          )}

          {/* New Terminal Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 flex-shrink-0">
                <Plus className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Launch with AI Agent</DropdownMenuLabel>
              {TERMINAL_AGENTS.filter((a) => a.id !== "none").map((agent) => (
                <DropdownMenuItem
                  key={agent.id}
                  onClick={() => handleCreateSession(agent.id)}
                  className="flex items-center gap-2"
                >
                  <Bot className="w-4 h-4 text-primary" />
                  <div className="flex-1">
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-xs text-muted-foreground">{agent.description}</div>
                  </div>
                  {agent.id === defaultAgent && (
                    <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">Default</span>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleCreateSession("none")}>
                <Terminal className="w-4 h-4 mr-2" />
                Plain Terminal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Terminal Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeSession ? (
            <div className="flex-1 flex flex-col">
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 pl-6 py-2 bg-card/30 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Circle
                      className={cn(
                        "w-2 h-2",
                        activeSession.status === "active"
                          ? "fill-status-active text-status-active"
                          : "fill-muted text-muted",
                      )}
                    />
                    <span className="text-sm font-medium">
                      {activeSession.originWorkflowTitle || "General Session"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTime(activeSession.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    <Play className="w-3 h-3" />
                    Run Command
                  </Button>
                </div>
              </div>

              {/* Terminal Output */}
              <ScrollArea className="flex-1 bg-black/40">
                <div className="p-4 pl-6 font-mono text-sm">
                  <div className="text-muted-foreground mb-2">
                    $ {activeSession.lastCommand || "# Ready for input..."}
                  </div>
                  <div className="text-green-400">Session started at {formatTime(activeSession.createdAt)}</div>
                  {activeSession.originWorkflowTitle && (
                    <div className="text-cyan-400 mt-1">Context: {activeSession.originWorkflowTitle}</div>
                  )}
                  <div className="mt-4 text-muted-foreground/60"># Type your commands or use an AI agent...</div>
                </div>
              </ScrollArea>

              {/* Terminal Input */}
              <div className="flex items-center gap-2 px-4 pl-6 py-3 bg-card/50 border-t border-border">
                <span className="text-primary font-mono text-sm">$</span>
                <input
                  type="text"
                  placeholder="Enter command..."
                  className="flex-1 bg-transparent border-none outline-none text-sm font-mono placeholder:text-muted-foreground/50"
                />
                <Button variant="ghost" size="sm">
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 pl-8">
              <Terminal className="w-12 h-12 text-muted-foreground/30" />
              <div className="text-center">
                <h3 className="font-medium mb-1">No Terminal Open</h3>
                <p className="text-sm text-muted-foreground mb-4">Create a new terminal session to get started</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      New Terminal
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Launch with AI Agent
                    </DropdownMenuLabel>
                    {TERMINAL_AGENTS.filter((a) => a.id !== "none").map((agent) => (
                      <DropdownMenuItem
                        key={agent.id}
                        onClick={() => handleCreateSession(agent.id)}
                        className="flex items-center gap-2"
                      >
                        <Bot className="w-4 h-4 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-xs text-muted-foreground">{agent.description}</div>
                        </div>
                        {agent.id === defaultAgent && (
                          <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">Default</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleCreateSession("none")}>
                      <Terminal className="w-4 h-4 mr-2" />
                      Plain Terminal
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {currentWorkflow && (
                <p className="text-xs text-muted-foreground">Current context: {currentWorkflow.title}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </SlideSidebar>
  )
}
