// Repository management for BMAD projects
// Simulates local file system access with localStorage persistence

export interface BmadRepository {
  id: string
  name: string
  path: string
  lastOpened: Date
  isInitialized: boolean // Has workflow-status.yaml
  hasSprintStatus: boolean // Has sprint-status.yaml
}

export interface WorkflowStatusData {
  project_name: string
  discovery: {
    brainstorming: "pending" | "complete" | "skipped"
    research: "pending" | "complete" | "skipped"
    product_brief: "pending" | "complete" | "skipped"
  }
  planning: {
    prd: "pending" | "complete"
    validate_prd: "pending" | "complete"
    design: "pending" | "complete"
  }
  solutioning: {
    architecture: "pending" | "complete"
    epics_stories: "pending" | "complete"
    test_design: "pending" | "complete"
    validate_architecture: "pending" | "complete"
    implementation_readiness: "pending" | "complete"
  }
  sprint_planning: "pending" | "complete"
}

const STORAGE_KEY = "bmad-repositories"
const ACTIVE_REPO_KEY = "bmad-active-repository"

// Mock workflow status data for demo
const MOCK_WORKFLOW_STATUS: WorkflowStatusData = {
  project_name: "versic",
  discovery: {
    brainstorming: "complete",
    research: "complete",
    product_brief: "complete",
  },
  planning: {
    prd: "complete",
    validate_prd: "complete",
    design: "complete",
  },
  solutioning: {
    architecture: "complete",
    epics_stories: "complete",
    test_design: "complete",
    validate_architecture: "complete",
    implementation_readiness: "complete",
  },
  sprint_planning: "complete",
}

export function getRepositories(): BmadRepository[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []
  try {
    const repos = JSON.parse(stored)
    return repos.map((r: BmadRepository) => ({
      ...r,
      lastOpened: new Date(r.lastOpened),
    }))
  } catch {
    return []
  }
}

export function saveRepositories(repos: BmadRepository[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(repos))
}

export function addRepository(repo: Omit<BmadRepository, "id" | "lastOpened">): BmadRepository {
  const repos = getRepositories()
  const newRepo: BmadRepository = {
    ...repo,
    id: `repo-${Date.now()}`,
    lastOpened: new Date(),
  }
  repos.unshift(newRepo)
  saveRepositories(repos)
  return newRepo
}

export function removeRepository(id: string): void {
  const repos = getRepositories().filter((r) => r.id !== id)
  saveRepositories(repos)
}

export function updateRepositoryLastOpened(id: string): void {
  const repos = getRepositories()
  const repo = repos.find((r) => r.id === id)
  if (repo) {
    repo.lastOpened = new Date()
    saveRepositories(repos)
  }
}

export function getActiveRepositoryId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACTIVE_REPO_KEY)
}

export function setActiveRepositoryId(id: string | null): void {
  if (typeof window === "undefined") return
  if (id) {
    localStorage.setItem(ACTIVE_REPO_KEY, id)
    updateRepositoryLastOpened(id)
  } else {
    localStorage.removeItem(ACTIVE_REPO_KEY)
  }
}

export function getWorkflowStatus(_repoId: string): WorkflowStatusData | null {
  // In a real app, this would read from the actual workflow-status.yaml file
  // For demo purposes, return mock data
  return MOCK_WORKFLOW_STATUS
}

export function checkBmadInstalled(_path: string): { installed: boolean; initialized: boolean } {
  // In a real Electron/Tauri app, this would check for .bmad folder
  // For demo, simulate that BMAD is installed
  return { installed: true, initialized: true }
}
