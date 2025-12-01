"use client"

import { useState } from "react"
import type { DiscoveryWorkflow, ResearchType } from "@/lib/bmad-data"
import { cn } from "@/lib/utils"
import {
  Terminal,
  MessageSquare,
  CheckCircle2,
  Circle,
  FileText,
  ExternalLink,
  AlertTriangle,
  Info,
  ChevronDown,
  Copy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TerminalLaunchInline } from "./terminal-launch-inline"
import { ChatLaunchInline } from "./chat-launch-inline"
import { CopyCommandsInline } from "./copy-commands-inline"
import type { TerminalAgent } from "./terminal-manager"

interface DiscoveryActionDrawerProps {
  workflow: DiscoveryWorkflow | null
  open: boolean
  onClose: () => void
  onTerminalLaunch?: (
    agentLaunchCommand: string,
    workflowCommand: string,
    terminalAgent: TerminalAgent,
    workflowName: string,
  ) => void
  onChatLaunch?: (agentLaunchCommand: string, workflowCommand: string, workflowName: string) => void
  defaultTerminalAgent: TerminalAgent
  persistedCommands?: Record<string, string>
  onCommandEdit?: (workflowId: string, command: string) => void
}

type RunMode = "terminal" | "chat" | "copy"

const researchTypeLabels: Record<ResearchType, { label: string; hint: string }> = {
  market: { label: "Market Research", hint: "Market definition, geographic scope, segments" },
  competitive: { label: "Competitive Analysis", hint: "Competitor landscape, positioning, gaps" },
  user: { label: "User Research", hint: "User personas, needs, pain points" },
  technical: { label: "Technical Research", hint: "Architecture options, tech evaluation" },
  domain: { label: "Domain Research", hint: "Domain-specific knowledge, regulations" },
  "deep-prompt": { label: "Deep Research Prompt", hint: "Build artifact for deep research" },
}

export function DiscoveryActionDrawer({
  workflow,
  open,
  onClose,
  onTerminalLaunch,
  onChatLaunch,
  defaultTerminalAgent,
  persistedCommands,
  onCommandEdit,
}: DiscoveryActionDrawerProps) {
  const [runMode, setRunMode] = useState<RunMode>("terminal")
  const [selectedResearchType, setSelectedResearchType] = useState<ResearchType | null>(workflow?.researchType || null)

  if (!workflow) return null

  const getCommand = () => {
    if (workflow.workflowId === "research" && selectedResearchType) {
      return `${workflow.command} --type ${selectedResearchType}`
    }
    return workflow.command
  }

  const getOutputPath = () => {
    if (workflow.workflowId === "research" && selectedResearchType) {
      return workflow.outputPattern.replace("{research_type}", selectedResearchType)
    }
    return workflow.outputPattern
  }

  const persistedCommand = persistedCommands?.[workflow.title]

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-[500px] sm:max-w-[500px] bg-sidebar border-border overflow-y-auto p-0">
        <div className="p-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-xl">{workflow.title}</SheetTitle>
          </SheetHeader>

          <div className="space-y-6">
            {/* Description */}
            <div className="p-4 bg-card rounded-lg border border-border">
              <p className="text-sm text-muted-foreground leading-relaxed">{workflow.description}</p>
            </div>

            {/* Research type selector for research workflow */}
            {workflow.workflowId === "research" && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Select Research Type</h4>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-transparent h-11">
                      {selectedResearchType
                        ? researchTypeLabels[selectedResearchType].label
                        : "Choose research type..."}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[calc(500px-3rem)]">
                    {(Object.keys(researchTypeLabels) as ResearchType[]).map((type) => (
                      <DropdownMenuItem
                        key={type}
                        onClick={() => setSelectedResearchType(type)}
                        className="flex flex-col items-start p-3"
                      >
                        <span className="font-medium">{researchTypeLabels[type].label}</span>
                        <span className="text-xs text-muted-foreground">{researchTypeLabels[type].hint}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Anti-hallucination warning */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-300">
                    <p className="font-medium mb-2">Anti-hallucination guards active</p>
                    <ul className="space-y-1 text-amber-300/80 text-xs">
                      <li>- Requires citations with URLs</li>
                      <li>- 2+ sources for critical claims</li>
                      <li>- Confidence marking on findings</li>
                      <li>- Conflicting data presented explicitly</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Inputs */}
            {workflow.inputs.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Inputs</h4>
                <div className="space-y-2">
                  {workflow.inputs.map((input, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg border",
                        input.exists
                          ? "bg-status-complete/5 border-status-complete/20"
                          : "bg-secondary/50 border-border",
                      )}
                    >
                      {input.exists ? (
                        <CheckCircle2 className="w-4 h-4 text-status-complete mt-0.5 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {input.label}
                          {!input.required && (
                            <span className="text-muted-foreground font-normal ml-2">(optional)</span>
                          )}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground mt-1 truncate">{input.path}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expected Output */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Expected Output</h4>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary border border-border">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-mono flex-1 truncate">{getOutputPath()}</span>
              </div>
              {workflow.outputPath && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-status-complete/10 border border-status-complete/20">
                  <CheckCircle2 className="w-4 h-4 text-status-complete flex-shrink-0" />
                  <span className="text-sm font-mono flex-1 truncate">{workflow.outputPath}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Run via</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={runMode === "terminal" ? "default" : "outline"}
                  onClick={() => setRunMode("terminal")}
                  className="flex flex-col items-center gap-2 h-auto py-3"
                >
                  <Terminal className="w-5 h-5" />
                  <span className="text-xs font-medium">Terminal</span>
                </Button>
                <Button
                  variant={runMode === "chat" ? "default" : "outline"}
                  onClick={() => setRunMode("chat")}
                  className="flex flex-col items-center gap-2 h-auto py-3"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-xs font-medium">BMAD Chat</span>
                </Button>
                <Button
                  variant={runMode === "copy" ? "default" : "outline"}
                  onClick={() => setRunMode("copy")}
                  className="flex flex-col items-center gap-2 h-auto py-3"
                >
                  <Copy className="w-5 h-5" />
                  <span className="text-xs font-medium">Copy</span>
                </Button>
              </div>
            </div>

            {runMode === "terminal" && onTerminalLaunch && (
              <TerminalLaunchInline
                config={{
                  workflowName: workflow.title,
                  workflowTrigger: getCommand(),
                  agentId: "ba",
                }}
                defaultTerminalAgent={defaultTerminalAgent}
                onLaunch={(agentCmd, workflowCmd, termAgent, workflowName) => {
                  onTerminalLaunch(agentCmd, workflowCmd, termAgent, workflowName)
                  onClose()
                }}
                persistedCommand={persistedCommand}
                onCommandEdit={onCommandEdit}
              />
            )}

            {runMode === "chat" && (
              <ChatLaunchInline
                config={{
                  workflowName: workflow.title,
                  workflowTrigger: getCommand(),
                  agentId: "ba",
                }}
                onLaunch={(agentCmd, workflowCmd, workflowName) => {
                  if (onChatLaunch) {
                    onChatLaunch(agentCmd, workflowCmd, workflowName)
                  }
                  onClose()
                }}
                persistedCommand={persistedCommand}
                onCommandEdit={onCommandEdit}
              />
            )}

            {runMode === "copy" && (
              <CopyCommandsInline
                config={{
                  workflowName: workflow.title,
                  workflowTrigger: getCommand(),
                  agentId: "ba",
                }}
                persistedCommand={persistedCommand}
                onCommandEdit={onCommandEdit}
              />
            )}

            {/* Workflow notes */}
            {workflow.workflowId === "product-brief" && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-300">
                  <p className="font-medium mb-1">Auto-discovery active</p>
                  <p className="text-blue-300/80 text-xs">
                    Inputs from research and brainstorming outputs will be automatically discovered and incorporated.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
