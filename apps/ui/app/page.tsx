"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/bmad/header"
import { BoardView } from "@/components/bmad/board-view"
import { SettingsPanel } from "@/components/bmad/settings-panel"
import { ActionDrawer } from "@/components/bmad/action-drawer"
import { DiscoveryActionDrawer } from "@/components/bmad/discovery-action-drawer"
import { PhaseActionDrawer } from "@/components/bmad/phase-action-drawer"
import { StoryPanel } from "@/components/bmad/story-panel"
import { TerminalManager, type TerminalAgent } from "@/components/bmad/terminal-manager"
import { ChatManager } from "@/components/bmad/chat-manager"
import { DocsManager } from "@/components/bmad/docs-manager"
import { WorkflowStepRunner } from "@/components/bmad/workflow-step-runner"
import { AgentsPanel } from "@/components/bmad/agents-panel"
import type { TerminalLaunchConfig } from "@/components/bmad/terminal-launch-dialog"
import type { SidebarPanel } from "@/components/bmad/slide-sidebar"
import {
  toRepositoryList,
  type BmadRepository,
} from "@/lib/repository-store"
import type { RepoHealthResult, RepositoryState } from "@/lib/repo-types"
import { callRepoEndpoint } from "@/lib/client/repo-api"
import type {
  Phase,
  WorkflowCard,
  Story,
  Epic,
  Provider,
  TerminalSession,
  ChatThread,
  WorkflowStep,
  DiscoveryWorkflow,
  PhaseWorkflow,
} from "@/lib/bmad-data"
import { SPRINT_PLANNING_WORKFLOW } from "@/lib/bmad-data"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { WelcomeScreen } from "@/components/bmad/welcome-screen"
import { AlertTriangle } from "lucide-react"

export default function MissionControl() {
  const router = useRouter()
  const [repositories, setRepositories] = useState<BmadRepository[]>([])
  const [activeRepository, setActiveRepository] = useState<BmadRepository | null>(null)
  const [repoState, setRepoState] = useState<RepositoryState | null>(null)
  const [repoHealth, setRepoHealth] = useState<RepoHealthResult | null>(null)
  const [repoLoading, setRepoLoading] = useState(true)
  const [repoError, setRepoError] = useState<string | null>(null)

  const [activePhase, setActivePhase] = useState<Phase | "all" | "discovery">("all")

  const [activePanel, setActivePanel] = useState<SidebarPanel>(null)

  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowCard | null>(null)
  const [selectedDiscoveryWorkflow, setSelectedDiscoveryWorkflow] = useState<DiscoveryWorkflow | null>(null)
  const [selectedPhaseWorkflow, setSelectedPhaseWorkflow] = useState<PhaseWorkflow | null>(null)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null)
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null)
  const [selectedStepEpicId, setSelectedStepEpicId] = useState<string | undefined>()
  const [selectedStepStoryId, setSelectedStepStoryId] = useState<string | undefined>()

  const [highlightedWorkflowId, setHighlightedWorkflowId] = useState<string | null>(null)
  const [highlightedStoryId, setHighlightedStoryId] = useState<string | null>(null)

  const [providers, setProviders] = useState<Provider[]>([])
  const [hasShownProviderToast, setHasShownProviderToast] = useState(false)
  const [defaultTerminalAgent, setDefaultTerminalAgent] = useState<TerminalAgent>("claude-code")

  const [terminalSessions, setTerminalSessions] = useState<TerminalSession[]>([])
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([])

  const [terminalLaunchDialogOpen, setTerminalLaunchDialogOpen] = useState(false)
  const [terminalLaunchConfig, setTerminalLaunchConfig] = useState<TerminalLaunchConfig | null>(null)

  const [persistedCommands, setPersistedCommands] = useState<Record<string, string>>({})

  const openPanel = (panel: SidebarPanel) => {
    setActivePanel(panel)
  }

  const closePanel = () => {
    setActivePanel(null)
  }

  const isHealthPayload = (
    payload: RepoHealthResult | { status?: unknown } | undefined,
  ): payload is RepoHealthResult => typeof payload?.status === "string"

  const restoreRepoState = async (pathOverride?: string) => {
    setRepoLoading(true)
    setRepoError(null)
    let isHealthy = false
    try {
      const { response, data } = await callRepoEndpoint<RepoHealthResult & { state?: RepositoryState; error?: string; message?: string }>(
        "restore",
        pathOverride ? { repoPath: pathOverride } : undefined,
      )

      if (isHealthPayload(data)) {
        setRepoHealth(data)
        setRepoState(data.state ?? null)
        isHealthy = data.status === "healthy"
      } else if ("state" in data && data.state) {
        setRepoState(data.state)
        setRepoHealth(null)
      }

      if (!response.ok) {
        const message = (data as any).error ?? (data as any).message ?? "Unable to restore repository"
        setRepoError(message)
      }
    } catch (err) {
      setRepoHealth(null)
      setRepoState(null)
      setRepoError(err instanceof Error ? err.message : "Unable to restore repository")
    }
    setRepoLoading(false)
    return isHealthy
  }

  const persistRepoState = async (repoPath: string, displayName?: string) => {
    setRepoLoading(true)
    setRepoError(null)
    let isHealthy = false
    try {
      const { response, data } = await callRepoEndpoint<RepoHealthResult & { state?: RepositoryState; error?: string; message?: string }>(
        "persist",
        { repoPath, displayName },
      )

      if (isHealthPayload(data)) {
        setRepoHealth(data)
        setRepoState(data.state ?? null)
        isHealthy = data.status === "healthy"
      } else if ("state" in data && data.state) {
        setRepoState(data.state)
        setRepoHealth(null)
      }

      if (!response.ok) {
        const message = (data as any).error ?? (data as any).message ?? "Unable to persist repository"
        setRepoError(message)
      }
    } catch (err) {
      setRepoHealth(null)
      setRepoState(null)
      setRepoError(err instanceof Error ? err.message : "Unable to persist repository")
    }
    setRepoLoading(false)
    return isHealthy
  }

  useEffect(() => {
    restoreRepoState()
  }, [])

  useEffect(() => {
    const derived = toRepositoryList(repoState ?? { active: null, recent: [] })
    setRepositories(derived)
    if (repoState?.active) {
      const active = derived.find((repo) => repo.path === repoState.active?.repoPath)
      setActiveRepository(active ?? null)
    } else {
      setActiveRepository(null)
    }
  }, [repoState])

  useEffect(() => {
    if (repoHealth?.status === "unhealthy") {
      setActiveRepository(null)
    }
  }, [repoHealth])

  useEffect(() => {
    const activeProvider = providers.find((p) => p.isActive)
    if (!activeProvider && !hasShownProviderToast && activeRepository) {
      toast.info("No AI provider configured", {
        description: "Set up a provider in Settings to enable Chat features.",
        action: {
          label: "Settings",
          onClick: () => openPanel("settings"),
        },
      })
      setHasShownProviderToast(true)
    }
  }, [providers, hasShownProviderToast, activeRepository])

  useEffect(() => {
    if (highlightedWorkflowId) {
      const timer = setTimeout(() => {
        setHighlightedWorkflowId(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [highlightedWorkflowId])

  useEffect(() => {
    if (highlightedStoryId) {
      const timer = setTimeout(() => {
        setHighlightedStoryId(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [highlightedStoryId])

  const handleSelectRepository = async (repo: BmadRepository) => {
    const healthy = await restoreRepoState(repo.path)
    if (healthy) {
      setActivePhase("all")
      setSelectedWorkflow(null)
      setSelectedDiscoveryWorkflow(null)
      setSelectedPhaseWorkflow(null)
      setSelectedStory(null)
      setSelectedEpic(null)
      toast.success(`Switched to ${repo.name}`)
    } else {
      toast.error("Repository is unhealthy", {
        description: "Fix required BMAD artifacts and retry.",
      })
    }
  }

  const handleRemoveRepository = async (id: string) => {
    const target = repositories.find((repo) => repo.id === id)
    const confirmed = typeof window === "undefined" ? true : window.confirm(`Remove ${target?.name ?? id} from Mission Control?`)
    if (!confirmed) return

    setRepoLoading(true)
    setRepoError(null)
    try {
      const { response, data } = await callRepoEndpoint<{ state?: RepositoryState; error?: string; message?: string }>("remove", {
        repoPath: id,
      })
      if (!response.ok) {
        const message = (data as any).error ?? (data as any).message ?? "Unable to remove repository"
        setRepoError(message)
        toast.error(message)
      } else {
        setRepoState(data.state ?? null)
        if (data.state?.active?.repoPath === id) {
          setRepoHealth(null)
        }
        toast.success("Repository removed")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to remove repository"
      setRepoError(message)
      toast.error(message)
    }
    setRepoLoading(false)
  }

  const handleSelectStory = (story: Story, epic: Epic) => {
    setSelectedStory(story)
    setSelectedEpic(epic)
  }

  const handleSelectStep = (step: WorkflowStep, epicId: string, storyId?: string) => {
    setSelectedStep(step)
    setSelectedStepEpicId(epicId)
    setSelectedStepStoryId(storyId)
  }

  const handleStoryPanelStepClick = (step: WorkflowStep) => {
    if (selectedEpic && selectedStory) {
      setSelectedStep(step)
      setSelectedStepEpicId(selectedEpic.id)
      setSelectedStepStoryId(selectedStory.id)
    }
  }

  const handleOpenTerminalForWorkflow = (workflowId: string, workflowTitle: string) => {
    const newSession: TerminalSession = {
      id: `term-${Date.now()}`,
      originWorkflowId: workflowId,
      originWorkflowTitle: workflowTitle,
      status: "active",
      createdAt: new Date(),
    }
    setTerminalSessions((prev) => [newSession, ...prev])
    openPanel("terminal")
    toast.success(`Terminal session started for "${workflowTitle}"`)
  }

  const handleOpenChatForWorkflow = (workflowId: string, workflowTitle: string) => {
    const activeProvider = providers.find((p) => p.isActive)
    if (!activeProvider) {
      openPanel("chat")
      return
    }
    const newThread: ChatThread = {
      id: `chat-${Date.now()}`,
      originWorkflowId: workflowId,
      originWorkflowTitle: workflowTitle,
      providerId: activeProvider.id,
      providerName: activeProvider.name,
      status: "active",
      messageCount: 0,
      createdAt: new Date(),
    }
    setChatThreads((prev) => [newThread, ...prev])
    openPanel("chat")
    toast.success(`Chat thread started for "${workflowTitle}"`)
  }

  const handleOpenTerminalForStep = (stepId: string, stepName: string) => {
    const newSession: TerminalSession = {
      id: `term-${Date.now()}`,
      originStepId: stepId,
      originEpicId: selectedStepEpicId,
      originStoryId: selectedStepStoryId,
      originWorkflowTitle: stepName,
      status: "active",
      createdAt: new Date(),
    }
    setTerminalSessions((prev) => [newSession, ...prev])
    openPanel("terminal")
    toast.success(`Terminal session started for "${stepName}"`)
  }

  const handleOpenChatForStep = (stepId: string, stepName: string) => {
    const activeProvider = providers.find((p) => p.isActive)
    if (!activeProvider) {
      openPanel("chat")
      return
    }
    const newThread: ChatThread = {
      id: `chat-${Date.now()}`,
      originStepId: stepId,
      originEpicId: selectedStepEpicId,
      originStoryId: selectedStepStoryId,
      originWorkflowTitle: stepName,
      providerId: activeProvider.id,
      providerName: activeProvider.name,
      status: "active",
      messageCount: 0,
      createdAt: new Date(),
    }
    setChatThreads((prev) => [newThread, ...prev])
    openPanel("chat")
    toast.success(`Chat thread started for "${stepName}"`)
  }

  const handleCreateTerminalSession = (workflowId?: string, workflowTitle?: string, agent?: TerminalAgent) => {
    const newSession: TerminalSession = {
      id: `term-${Date.now()}`,
      originWorkflowId: workflowId,
      originWorkflowTitle: workflowTitle,
      status: "active",
      createdAt: new Date(),
    }
    setTerminalSessions((prev) => [newSession, ...prev])
    const agentName = agent && agent !== "none" ? ` with ${agent}` : ""
    toast.success(
      workflowTitle
        ? `Terminal session started for "${workflowTitle}"${agentName}`
        : `New terminal session started${agentName}`,
    )
  }

  const handleCreateChatThread = (workflowId?: string, workflowTitle?: string) => {
    const activeProvider = providers.find((p) => p.isActive)
    if (!activeProvider) return
    const newThread: ChatThread = {
      id: `chat-${Date.now()}`,
      originWorkflowId: workflowId,
      originWorkflowTitle: workflowTitle,
      providerId: activeProvider.id,
      providerName: activeProvider.name,
      status: "active",
      messageCount: 0,
      createdAt: new Date(),
    }
    setChatThreads((prev) => [newThread, ...prev])
    toast.success(workflowTitle ? `Chat thread started for "${workflowTitle}"` : "New chat thread started")
  }

  const handleRunSprintPlanning = () => {
    setSelectedPhaseWorkflow(null)
    setActivePhase("implementation")
    setSelectedPhaseWorkflow(SPRINT_PLANNING_WORKFLOW as PhaseWorkflow)
  }

  const handleRunWorkflowInTerminal = (config: TerminalLaunchConfig) => {
    setTerminalLaunchConfig(config)
    setTerminalLaunchDialogOpen(true)
  }

  const handleConfirmTerminalLaunch = (
    agentLaunchCommand: string,
    workflowCommand: string,
    terminalAgent: TerminalAgent,
    workflowName: string,
  ) => {
    const newSession: TerminalSession = {
      id: `term-${Date.now()}`,
      originWorkflowId: workflowCommand,
      originWorkflowTitle: workflowName,
      status: "active",
      lastCommand: `${agentLaunchCommand} → ${workflowCommand}`,
      createdAt: new Date(),
    }
    setTerminalSessions((prev) => [newSession, ...prev])
    openPanel("terminal")
    toast.success(`Running "${workflowName}" in terminal`, {
      description: `Agent: ${agentLaunchCommand} | Command: ${workflowCommand}`,
    })
  }

  const handleRunWorkflowInTerminalLegacy = (workflowName: string, trigger: string) => {
    handleRunWorkflowInTerminal({
      workflowName,
      workflowTrigger: trigger,
    })
  }

  const handleCommandEdit = (workflowId: string, command: string) => {
    setPersistedCommands((prev) => ({
      ...prev,
      [workflowId]: command,
    }))
  }

  const handleChatLaunch = (workflowId: string, workflowTitle: string) => {
    const activeProvider = providers.find((p) => p.isActive)
    if (!activeProvider) return
    const newThread: ChatThread = {
      id: `chat-${Date.now()}`,
      originWorkflowId: workflowId,
      originWorkflowTitle: workflowTitle,
      providerId: activeProvider.id,
      providerName: activeProvider.name,
      status: "active",
      messageCount: 0,
      createdAt: new Date(),
    }
    setChatThreads((prev) => [newThread, ...prev])
    openPanel("chat")
    toast.success(`Chat thread started for "${workflowTitle}"`)
  }

  const renderSidebarPanels = () => (
    <>
      <AgentsPanel open={activePanel === "agents"} onClose={closePanel} onRunInTerminal={handleRunWorkflowInTerminal} />
      <DocsManager open={activePanel === "docs"} onClose={closePanel} />
      <TerminalManager
        open={activePanel === "terminal"}
        onClose={closePanel}
        sessions={terminalSessions}
        onCreateSession={handleCreateTerminalSession}
        currentWorkflow={selectedWorkflow}
        defaultAgent={defaultTerminalAgent}
      />
      <ChatManager
        open={activePanel === "chat"}
        onClose={closePanel}
        threads={chatThreads}
        onCreateThread={handleCreateChatThread}
        currentWorkflow={selectedWorkflow}
        hasProvider={providers.some((p) => p.isActive)}
        onOpenSettings={() => {
          closePanel()
          openPanel("settings")
        }}
      />
      <SettingsPanel
        open={activePanel === "settings"}
        onClose={closePanel}
        providers={providers}
        setProviders={setProviders}
        defaultTerminalAgent={defaultTerminalAgent}
        setDefaultTerminalAgent={setDefaultTerminalAgent}
      />
    </>
  )

  if (repoLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Restoring repository state…</div>
        <Toaster position="bottom-right" />
      </div>
    )
  }

  const hasRepositories = repositories.length > 0
  const repoIsHealthy = repoHealth?.status === "healthy" && !!activeRepository
  const showHealthBlocker = repoHealth?.status === "unhealthy" && hasRepositories

  if (!repoIsHealthy) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <Header
          activePhase={activePhase}
          setActivePhase={setActivePhase}
          onOpenSettings={() => openPanel("settings")}
          onOpenChat={() => openPanel("chat")}
          onOpenTerminal={() => openPanel("terminal")}
          onOpenDocs={() => openPanel("docs")}
          onOpenAgents={() => openPanel("agents")}
          repositories={repositories}
          activeRepository={activeRepository}
          onSelectRepository={handleSelectRepository}
          onRemoveRepository={handleRemoveRepository}
        />
        <div className="flex-1 flex items-center justify-center px-6">
          {showHealthBlocker ? (
            <div className="w-full max-w-3xl rounded-lg border bg-card shadow-sm p-6 space-y-4" data-testid="repo-health-blocker">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">Repository health check failed</h2>
                  <p className="text-sm text-muted-foreground">
                    Fix the required BMAD config and retry. Missing items are listed below.
                  </p>
                </div>
              </div>
              {repoHealth.missing?.length ? (
                <div className="rounded-md border bg-muted/40 p-4">
                  <p className="text-sm font-medium mb-2">Missing</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {repoHealth.missing.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="flex gap-3">
                <Button onClick={() => router.push("repo/")}>Open repo health</Button>
                <Button variant="outline" onClick={() => restoreRepoState()} disabled={repoLoading}>
                  Retry validation
                </Button>
              </div>
            </div>
          ) : (
            <WelcomeScreen onAddRepository={() => router.push("repo/")} />
          )}
        </div>
        <Toaster position="bottom-right" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header
        activePhase={activePhase}
        setActivePhase={setActivePhase}
        onOpenSettings={() => openPanel("settings")}
        onOpenChat={() => openPanel("chat")}
        onOpenTerminal={() => openPanel("terminal")}
        onOpenDocs={() => openPanel("docs")}
        onOpenAgents={() => openPanel("agents")}
        repositories={repositories}
        activeRepository={activeRepository}
        onSelectRepository={handleSelectRepository}
        onRemoveRepository={handleRemoveRepository}
      />

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 min-w-0 overflow-hidden">
          <BoardView
            activePhase={activePhase}
            onSelectWorkflow={setSelectedWorkflow}
            onSelectDiscoveryWorkflow={setSelectedDiscoveryWorkflow}
            onSelectPhaseWorkflow={setSelectedPhaseWorkflow}
            onSelectStory={handleSelectStory}
            highlightedWorkflowId={highlightedWorkflowId}
            highlightedStoryId={highlightedStoryId}
            onSelectStep={handleSelectStep}
            onSwitchToImplementation={() => setActivePhase("implementation")}
            onRunInTerminal={handleRunWorkflowInTerminalLegacy}
            onTerminalLaunch={handleConfirmTerminalLaunch}
            onChatLaunch={handleChatLaunch}
            defaultTerminalAgent={defaultTerminalAgent}
            persistedCommands={persistedCommands}
            onCommandEdit={handleCommandEdit}
          />
        </main>

        {renderSidebarPanels()}
      </div>

      <ActionDrawer
        workflow={selectedWorkflow}
        onClose={() => setSelectedWorkflow(null)}
        onTerminalLaunch={handleConfirmTerminalLaunch}
        onOpenChat={handleOpenChatForWorkflow}
        defaultTerminalAgent={defaultTerminalAgent}
        persistedCommands={persistedCommands}
        onCommandEdit={handleCommandEdit}
      />

      <DiscoveryActionDrawer
        workflow={selectedDiscoveryWorkflow}
        open={!!selectedDiscoveryWorkflow}
        onClose={() => setSelectedDiscoveryWorkflow(null)}
        onTerminalLaunch={handleConfirmTerminalLaunch}
        defaultTerminalAgent={defaultTerminalAgent}
        persistedCommands={persistedCommands}
        onCommandEdit={handleCommandEdit}
      />

      <PhaseActionDrawer
        workflow={selectedPhaseWorkflow}
        onClose={() => setSelectedPhaseWorkflow(null)}
        onTerminalLaunch={handleConfirmTerminalLaunch}
        onOpenChat={handleOpenChatForWorkflow}
        defaultTerminalAgent={defaultTerminalAgent}
        persistedCommands={persistedCommands}
        onCommandEdit={handleCommandEdit}
      />

      {selectedStory && selectedEpic && (
        <StoryPanel
          story={selectedStory}
          epic={selectedEpic}
          onClose={() => {
            setSelectedStory(null)
            setSelectedEpic(null)
          }}
          onStepClick={handleStoryPanelStepClick}
        />
      )}

      <WorkflowStepRunner
        step={selectedStep}
        epicId={selectedStepEpicId}
        storyId={selectedStepStoryId}
        onClose={() => {
          setSelectedStep(null)
          setSelectedStepEpicId(undefined)
          setSelectedStepStoryId(undefined)
        }}
        onTerminalLaunch={handleConfirmTerminalLaunch}
        onOpenChat={handleOpenChatForStep}
        onChatLaunch={handleChatLaunch}
        defaultTerminalAgent={defaultTerminalAgent}
        persistedCommands={persistedCommands}
        onCommandEdit={handleCommandEdit}
      />

      <Toaster position="bottom-right" />
    </div>
  )
}
