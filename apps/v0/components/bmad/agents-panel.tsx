"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Copy, Check, Sparkles, AlertCircle, Search, X, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SlideSidebar } from "./slide-sidebar"
import { SOFTWARE_AGENTS, SPECIAL_WORKFLOWS, type Agent, type AgentWorkflow } from "@/lib/agents-data"
import { cn } from "@/lib/utils"
import type { TerminalLaunchConfig } from "./terminal-launch-dialog"

interface AgentsPanelProps {
  open: boolean
  onClose: () => void
  onRunInTerminal?: (config: TerminalLaunchConfig) => void
}

export function AgentsPanel({ open, onClose, onRunInTerminal }: AgentsPanelProps) {
  const [expandedAgents, setExpandedAgents] = useState<string[]>([])
  const [copiedTrigger, setCopiedTrigger] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"agents" | "special">("agents")

  const toggleAgent = (agentId: string) => {
    setExpandedAgents((prev) => (prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]))
  }

  const copyTrigger = async (trigger: string) => {
    await navigator.clipboard.writeText(trigger)
    setCopiedTrigger(trigger)
    setTimeout(() => setCopiedTrigger(null), 2000)
  }

  const filteredAgents = SOFTWARE_AGENTS.filter((agent) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      agent.name.toLowerCase().includes(query) ||
      agent.displayName.toLowerCase().includes(query) ||
      agent.role.toLowerCase().includes(query) ||
      agent.description.toLowerCase().includes(query) ||
      agent.workflows.some((w) => w.name.toLowerCase().includes(query) || w.description.toLowerCase().includes(query))
    )
  })

  const filteredSpecialWorkflows = SPECIAL_WORKFLOWS.filter((workflow) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      workflow.name.toLowerCase().includes(query) ||
      workflow.description.toLowerCase().includes(query) ||
      workflow.useCase.toLowerCase().includes(query)
    )
  })

  return (
    <SlideSidebar
      isOpen={open}
      onClose={onClose}
      title="BMAD Agents Guide"
      icon={<Sparkles className="w-5 h-5 text-primary" />}
      defaultWidth={500}
      minWidth={400}
      maxWidth={1200}
    >
      <div className="flex flex-col h-full">
        {/* Search and Tabs */}
        <div className="p-4 pl-5 space-y-4 border-b border-border flex-shrink-0">
          <p className="text-sm text-muted-foreground">
            Explore all available agents, their workflows, and discover powerful capabilities
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search agents, workflows, or commands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant={activeTab === "agents" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("agents")}
              className="flex-1"
            >
              All Agents ({SOFTWARE_AGENTS.length})
            </Button>
            <Button
              variant={activeTab === "special" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("special")}
              className="flex-1"
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              Key Workflows ({SPECIAL_WORKFLOWS.length})
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 pl-5">
          <div className="space-y-4">
            {activeTab === "agents" ? (
              <>
                {filteredAgents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No agents or workflows match your search
                  </div>
                ) : (
                  filteredAgents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      isExpanded={expandedAgents.includes(agent.id)}
                      onToggle={() => toggleAgent(agent.id)}
                      copiedTrigger={copiedTrigger}
                      onCopyTrigger={copyTrigger}
                      searchQuery={searchQuery}
                      onRunInTerminal={onRunInTerminal}
                    />
                  ))
                )}
              </>
            ) : (
              <>
                {filteredSpecialWorkflows.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No workflows match your search</div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      These are powerful workflows that you might not discover on your own. They can help you
                      course-correct, collaborate across agents, or get unstuck.
                    </p>
                    {filteredSpecialWorkflows.map((workflow) => (
                      <SpecialWorkflowCard
                        key={workflow.id}
                        workflow={workflow}
                        copiedTrigger={copiedTrigger}
                        onCopyTrigger={copyTrigger}
                        onRunInTerminal={onRunInTerminal}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </SlideSidebar>
  )
}

interface AgentCardProps {
  agent: Agent
  isExpanded: boolean
  onToggle: () => void
  copiedTrigger: string | null
  onCopyTrigger: (trigger: string) => void
  searchQuery: string
  onRunInTerminal?: (config: TerminalLaunchConfig) => void
}

function AgentCard({
  agent,
  isExpanded,
  onToggle,
  copiedTrigger,
  onCopyTrigger,
  searchQuery,
  onRunInTerminal,
}: AgentCardProps) {
  const regularWorkflows = agent.workflows.filter((w) => !w.isValidation)
  const validationWorkflows = agent.workflows.filter((w) => w.isValidation)

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Agent Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start gap-4 hover:bg-accent/50 transition-colors text-left"
      >
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
          {agent.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-base">
              {agent.name} ({agent.displayName})
            </h3>
            <Badge variant="outline" className="text-xs">
              {agent.primaryPhase}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{agent.role}</p>
          <p className="text-sm text-foreground/80 mt-2 line-clamp-2">{agent.description}</p>
        </div>
        <div className="flex-shrink-0 mt-1">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border p-4 space-y-6 bg-background/50">
          {/* Communication Style */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Communication Style</h4>
            <p className="text-sm">{agent.communicationStyle}</p>
          </div>

          {/* Expertise */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Expertise</h4>
            <div className="flex flex-wrap gap-2">
              {agent.expertise.map((exp) => (
                <Badge key={exp} variant="secondary" className="text-xs">
                  {exp}
                </Badge>
              ))}
            </div>
          </div>

          {/* Workflows */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">
              Workflows ({agent.workflows.length})
            </h4>
            <div className="space-y-2">
              {regularWorkflows.map((workflow) => (
                <WorkflowRow
                  key={workflow.id}
                  workflow={workflow}
                  copiedTrigger={copiedTrigger}
                  onCopyTrigger={onCopyTrigger}
                  onRunInTerminal={onRunInTerminal}
                />
              ))}
              {validationWorkflows.length > 0 && (
                <>
                  <div className="text-xs text-muted-foreground pt-2 pb-1">Validation Workflows</div>
                  {validationWorkflows.map((workflow) => (
                    <WorkflowRow
                      key={workflow.id}
                      workflow={workflow}
                      copiedTrigger={copiedTrigger}
                      onCopyTrigger={onCopyTrigger}
                      onRunInTerminal={onRunInTerminal}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface WorkflowRowProps {
  workflow: AgentWorkflow
  copiedTrigger: string | null
  onCopyTrigger: (trigger: string) => void
  onRunInTerminal?: (config: TerminalLaunchConfig) => void
}

function WorkflowRow({ workflow, copiedTrigger, onCopyTrigger, onRunInTerminal }: WorkflowRowProps) {
  const isCopied = copiedTrigger === workflow.trigger

  const handleRunInTerminal = () => {
    onRunInTerminal?.({
      workflowName: workflow.name,
      workflowTrigger: workflow.trigger,
      agentId: workflow.agentId,
      slashCommand: workflow.slashCommand,
    })
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar border border-border">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{workflow.name}</span>
          {workflow.isValidation && (
            <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
              Validation
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{workflow.description}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary bg-transparent"
                onClick={handleRunInTerminal}
              >
                <Play className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Run in Terminal</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          variant="outline"
          size="sm"
          className={cn("font-mono text-xs gap-1.5", isCopied && "bg-primary/10 border-primary text-primary")}
          onClick={() => onCopyTrigger(workflow.trigger)}
        >
          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {workflow.trigger}
        </Button>
      </div>
    </div>
  )
}

interface SpecialWorkflowCardProps {
  workflow: (typeof SPECIAL_WORKFLOWS)[0]
  copiedTrigger: string | null
  onCopyTrigger: (trigger: string) => void
  onRunInTerminal?: (config: TerminalLaunchConfig) => void
}

function SpecialWorkflowCard({ workflow, copiedTrigger, onCopyTrigger, onRunInTerminal }: SpecialWorkflowCardProps) {
  const isCopied = copiedTrigger === workflow.trigger

  const handleRunInTerminal = () => {
    onRunInTerminal?.({
      workflowName: workflow.name,
      workflowTrigger: workflow.trigger,
      agentId: workflow.agentIds?.[0],
    })
  }

  return (
    <div className="border border-primary/30 rounded-lg bg-primary/5 p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            {workflow.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{workflow.description}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary border-primary/30 bg-transparent"
                  onClick={handleRunInTerminal}
                >
                  <Play className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Run in Terminal</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "font-mono text-xs gap-1.5 border-primary/30",
              isCopied && "bg-primary/10 border-primary text-primary",
            )}
            onClick={() => onCopyTrigger(workflow.trigger)}
          >
            {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {workflow.trigger}
          </Button>
        </div>
      </div>

      <div className="bg-background/60 rounded-lg p-4 space-y-3">
        <div>
          <span className="text-xs font-semibold uppercase text-muted-foreground">When to use</span>
          <p className="text-sm mt-1">{workflow.useCase}</p>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase text-muted-foreground">Available from</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {workflow.agents.map((agent) => (
              <Badge key={agent} variant="secondary" className="text-xs">
                {agent}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
