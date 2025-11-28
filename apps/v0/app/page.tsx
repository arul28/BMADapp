"use client"

import { useState, useEffect } from "react"
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
import { WelcomeScreen } from "@/components/bmad/welcome-screen"
import { InitRequiredScreen } from "@/components/bmad/init-required-screen"
import { AgentsPanel } from "@/components/bmad/agents-panel"
import type { TerminalLaunchConfig } from "@/components/bmad/terminal-launch-dialog"
import type { SidebarPanel } from "@/components/bmad/slide-sidebar"
import {
  getRepositories,
  addRepository as addRepoToStore,
  removeRepository as removeRepoFromStore,
  getActiveRepositoryId,
  setActiveRepositoryId,
  checkBmadInstalled,
  type BmadRepository,
} from "@/lib/repository-store"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function MissionControl() {
  const [repositories, setRepositories] = useState<BmadRepository[]>([])
  const [activeRepository, setActiveRepository] = useState<BmadRepository | null>(null)
  const [addRepoDialogOpen, setAddRepoDialogOpen] = useState(false)
  const [newRepoName, setNewRepoName] = useState("")
  const [newRepoPath, setNewRepoPath] = useState("")

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

  useEffect(() => {
    const repos = getRepositories()
    setRepositories(repos)

    const activeId = getActiveRepositoryId()
    if (activeId) {
      const active = repos.find((r) => r.id === activeId)
      if (active) {
        setActiveRepository(active)
      }
    } else if (repos.length === 1) {
      setActiveRepository(repos[0])
      setActiveRepositoryId(repos[0].id)
    }
  }, [])

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

  const handleSelectRepository = (repo: BmadRepository) => {
    setActiveRepository(repo)
    setActiveRepositoryId(repo.id)
    setActivePhase("all")
    setSelectedWorkflow(null)
    setSelectedDiscoveryWorkflow(null)
    setSelectedPhaseWorkflow(null)
    setSelectedStory(null)
    setSelectedEpic(null)
    toast.success(`Switched to ${repo.name}`)
  }

  const handleAddRepository = (name: string, path: string) => {
    const { installed, initialized } = checkBmadInstalled(path)
    if (!installed) {
      toast.error("BMAD not found", {
        description: "The selected folder does not have BMAD installed.",
      })
      return
    }

    const newRepo = addRepoToStore({
      name,
      path,
      isInitialized: initialized,
      hasSprintStatus: false,
    })

    setRepositories(getRepositories())
    setActiveRepository(newRepo)
    setActiveRepositoryId(newRepo.id)
    toast.success(`Added ${name}`)
  }

  const handleRemoveRepository = (id: string) => {
    removeRepoFromStore(id)
    const repos = getRepositories()
    setRepositories(repos)

    if (activeRepository?.id === id) {
      if (repos.length > 0) {
        setActiveRepository(repos[0])
        setActiveRepositoryId(repos[0].id)
      } else {
        setActiveRepository(null)
        setActiveRepositoryId(null)
      }
    }
    toast.success("Repository removed")
  }

  const handleOpenAddRepoDialog = () => {
    setAddRepoDialogOpen(true)
  }

  const handleConfirmAddRepo = () => {
    if (!newRepoName.trim() || !newRepoPath.trim()) {
      toast.error("Please enter both name and path")
      return
    }
    handleAddRepository(newRepoName.trim(), newRepoPath.trim())
    setNewRepoName("")
    setNewRepoPath("")
    setAddRepoDialogOpen(false)
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

  const handleRunInit = () => {
    if (activeRepository) {
      const updatedRepo = { ...activeRepository, isInitialized: true }
      setActiveRepository(updatedRepo)
      const repos = repositories.map((r) => (r.id === activeRepository.id ? updatedRepo : r))
      setRepositories(repos)
      toast.success("BMAD initialized successfully")
    }
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

  if (repositories.length === 0) {
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
          onAddRepository={handleAddRepository}
          onRemoveRepository={handleRemoveRepository}
        />
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 min-w-0 overflow-hidden">
            <WelcomeScreen onAddRepository={handleOpenAddRepoDialog} />
          </div>
          {renderSidebarPanels()}
        </div>
        <Dialog open={addRepoDialogOpen} onOpenChange={setAddRepoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add BMAD Repository</DialogTitle>
              <DialogDescription>Add a folder or repository that uses the BMAD method.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="repo-name">Project Name</Label>
                <Input
                  id="repo-name"
                  placeholder="My Project"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repo-path">Folder Path</Label>
                <div className="flex gap-2">
                  <Input
                    id="repo-path"
                    placeholder="/path/to/project"
                    value={newRepoPath}
                    onChange={(e) => setNewRepoPath(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setNewRepoPath(`/Users/demo/projects/${newRepoName || "my-project"}`)}
                  >
                    Browse
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddRepoDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmAddRepo}>Add Repository</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Toaster position="bottom-right" />
      </div>
    )
  }

  if (activeRepository && !activeRepository.isInitialized) {
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
          onAddRepository={handleAddRepository}
          onRemoveRepository={handleRemoveRepository}
        />
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 min-w-0 overflow-hidden">
            <InitRequiredScreen
              repository={activeRepository}
              onRunInit={handleRunInit}
              onOpenTerminal={() => openPanel("terminal")}
            />
          </div>
          {renderSidebarPanels()}
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
        onAddRepository={handleAddRepository}
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
