// BMAD workflow phases and data types

export type Phase = "discovery" | "planning" | "solutioning" | "implementation"

export type WorkflowStatus = "pending" | "active" | "complete" | "blocked" | "review"

export type EpicStatus = "backlog" | "contexted"
export type StoryStatus = "backlog" | "drafted" | "ready-for-dev" | "in-progress" | "review" | "done"
export type RetroStatus = "optional" | "completed"

export type TechContextStatus = "not-started" | "context-done" | "validated"

export type AgentType = "analyst" | "pm" | "architect" | "sm" | "dev" | "po" | "design-architect" | "tea" // Added "tea" agent
export type StepStatus = "not-started" | "in-progress" | "review" | "done" | "skipped"

export type ResearchType = "market" | "competitive" | "user" | "technical" | "domain" | "deep-prompt"

export interface DiscoveryWorkflow {
  id: string
  workflowId: string // e.g., "brainstorm-project", "research", "product-brief"
  title: string
  description: string
  isOptional: boolean
  status: WorkflowStatus
  agent: AgentType
  // Inputs discovered from project
  inputs: {
    label: string
    path: string
    required: boolean
    exists: boolean
  }[]
  // Expected output path pattern
  outputPattern: string
  outputPath?: string // Actual output if exists
  // For research workflow
  researchType?: ResearchType
  // Command to run
  command: string
  // Instructions file
  instructionsPath?: string
}

export interface WorkflowCard {
  id: string
  title: string
  description: string
  phase: Phase
  status: WorkflowStatus
  agent: AgentType
  dependencies?: string[]
  outputs?: string[]
  estimatedTime?: string
}

export interface Epic {
  id: string
  key: string // e.g., "epic-2"
  title: string
  description: string
  status: EpicStatus
  retroStatus: RetroStatus
  techContextStatus: TechContextStatus
  stories: Story[]
  priority?: string
}

export interface Story {
  id: string
  key: string // e.g., "2-v1-define-s3-key-schema-and-ddb-model-pk-sk-gsis"
  epicId: string
  title: string
  description: string
  status: StoryStatus
  acceptanceCriteria: string[]
  tasks: StoryTask[]
  storyPoints?: number
  outputs?: StoryOutput[]
  currentStepId?: string
}

export interface StoryTask {
  id: string
  title: string
  status: "pending" | "complete"
  subtasks?: StoryTask[]
  command?: string
}

export interface StoryOutput {
  type: "markdown" | "context" | "validation"
  filename: string
  path: string
}

export interface Subtask {
  id: string
  title: string
  status: WorkflowStatus
  command?: string
}

export interface Provider {
  id: string
  name: string
  type: "openai" | "anthropic" | "ollama" | "custom"
  apiKey?: string
  baseUrl?: string
  isActive: boolean
}

export interface TerminalSession {
  id: string
  originPhase?: Phase
  originEpicId?: string
  originEpicTitle?: string
  originStoryId?: string
  originStoryTitle?: string
  originStepId?: string
  originWorkflowId?: string
  originWorkflowTitle?: string
  status: "active" | "closed"
  lastCommand?: string
  createdAt: Date
}

export interface ChatThread {
  id: string
  originPhase?: Phase
  originEpicId?: string
  originEpicTitle?: string
  originStoryId?: string
  originStoryTitle?: string
  originStepId?: string
  originWorkflowId?: string
  originWorkflowTitle?: string
  providerId?: string
  providerName?: string
  status: "active" | "archived"
  messageCount: number
  createdAt: Date
}

export interface FileChange {
  id: string
  filename: string
  path: string
  changeType: "created" | "modified"
  timestamp: Date
}

export interface DocFile {
  id: string
  filename: string
  path: string
  type:
    | "epic"
    | "sprint-status"
    | "story"
    | "prd"
    | "ux"
    | "tech-spec"
    | "template"
    | "output"
    | "config"
    | "checklist"
    | "brainstorm"
    | "research"
    | "brief"
  updatedAt: Date
  children?: DocFile[]
  epicKey?: string
  storyKey?: string
}

export interface WorkflowStep {
  id: string
  name: string
  displayName: string
  status: StepStatus
  isOptional: boolean
  agent: AgentType
  description: string
  outputs?: string[]
  command?: string
}

export const STORY_WORKFLOW_STEPS: Omit<WorkflowStep, "status">[] = [
  {
    id: "create-story",
    name: "*create-story",
    displayName: "Create Story",
    isOptional: false,
    agent: "pm",
    description: "Generate initial story markdown from epic context",
    outputs: ["story.md"],
    command: "bmad create-story --epic {epicId} --story {storyId}",
  },
  {
    id: "validate-create-story",
    name: "*validate-create-story",
    displayName: "Validate Create Story",
    isOptional: false,
    agent: "pm",
    description: "Validate story structure and completeness",
    outputs: ["validation-report.md"],
    command: "bmad validate-create-story --story {storyId}",
  },
  {
    id: "story-context",
    name: "*story-context",
    displayName: "Story Context",
    isOptional: false,
    agent: "architect",
    description: "Build .context.xml with relevant codebase context",
    outputs: [".context.xml"],
    command: "bmad story-context --story {storyId}",
  },
  {
    id: "validate-story-context",
    name: "*validate-story-context",
    displayName: "Validate Story Context",
    isOptional: false,
    agent: "architect",
    description: "Ensure context includes all dependencies",
    outputs: ["context-validation.md"],
    command: "bmad validate-story-context --story {storyId}",
  },
  {
    id: "atdd",
    name: "*atdd",
    displayName: "ATDD",
    isOptional: false,
    agent: "dev",
    description: "Define acceptance tests before development",
    outputs: ["acceptance-tests.md", "test-scenarios.json"],
    command: "bmad atdd --story {storyId}",
  },
  {
    id: "develop-story",
    name: "*develop-story",
    displayName: "Develop Story",
    isOptional: false,
    agent: "dev",
    description: "Implement the story with AI-assisted coding",
    outputs: ["implementation-log.md"],
    command: "bmad develop-story --story {storyId}",
  },
  {
    id: "automate",
    name: "*automate",
    displayName: "Automate",
    isOptional: true,
    agent: "dev",
    description: "Add automated tests for the implementation",
    outputs: ["test-results.json"],
    command: "bmad automate --story {storyId}",
  },
  {
    id: "code-review",
    name: "*code-review",
    displayName: "Code Review",
    isOptional: false,
    agent: "dev",
    description: "AI-assisted code review and suggestions",
    outputs: ["code-review.md"],
    command: "bmad code-review --story {storyId}",
  },
  {
    id: "test-review",
    name: "*test-review",
    displayName: "Test Review",
    isOptional: false,
    agent: "dev",
    description: "Review test coverage and quality",
    outputs: ["test-review.md"],
    command: "bmad test-review --story {storyId}",
  },
  {
    id: "trace",
    name: "*trace",
    displayName: "Trace",
    isOptional: true,
    agent: "pm",
    description: "Trace story completion to requirements",
    outputs: ["traceability-matrix.md"],
    command: "bmad trace --story {storyId}",
  },
]

export const EPIC_POST_STORY_STEPS: Omit<WorkflowStep, "status">[] = [
  {
    id: "nfr-assess",
    name: "*nfr-assess",
    displayName: "NFR Assessment",
    isOptional: false,
    agent: "architect",
    description: "Assess non-functional requirements compliance",
    outputs: ["nfr-assessment.md"],
    command: "bmad nfr-assess --epic {epicId}",
  },
  {
    id: "epic-test-review",
    name: "*test-review",
    displayName: "Test Review",
    isOptional: false,
    agent: "dev",
    description: "Comprehensive test review across all stories",
    outputs: ["epic-test-review.md"],
    command: "bmad test-review --epic {epicId}",
  },
  {
    id: "epic-trace",
    name: "*trace",
    displayName: "Trace",
    isOptional: true,
    agent: "pm",
    description: "Full traceability from epic to requirements",
    outputs: ["epic-traceability.md"],
    command: "bmad trace --epic {epicId}",
  },
  {
    id: "epic-retrospective",
    name: "*epic-retrospective",
    displayName: "Epic Retrospective",
    isOptional: false,
    agent: "sm",
    description: "Capture learnings and improvements",
    outputs: ["retrospective.md"],
    command: "bmad epic-retrospective --epic {epicId}",
  },
]

export function getStoryWorkflowSteps(story: Story): WorkflowStep[] {
  // Mock: derive step statuses based on story status
  const storyProgress = getStoryProgress(story)

  return STORY_WORKFLOW_STEPS.map((step, index) => {
    let status: StepStatus = "not-started"

    if (story.status === "done") {
      status = step.isOptional ? "skipped" : "done"
    } else if (story.status === "in-progress") {
      if (index < storyProgress.currentStepIndex) {
        status = "done"
      } else if (index === storyProgress.currentStepIndex) {
        status = "in-progress"
      }
    } else if (story.status === "review") {
      if (index < STORY_WORKFLOW_STEPS.length - 2) {
        status = "done"
      } else if (index === STORY_WORKFLOW_STEPS.length - 2) {
        status = "review"
      }
    }

    return { ...step, status }
  })
}

export function getEpicPostStorySteps(epic: Epic): WorkflowStep[] {
  const allStoriesDone = epic.stories.every((s) => s.status === "done")

  if (!allStoriesDone) {
    return EPIC_POST_STORY_STEPS.map((step) => ({ ...step, status: "not-started" as StepStatus }))
  }

  // Mock: if retro is completed, all steps are done
  if (epic.retroStatus === "completed") {
    return EPIC_POST_STORY_STEPS.map((step) => ({
      ...step,
      status: step.isOptional ? "skipped" : ("done" as StepStatus),
    }))
  }

  // Mock: first step in progress
  return EPIC_POST_STORY_STEPS.map((step, index) => ({
    ...step,
    status: index === 0 ? ("in-progress" as StepStatus) : ("not-started" as StepStatus),
  }))
}

function getStoryProgress(story: Story): { currentStepIndex: number; completedSteps: number } {
  if (story.status === "done") {
    return { currentStepIndex: STORY_WORKFLOW_STEPS.length, completedSteps: STORY_WORKFLOW_STEPS.length }
  }
  if (story.status === "backlog" || story.status === "drafted") {
    return { currentStepIndex: 0, completedSteps: 0 }
  }
  if (story.status === "ready-for-dev") {
    return { currentStepIndex: 2, completedSteps: 2 }
  }
  if (story.status === "in-progress") {
    // Simulate being partway through
    const taskProgress = story.tasks.filter((t) => t.status === "complete").length / Math.max(story.tasks.length, 1)
    const stepIndex = Math.floor(taskProgress * 6) + 4 // Start after context steps
    return { currentStepIndex: Math.min(stepIndex, 7), completedSteps: stepIndex }
  }
  if (story.status === "review") {
    return { currentStepIndex: 8, completedSteps: 7 }
  }
  return { currentStepIndex: 0, completedSteps: 0 }
}

export const PHASES: { id: Phase; label: string; color: string }[] = [
  { id: "discovery", label: "Discovery", color: "bg-phase-discovery" },
  { id: "planning", label: "Planning", color: "bg-phase-planning" },
  { id: "solutioning", label: "Solutioning", color: "bg-phase-solutioning" },
  { id: "implementation", label: "Implementation", color: "bg-phase-implementation" },
]

export const AGENTS: Record<AgentType, { label: string; icon: string }> = {
  analyst: { label: "Analyst", icon: "Search" },
  pm: { label: "PM", icon: "ClipboardList" },
  architect: { label: "Architect", icon: "Building" },
  sm: { label: "Scrum Master", icon: "Users" },
  dev: { label: "Developer", icon: "Code" },
  po: { label: "Product Owner", icon: "Target" },
  "design-architect": { label: "Design Architect", icon: "Palette" },
  tea: { label: "TEA", icon: "Cog" }, // Added TEA agent
}

export function getStepStatusColor(status: StepStatus): string {
  switch (status) {
    case "done":
      return "bg-status-complete text-status-complete"
    case "in-progress":
      return "bg-status-active text-status-active"
    case "review":
      return "bg-amber-500/20 text-amber-400"
    case "skipped":
      return "bg-secondary text-muted-foreground"
    case "not-started":
    default:
      return "bg-status-pending text-status-pending"
  }
}

export function getStatusColor(status: StoryStatus | EpicStatus | RetroStatus | WorkflowStatus): string {
  switch (status) {
    case "done":
    case "complete":
    case "completed":
    case "contexted":
      return "bg-status-complete text-status-complete"
    case "in-progress":
    case "active":
    case "ready-for-dev":
      return "bg-status-active text-status-active"
    case "review":
      return "bg-amber-500/20 text-amber-400"
    case "blocked":
      return "bg-status-blocked text-status-blocked"
    case "backlog":
    case "drafted":
    case "pending":
    case "optional":
    default:
      return "bg-status-pending text-status-pending"
  }
}

export function getStatusLabel(status: StoryStatus | EpicStatus): string {
  switch (status) {
    case "done":
      return "Done"
    case "in-progress":
      return "In Progress"
    case "ready-for-dev":
      return "Ready for Dev"
    case "review":
      return "Review"
    case "drafted":
      return "Drafted"
    case "backlog":
      return "Backlog"
    case "contexted":
      return "Contexted"
    default:
      return status
  }
}

export interface PhaseWorkflow {
  id: string
  workflowId: string
  title: string
  description: string
  phase: Phase
  status: WorkflowStatus
  agent: AgentType
  inputs: {
    label: string
    path: string
    required: boolean
    exists: boolean
  }[]
  outputPattern: string
  outputPath?: string
  command: string
  instructionsPath?: string
  // For implementation-readiness: CTA to launch sprint-planning
  ctaAction?: string
}

export const PLANNING_WORKFLOWS: PhaseWorkflow[] = [
  {
    id: "plan-prd",
    workflowId: "prd",
    title: "PRD",
    description:
      "Intent-driven PRD creation: problem, users, value, scope, FRs/NFRs, edge cases, integration/data/risks. No time estimates.",
    phase: "planning",
    status: "complete",
    agent: "pm",
    inputs: [
      { label: "Research Content", path: "devDocs/outputs/research-*.md", required: false, exists: true },
      { label: "Brainstorming Content", path: "devDocs/outputs/*brainstorm*.md", required: false, exists: true },
      { label: "Brownfield Doc Index", path: ".bmad/project-index.md", required: false, exists: false },
    ],
    outputPattern: "{output_folder}/prd.md",
    outputPath: "devDocs/prd.md",
    command: "bmad prd",
    instructionsPath: ".bmad/core/workflows/prd/workflow.yaml",
  },
  {
    id: "plan-validate-prd",
    workflowId: "validate-prd",
    title: "Validate PRD",
    description:
      "Run checklist/validation against PRD: coverage of FR/NFR, scope boundaries, edge cases, integration/data, references.",
    phase: "planning",
    status: "complete",
    agent: "pm",
    inputs: [{ label: "PRD", path: "devDocs/prd.md", required: true, exists: true }],
    outputPattern: "{output_folder}/validation-report-*.md",
    outputPath: "devDocs/validation-report-prd.md",
    command: "bmad validate-prd",
    instructionsPath: ".bmad/core/workflows/validate-prd/workflow.yaml",
  },
  {
    id: "plan-create-design",
    workflowId: "create-design",
    title: "Create Design",
    description:
      "Produces UX design spec: Control Room Minimalism, tokens, flows, components. References brainstorming and PRD content.",
    phase: "planning",
    status: "complete",
    agent: "design-architect",
    inputs: [
      { label: "PRD", path: "devDocs/prd.md", required: true, exists: true },
      { label: "Research/Brief", path: "devDocs/outputs/research-*.md", required: false, exists: true },
      { label: "Brainstorming Content", path: "devDocs/outputs/*brainstorm*.md", required: false, exists: true },
    ],
    outputPattern: "{output_folder}/ux-decisions/ux-design-specification.md",
    outputPath: "devDocs/ux-decisions/ux-design-specification.md",
    command: "bmad create-design",
    instructionsPath: ".bmad/core/workflows/create-design/workflow.yaml",
  },
]

export const SOLUTIONING_WORKFLOWS: PhaseWorkflow[] = [
  {
    id: "sol-create-architecture",
    workflowId: "create-architecture",
    title: "Create Architecture",
    description: "System/host adapter/guardrails/provider registry, FS-as-DB design. Produces architecture doc.",
    phase: "solutioning",
    status: "complete",
    agent: "architect",
    inputs: [
      { label: "PRD", path: "devDocs/prd.md", required: true, exists: true },
      { label: "Research", path: "devDocs/outputs/research-*.md", required: false, exists: true },
      { label: "UX Spec", path: "devDocs/ux-decisions/ux-design-specification.md", required: false, exists: true },
    ],
    outputPattern: "{output_folder}/architecture.md",
    outputPath: "devDocs/architecture.md",
    command: "bmad create-architecture",
    instructionsPath: ".bmad/core/workflows/create-architecture/workflow.yaml",
  },
  {
    id: "sol-create-epics-stories",
    workflowId: "create-epics-and-stories",
    title: "Create Epics and Stories",
    description: "Create epics.md and story seeds from PRD, architecture, and UX specs.",
    phase: "solutioning",
    status: "complete",
    agent: "pm",
    inputs: [
      { label: "PRD", path: "devDocs/prd.md", required: true, exists: true },
      { label: "Architecture", path: "devDocs/architecture.md", required: true, exists: true },
      { label: "UX Spec", path: "devDocs/ux-decisions/ux-design-specification.md", required: false, exists: true },
    ],
    outputPattern: "{output_folder}/epics.md",
    outputPath: "devDocs/epics.md",
    command: "bmad create-epics-and-stories",
    instructionsPath: ".bmad/core/workflows/create-epics-stories/workflow.yaml",
  },
  {
    id: "sol-test-design",
    workflowId: "test-design",
    title: "Test Design",
    description: "Create test strategy/design artifact from PRD, architecture, and UX specs.",
    phase: "solutioning",
    status: "complete",
    agent: "dev",
    inputs: [
      { label: "PRD", path: "devDocs/prd.md", required: true, exists: true },
      { label: "Architecture", path: "devDocs/architecture.md", required: true, exists: true },
      { label: "UX Spec", path: "devDocs/ux-decisions/ux-design-specification.md", required: false, exists: true },
    ],
    outputPattern: "{output_folder}/test-design/*.md",
    outputPath: "devDocs/test-design/test-design.md",
    command: "bmad test-design",
    instructionsPath: ".bmad/core/workflows/test-design/workflow.yaml",
  },
  {
    id: "sol-validate-architecture",
    workflowId: "validate-architecture",
    title: "Validate Architecture",
    description: "Run checklist/validation against architecture document.",
    phase: "solutioning",
    status: "complete",
    agent: "architect",
    inputs: [{ label: "Architecture", path: "devDocs/architecture.md", required: true, exists: true }],
    outputPattern: "{output_folder}/validation-report-architecture.md",
    outputPath: "devDocs/validation-report-architecture.md",
    command: "bmad validate-architecture",
    instructionsPath: ".bmad/core/workflows/validate-architecture/workflow.yaml",
  },
  {
    id: "sol-framework",
    workflowId: "framework",
    title: "Test Framework Setup",
    description: "Initialize production-ready test framework with TEA agent. Sets up testing infrastructure.",
    phase: "solutioning",
    status: "pending",
    agent: "tea",
    inputs: [
      { label: "Architecture", path: "devDocs/architecture.md", required: true, exists: true },
      { label: "PRD", path: "devDocs/prd.md", required: true, exists: true },
    ],
    outputPattern: "{output_folder}/test-framework-setup.md",
    outputPath: "devDocs/test-framework-setup.md",
    command: "bmad framework",
    instructionsPath: ".bmad/core/workflows/framework/workflow.yaml",
  },
  {
    id: "sol-ci",
    workflowId: "ci",
    title: "CI/CD Pipeline Setup",
    description: "Scaffold CI/CD quality pipeline with TEA agent. Configures automated testing and deployment.",
    phase: "solutioning",
    status: "pending",
    agent: "tea",
    inputs: [
      { label: "Architecture", path: "devDocs/architecture.md", required: true, exists: true },
      { label: "Test Framework", path: "devDocs/test-framework-setup.md", required: false, exists: false },
    ],
    outputPattern: "{output_folder}/ci-cd-pipeline.md",
    outputPath: "devDocs/ci-cd-pipeline.md",
    command: "bmad ci",
    instructionsPath: ".bmad/core/workflows/ci/workflow.yaml",
  },
  {
    id: "sol-implementation-readiness",
    workflowId: "implementation-readiness",
    title: "Implementation Readiness",
    description: "Readiness report and optionally trigger sprint-planning. Offers CTA to launch sprint-planning.",
    phase: "solutioning",
    status: "complete",
    agent: "sm",
    inputs: [
      { label: "PRD", path: "devDocs/prd.md", required: true, exists: true },
      { label: "Architecture", path: "devDocs/architecture.md", required: true, exists: true },
      { label: "UX Spec", path: "devDocs/ux-decisions/ux-design-specification.md", required: false, exists: true },
      { label: "Epics", path: "devDocs/epics.md", required: true, exists: true },
    ],
    outputPattern: "{output_folder}/implementation-readiness.md",
    outputPath: "devDocs/implementation-readiness.md",
    command: "bmad implementation-readiness",
    instructionsPath: ".bmad/core/workflows/implementation-readiness/workflow.yaml",
    ctaAction: "Run Sprint Planning",
  },
]

export interface SprintPlanningWorkflow {
  id: string
  workflowId: string
  title: string
  description: string
  phase: Phase
  status: WorkflowStatus
  agent: AgentType
  inputs: {
    label: string
    path: string
    required: boolean
    exists: boolean
  }[]
  outputPattern: string
  outputPath?: string
  command: string
  isGate: boolean // Blocks epics/stories until done
}

export const SPRINT_PLANNING_WORKFLOW: SprintPlanningWorkflow = {
  id: "impl-sprint-planning",
  workflowId: "sprint-planning",
  title: "Sprint Planning",
  description:
    "Discover epics (epics.md or sharded), load ALL. Build sprint-status.yaml with development_status entries for epics, stories, and retrospectives.",
  phase: "implementation",
  status: "complete",
  agent: "sm",
  inputs: [
    { label: "Epics", path: "devDocs/epics.md", required: true, exists: true },
    { label: "Story Files", path: "devDocs/stories/**/*.md", required: false, exists: true },
  ],
  outputPattern: "sprint_artifacts/sprint-status.yaml",
  outputPath: "devDocs/sprint_artifacts/sprint-status.yaml",
  command: "bmad sprint-planning",
  isGate: true,
}

// Sample workflow data - keep for backwards compatibility but remove planning/solutioning items
export const WORKFLOW_CARDS: WorkflowCard[] = []

export const DISCOVERY_WORKFLOWS: DiscoveryWorkflow[] = [
  {
    id: "disc-init",
    workflowId: "init",
    title: "Initialize Workflow",
    description: "Initialize BMAD in your project. Creates workflow-status.yaml and sets up the project structure.",
    isOptional: false,
    status: "complete",
    agent: "orchestrator",
    inputs: [],
    outputPattern: "workflow-status.yaml",
    outputPath: "workflow-status.yaml",
    command: "bmad init",
    instructionsPath: ".bmad/core/workflows/init/workflow.yaml",
  },
  {
    id: "disc-brainstorm",
    workflowId: "brainstorm-project",
    title: "Brainstorming",
    description: "Interactive brainstorming session with AI facilitator. Uses techniques menu and checkpoint protocol.",
    isOptional: true,
    status: "complete",
    agent: "analyst",
    inputs: [
      {
        label: "Project Context",
        path: ".bmad/bmm/workflows/1-analysis/brainstorm-project/project-context.md",
        required: false,
        exists: true,
      },
    ],
    outputPattern: "{output_folder}/brainstorming-session-results-{date}.md",
    outputPath: "devDocs/outputs/brainstorming-session-results-2025-10-09.md",
    command: "bmad brainstorm-project",
    instructionsPath: ".bmad/core/workflows/brainstorming/workflow.yaml",
  },
  {
    id: "disc-research",
    workflowId: "research",
    title: "Research",
    description:
      "Deep research with anti-hallucination guards. Branches: market, competitive, user, technical, domain, or deep-prompt.",
    isOptional: true,
    status: "complete",
    agent: "analyst",
    researchType: "technical",
    inputs: [
      {
        label: "Research Type Selection",
        path: "(discovered via conversation)",
        required: true,
        exists: true,
      },
    ],
    outputPattern: "{output_folder}/research-{research_type}-{date}.md",
    outputPath: "devDocs/outputs/research-technical-2025-10-15.md",
    command: "bmad research",
    instructionsPath: ".bmad/core/workflows/research/instructions-{research_type}.md",
  },
  {
    id: "disc-product-brief",
    workflowId: "product-brief",
    title: "Product Brief",
    description: "Create comprehensive product brief. Auto-discovers inputs from research and brainstorming outputs.",
    isOptional: true,
    status: "complete",
    agent: "pm",
    inputs: [
      {
        label: "Research Content",
        path: "devDocs/outputs/research-*.md",
        required: false,
        exists: true,
      },
      {
        label: "Brainstorming Content",
        path: "devDocs/outputs/brainstorming-*.md",
        required: false,
        exists: true,
      },
      {
        label: "Brownfield Doc Index",
        path: ".bmad/project-index.md",
        required: false,
        exists: false,
      },
    ],
    outputPattern: "{output_folder}/product-brief-{project_name}-{date}.md",
    outputPath: "devDocs/outputs/product-brief-versic-2025-10-12.md",
    command: "bmad product-brief",
    instructionsPath: ".bmad/core/workflows/product-brief/workflow.yaml",
  },
]

export const VERSIC_EPICS: Epic[] = [
  {
    id: "epic-0",
    key: "epic-0",
    title: "E0. Headless Sync Agent (Interim)",
    description: "Ship end-to-end sync without Finder integration to validate storage, APIs, and lineage.",
    status: "backlog",
    retroStatus: "optional",
    techContextStatus: "not-started",
    priority: "P2",
    stories: [
      {
        id: "0-hs1",
        key: "0-hs1-local-watcher-wal-idempotent-uploads",
        epicId: "epic-0",
        title: "HS1: Local watcher + WAL/idempotent uploads",
        description: "Crash-safe WAL; retries with backoff+jitter; duplicate coalesced",
        status: "backlog",
        acceptanceCriteria: ["Crash-safe WAL", "Retries with backoff+jitter", "Duplicate coalesced"],
        tasks: [],
        outputs: [],
      },
      {
        id: "0-hs2",
        key: "0-hs2-deterministic-naming-lineage-attach",
        epicId: "epic-0",
        title: "HS2: Deterministic naming + lineage attach",
        description: "Schema validation; lineage stored with ALS hash/version",
        status: "backlog",
        acceptanceCriteria: ["Schema validation", "Lineage stored with ALS hash/version"],
        tasks: [],
        outputs: [],
      },
      {
        id: "0-hs3",
        key: "0-hs3-download-cache-open-in-daw",
        epicId: "epic-0",
        title: "HS3: Download cache + open in DAW",
        description: "Cache respects limits; open action works across common setups",
        status: "backlog",
        acceptanceCriteria: ["Cache respects limits", "Open action works across common setups"],
        tasks: [],
        outputs: [],
      },
    ],
  },
  {
    id: "epic-1",
    key: "epic-1",
    title: "E1. Desktop Sync Core (File Provider)",
    description: "macOS File Provider with lease-based conflict resolution and low-disk handling.",
    status: "backlog",
    retroStatus: "optional",
    techContextStatus: "not-started",
    priority: "P4",
    stories: [
      {
        id: "1-d1",
        key: "1-d1-implement-wal-with-idempotency-keys-and-resumable-uploads",
        epicId: "epic-1",
        title: "D1: Implement WAL with idempotency keys and resumable uploads",
        description: "WAL with crash recovery and resumable multipart uploads",
        status: "backlog",
        acceptanceCriteria: ["WAL implemented", "Crash recovery works", "Resumable uploads functional"],
        tasks: [],
        outputs: [],
      },
      {
        id: "1-d2",
        key: "1-d2-lease-heartbeat-conflict-safety-on-expiry",
        epicId: "epic-1",
        title: "D2: Lease heartbeat & conflict safety on expiry",
        description: "Lease-based locking with heartbeat and conflict resolution",
        status: "backlog",
        acceptanceCriteria: ["Lease heartbeat implemented", "Conflict safety on expiry"],
        tasks: [],
        outputs: [],
      },
      {
        id: "1-d3",
        key: "1-d3-low-disk-backpressure-ux",
        epicId: "epic-1",
        title: "D3: Low disk backpressure UX",
        description: "Handle low disk conditions with appropriate UX",
        status: "backlog",
        acceptanceCriteria: ["Low disk detection", "Backpressure UX implemented"],
        tasks: [],
        outputs: [],
      },
      {
        id: "1-pa1",
        key: "1-pa1-hydrate-on-personal-active-set",
        epicId: "epic-1",
        title: "PA1: Hydrate on personal active set",
        description: "Hydrate files based on personal active set preferences",
        status: "backlog",
        acceptanceCriteria: ["Personal active set hydration works"],
        tasks: [],
        outputs: [],
      },
    ],
  },
  {
    id: "epic-2",
    key: "epic-2",
    title: "E2. Versioning & Storage Backbone",
    description: "Immutable history and efficient lookup; cost-effective lifecycle.",
    status: "contexted",
    retroStatus: "completed",
    techContextStatus: "validated",
    priority: "P1",
    stories: [
      {
        id: "2-v1",
        key: "2-v1-define-s3-key-schema-and-ddb-model-pk-sk-gsis",
        epicId: "epic-2",
        title: "V1: Define S3 key schema and DDB model (PK/SK/GSIs)",
        description: "Keys documented; GSIs cover common queries; cost modeled",
        status: "done",
        acceptanceCriteria: ["Keys documented", "GSIs cover common queries", "Cost modeled"],
        tasks: [
          { id: "2-v1-t1", title: "Define S3 bucket key schema", status: "complete" },
          { id: "2-v1-t2", title: "Design DynamoDB table schema", status: "complete" },
          { id: "2-v1-t3", title: "Create GSI definitions", status: "complete" },
          { id: "2-v1-t4", title: "Document cost model", status: "complete" },
        ],
        outputs: [
          {
            type: "markdown",
            filename: "2-v1-define-s3-key-schema-and-ddb-model-pk-sk-gsis.md",
            path: "devDocs/docs/stories/epic-2/2-v1-define-s3-key-schema-and-ddb-model-pk-sk-gsis.md",
          },
        ],
      },
      {
        id: "2-v2",
        key: "2-v2-lineage-manifest-naming-schema-validation",
        epicId: "epic-2",
        title: "V2: Lineage manifest + naming schema validation",
        description: "Uploads validated; lineage pinned to ALS hash; errors surfaced",
        status: "done",
        acceptanceCriteria: ["Uploads validated", "Lineage pinned to ALS hash", "Errors surfaced"],
        tasks: [
          { id: "2-v2-t1", title: "Implement lineage manifest structure", status: "complete" },
          { id: "2-v2-t2", title: "Add naming schema validation", status: "complete" },
          { id: "2-v2-t3", title: "Create error surfacing UI", status: "complete" },
        ],
        outputs: [
          {
            type: "markdown",
            filename: "2-v2-lineage-manifest-naming-schema-validation.md",
            path: "devDocs/docs/stories/epic-2/2-v2-lineage-manifest-naming-schema-validation.md",
          },
        ],
      },
      {
        id: "2-v3",
        key: "2-v3-soft-delete-restore-with-trash-7-30d",
        epicId: "epic-2",
        title: "V3: Soft delete/restore with Trash (7-30d)",
        description: "Restore works; billing reflects soft-deleted state",
        status: "done",
        acceptanceCriteria: ["Restore works", "Billing reflects soft-deleted state"],
        tasks: [
          { id: "2-v3-t1", title: "Implement soft delete logic", status: "complete" },
          { id: "2-v3-t2", title: "Create trash retention policy", status: "complete" },
          { id: "2-v3-t3", title: "Add restore functionality", status: "complete" },
        ],
        outputs: [
          {
            type: "markdown",
            filename: "2-v3-soft-delete-restore-with-trash-7-30d.md",
            path: "devDocs/docs/stories/epic-2/2-v3-soft-delete-restore-with-trash-7-30d.md",
          },
        ],
      },
      {
        id: "2-v4",
        key: "2-v4-ingest-service-upload-intent-multipart-finalize-checksums-idempotency",
        epicId: "epic-2",
        title: "V4: Ingest service (upload-intent + multipart finalize)",
        description: "Presigned multipart with checksum headers; idempotent finalize via DDB conditional writes",
        status: "done",
        acceptanceCriteria: [
          "Presigned multipart with checksum headers",
          "Idempotent finalize via DDB conditional writes",
          "RFC 7807 errors on conflicts/invalid schema",
        ],
        tasks: [
          { id: "2-v4-t1", title: "Create upload intent API", status: "complete" },
          { id: "2-v4-t2", title: "Implement multipart upload", status: "complete" },
          { id: "2-v4-t3", title: "Add checksum validation", status: "complete" },
          { id: "2-v4-t4", title: "Implement idempotent finalize", status: "complete" },
        ],
        outputs: [
          {
            type: "markdown",
            filename: "2-v4-ingest-service-upload-intent-multipart-finalize-checksums-idempotency.md",
            path: "devDocs/docs/stories/epic-2/2-v4-ingest-service-upload-intent-multipart-finalize-checksums-idempotency.md",
          },
        ],
      },
      {
        id: "2-v5",
        key: "2-v5-lineage-finalization-worker-pointer-updates-domain-events",
        epicId: "epic-2",
        title: "V5: Lineage finalization worker + pointer updates",
        description: "Manifest persisted; ALS↔stem/bounce associated; events emitted",
        status: "done",
        acceptanceCriteria: [
          "Manifest persisted",
          "ALS↔stem/bounce associated",
          "projectActive/personalActive pointers updated with conditional writes",
          "Events emitted (asset.versioned, asset.bounce.created)",
        ],
        tasks: [
          { id: "2-v5-t1", title: "Create lineage finalization worker", status: "complete" },
          { id: "2-v5-t2", title: "Implement pointer updates", status: "complete" },
          { id: "2-v5-t3", title: "Add domain event emission", status: "complete" },
        ],
        outputs: [
          {
            type: "markdown",
            filename: "2-v5-lineage-finalization-worker-pointer-updates-domain-events.md",
            path: "devDocs/docs/stories/epic-2/2-v5-lineage-finalization-worker-pointer-updates-domain-events.md",
          },
        ],
      },
      {
        id: "2-v6",
        key: "2-v6-versions-lineage-apis-list-versions-fetch-manifest",
        epicId: "epic-2",
        title: "V6: Versions & lineage APIs (list versions, fetch manifest)",
        description: "GET /versions returns ordered, paginated results ≤ 500 ms p95",
        status: "done",
        acceptanceCriteria: [
          "GET /versions returns ordered, paginated results ≤ 500 ms p95",
          "GET /assets/{assetId}/lineage returns manifest with proper caching headers",
        ],
        tasks: [
          { id: "2-v6-t1", title: "Create list versions API", status: "complete" },
          { id: "2-v6-t2", title: "Create fetch manifest API", status: "complete" },
          { id: "2-v6-t3", title: "Add caching headers", status: "complete" },
        ],
        outputs: [
          {
            type: "markdown",
            filename: "2-v6-versions-lineage-apis-list-versions-fetch-manifest.md",
            path: "devDocs/docs/stories/epic-2/2-v6-versions-lineage-apis-list-versions-fetch-manifest.md",
          },
        ],
      },
      {
        id: "2-v7",
        key: "2-v7-audit-observability-hardening",
        epicId: "epic-2",
        title: "V7: Audit & observability hardening",
        description: "Audit events for intent/finalize/soft-delete/restore published with operationId",
        status: "done",
        acceptanceCriteria: [
          "Audit events for intent/finalize/soft-delete/restore published with operationId",
          "Powertools logging/tracing",
          "Metrics exported",
          "Alarms on ingest latency/failure",
        ],
        tasks: [
          { id: "2-v7-t1", title: "Add audit event publishing", status: "complete" },
          { id: "2-v7-t2", title: "Implement Powertools logging", status: "complete" },
          { id: "2-v7-t3", title: "Create metrics and alarms", status: "complete" },
        ],
        outputs: [
          {
            type: "markdown",
            filename: "2-v7-audit-observability-hardening.md",
            path: "devDocs/docs/stories/epic-2/2-v7-audit-observability-hardening.md",
          },
        ],
      },
      {
        id: "2-v8",
        key: "2-v8-storage-stack-provisioning-cdk-for-s3-ddb-iam-lifecycle",
        epicId: "epic-2",
        title: "V8: Storage stack provisioning (CDK)",
        description: "CDK defines S3 + DDB with lifecycle rules, PITR, IAM, SSM outputs",
        status: "done",
        acceptanceCriteria: [
          "CDK defines S3 + DDB with lifecycle rules (Intelligent-Tiering ≥30d, Glacier ≥365d)",
          "PITR on DDB",
          "IAM least-privilege",
          "SSM outputs for cross-stack use",
        ],
        tasks: [
          { id: "2-v8-t1", title: "Create S3 bucket with lifecycle rules", status: "complete" },
          { id: "2-v8-t2", title: "Create DynamoDB table with PITR", status: "complete" },
          { id: "2-v8-t3", title: "Configure IAM policies", status: "complete" },
          { id: "2-v8-t4", title: "Add SSM parameter outputs", status: "complete" },
        ],
        outputs: [
          {
            type: "markdown",
            filename: "2-v8-storage-stack-provisioning-cdk-for-s3-ddb-iam-lifecycle.md",
            path: "devDocs/docs/stories/epic-2/2-v8-storage-stack-provisioning-cdk-for-s3-ddb-iam-lifecycle.md",
          },
        ],
      },
    ],
  },
  {
    id: "epic-3",
    key: "epic-3",
    title: "E3. Review & Playback",
    description: "Instant private review with high-quality A/B/X.",
    status: "backlog",
    retroStatus: "optional",
    techContextStatus: "not-started",
    priority: "P2",
    stories: [
      {
        id: "3-r1",
        key: "3-r1-progressive-hls-flipover-path",
        epicId: "epic-3",
        title: "R1: Progressive HLS flipover path",
        description: "Progressive HLS playback with seamless flipover",
        status: "backlog",
        acceptanceCriteria: ["Progressive HLS playback works", "Seamless flipover path"],
        tasks: [],
        outputs: [],
      },
      {
        id: "3-r2",
        key: "3-r2-auto-align-crossfade-a-b-x",
        epicId: "epic-3",
        title: "R2: Auto-align crossfade A/B/X",
        description: "Auto-aligned crossfade for A/B/X comparison",
        status: "backlog",
        acceptanceCriteria: ["Auto-alignment works", "Crossfade functional"],
        tasks: [],
        outputs: [],
      },
      {
        id: "3-r3",
        key: "3-r3-lufs-tp-meters",
        epicId: "epic-3",
        title: "R3: LUFS/TP meters",
        description: "Integrated loudness and true peak metering",
        status: "backlog",
        acceptanceCriteria: ["LUFS meter accurate", "TP meter functional"],
        tasks: [],
        outputs: [],
      },
      {
        id: "3-r4",
        key: "3-r4-floating-media-player",
        epicId: "epic-3",
        title: "R4: Floating media player",
        description: "Floating media player with persistent playback",
        status: "backlog",
        acceptanceCriteria: ["Floating player works", "Persistent across navigation"],
        tasks: [],
        outputs: [],
      },
      {
        id: "3-r5",
        key: "3-r5-context-queue",
        epicId: "epic-3",
        title: "R5: Context queue",
        description: "Context-aware playback queue",
        status: "backlog",
        acceptanceCriteria: ["Context queue functional"],
        tasks: [],
        outputs: [],
      },
    ],
  },
  {
    id: "epic-4",
    key: "epic-4",
    title: "E4. Library Basics",
    description: "Playlists, folders, and organization for published audio.",
    status: "backlog",
    retroStatus: "optional",
    techContextStatus: "not-started",
    priority: "P3",
    stories: [],
  },
  {
    id: "epic-5",
    key: "epic-5",
    title: "E5. Checklists",
    description: "Task tracking for production workflows.",
    status: "backlog",
    retroStatus: "optional",
    techContextStatus: "not-started",
    priority: "P4",
    stories: [],
  },
  {
    id: "epic-6",
    key: "epic-6",
    title: "E6. Sharing & Auth Foundation",
    description: "Secure sharing flows with auth foundation.",
    status: "backlog",
    retroStatus: "optional",
    techContextStatus: "not-started",
    priority: "P3",
    stories: [],
  },
  {
    id: "epic-7",
    key: "epic-7",
    title: "E7. Observability & Ops",
    description: "SLO dashboards, alerts, and chaos drills.",
    status: "backlog",
    retroStatus: "optional",
    techContextStatus: "not-started",
    priority: "P2",
    stories: [],
  },
  {
    id: "epic-8",
    key: "epic-8",
    title: "E8. Security & Compliance",
    description: "CI hardening, SCA/SAST/secrets scanning, GDPR delete.",
    status: "backlog",
    retroStatus: "optional",
    techContextStatus: "not-started",
    priority: "P2",
    stories: [],
  },
  {
    id: "epic-9",
    key: "epic-9",
    title: "E9. API & Contracts",
    description: "Stable, well-documented APIs with predictable errors.",
    status: "backlog",
    retroStatus: "optional",
    techContextStatus: "not-started",
    priority: "P1",
    stories: [],
  },
  {
    id: "epic-10",
    key: "epic-10",
    title: "E10. Environments & Delivery",
    description: "Reliable delivery with fast feedback. DEV/PROD stacks; feature flags; GitHub Actions CI/CD.",
    status: "contexted",
    retroStatus: "optional",
    techContextStatus: "context-done",
    priority: "P1",
    stories: [
      {
        id: "10-dply1",
        key: "10-dply1-ci-cd-and-dev-deploy",
        epicId: "epic-10",
        title: "DPLY1: CI/CD and DEV deploy",
        description: "Lint, typecheck, unit, integration and security scans; deploy to DEV on main",
        status: "done",
        acceptanceCriteria: [
          "Lint, typecheck, unit, provisional OpenAPI contract tests",
          "LocalStack integration and security scans",
          "Deploy to DEV on main",
          "Playwright smoke for /library/playlists and /p/:playlistId",
          "Artifacts attached",
        ],
        tasks: [
          { id: "10-dply1-t1", title: "Set up GitHub Actions workflow", status: "complete" },
          { id: "10-dply1-t2", title: "Configure lint and typecheck", status: "complete" },
          { id: "10-dply1-t3", title: "Add unit tests to pipeline", status: "complete" },
          { id: "10-dply1-t4", title: "Set up DEV deployment", status: "complete" },
        ],
        outputs: [
          {
            type: "markdown",
            filename: "10-dply1-ci-cd-and-dev-deploy.md",
            path: "devDocs/docs/stories/epic-10/10-dply1-ci-cd-and-dev-deploy.md",
          },
        ],
      },
      {
        id: "10-dply2",
        key: "10-dply2-migrate-storage-iac-to-sst-ion",
        epicId: "epic-10",
        title: "DPLY2: Migrate Storage IaC to SST (Ion)",
        description: "S3 bucket versioned, SSE-S3; lifecycle rules; DynamoDB PAY_PER_REQUEST with PITR",
        status: "done",
        acceptanceCriteria: [
          "S3 bucket (versioned, SSE-S3; KMS-ready toggle)",
          "Lifecycle rules (≥30d Intelligent-Tiering, ≥365d Deep Archive in prod)",
          "DynamoDB PAY_PER_REQUEST with PITR and TTL for temp ingest rows",
          "IAM least-privilege roles/policies",
          "SSM parameters created at /versic/{env}/storage/{bucketName|tableArn|tableName}",
          "sst deploy --stage dev provisions web + storage",
          "LocalStack tests unchanged; CDK synth tests retired",
        ],
        tasks: [
          { id: "10-dply2-t1", title: "Migrate S3 to SST Ion", status: "complete" },
          { id: "10-dply2-t2", title: "Migrate DynamoDB to SST Ion", status: "complete" },
          { id: "10-dply2-t3", title: "Update IAM policies", status: "complete" },
          { id: "10-dply2-t4", title: "Verify LocalStack tests", status: "complete" },
        ],
        outputs: [
          {
            type: "markdown",
            filename: "10-dply2-migrate-storage-iac-to-sst-ion.md",
            path: "devDocs/docs/stories/epic-10/10-dply2-migrate-storage-iac-to-sst-ion.md",
          },
        ],
      },
      {
        id: "10-dply3",
        key: "10-dply3-domains-tls-web-hosting",
        epicId: "epic-10",
        title: "DPLY3: Domains/TLS & Web Hosting",
        description: "CloudFront + S3 hosting online using default CloudFront domain",
        status: "in-progress",
        acceptanceCriteria: [
          "CloudFront + S3 hosting online using default CloudFront domain",
          "Path documented for versic.app domain",
          "Reachability and TLS verified",
        ],
        tasks: [
          { id: "10-dply3-t1", title: "Set up CloudFront distribution", status: "complete" },
          { id: "10-dply3-t2", title: "Configure S3 bucket for hosting", status: "complete" },
          { id: "10-dply3-t3", title: "Document domain setup path", status: "pending" },
          { id: "10-dply3-t4", title: "Verify TLS configuration", status: "pending" },
        ],
        outputs: [
          {
            type: "markdown",
            filename: "10-dply3-domains-tls-web-hosting.md",
            path: "devDocs/docs/stories/epic-10/10-dply3-domains-tls-web-hosting.md",
          },
        ],
      },
      {
        id: "10-dply4",
        key: "10-dply4-promotion-and-rollback",
        epicId: "epic-10",
        title: "DPLY4: Promotion & Rollback",
        description: "Manual approval promotion reusing DEV artifact; automatic rollback on failure",
        status: "backlog",
        acceptanceCriteria: [
          "Manual approval promotion reusing DEV artifact",
          "Deploy to PROD",
          "Smoke/E2E green",
          "Automatic rollback to last known good on failure with artifact hash",
        ],
        tasks: [],
        outputs: [],
      },
      {
        id: "10-dply5",
        key: "10-dply5-feature-flags-and-secure-config",
        epicId: "epic-10",
        title: "DPLY5: Feature Flags & Secure Config",
        description: "Feature flags via config adapter; secrets in SSM/Secrets Manager",
        status: "backlog",
        acceptanceCriteria: [
          "NEXT_PUBLIC_AUTH and NEXT_PUBLIC_ENABLE_PUBLIC_EDITOR flags surfaced via config adapter",
          "Secrets/config in SSM/Secrets Manager",
          "No plaintext secrets in repo",
          "IAM policy lints and dependency/version pins",
          "OIDC trust policy checks in CI",
        ],
        tasks: [],
        outputs: [],
      },
    ],
  },
  {
    id: "epic-11",
    key: "epic-11",
    title: "E11. Docs & Runbooks",
    description: "Operational runbooks and documentation.",
    status: "backlog",
    retroStatus: "optional",
    techContextStatus: "not-started",
    priority: "P3",
    stories: [],
  },
  {
    id: "epic-12",
    key: "epic-12",
    title: "E12. Data Export & Portability",
    description: "Export bundles for user data portability.",
    status: "backlog",
    retroStatus: "optional",
    techContextStatus: "not-started",
    priority: "P5",
    stories: [],
  },
  {
    id: "epic-13",
    key: "epic-13",
    title: "E13. Search & Navigation",
    description: "Search overlay with keyboard navigation and quick actions.",
    status: "backlog",
    retroStatus: "optional",
    techContextStatus: "not-started",
    priority: "P4",
    stories: [],
  },
  {
    id: "epic-14",
    key: "epic-14",
    title: "E14. Settings & Preferences",
    description: "Settings tabs, usage panel, notifications, appearance, and help.",
    status: "backlog",
    retroStatus: "optional",
    techContextStatus: "not-started",
    priority: "P3",
    stories: [],
  },
]

export const VERSIC_DOCS: DocFile[] = [
  // Discovery outputs
  {
    id: "doc-brainstorm",
    filename: "brainstorming-session-results-2025-10-09.md",
    path: "devDocs/outputs/brainstorming-session-results-2025-10-09.md",
    type: "brainstorm",
    updatedAt: new Date("2025-10-09T17:12:00"),
  },
  {
    id: "doc-research-tech",
    filename: "research-technical-2025-10-15.md",
    path: "devDocs/outputs/research-technical-2025-10-15.md",
    type: "research",
    updatedAt: new Date("2025-10-15T10:00:00"),
  },
  {
    id: "doc-product-brief",
    filename: "product-brief-versic-2025-10-12.md",
    path: "devDocs/outputs/product-brief-versic-2025-10-12.md",
    type: "brief",
    updatedAt: new Date("2025-10-12T09:00:00"),
  },
  // Planning outputs
  {
    id: "doc-prd",
    filename: "prd.md",
    path: "devDocs/prd.md",
    type: "prd",
    updatedAt: new Date("2025-10-18T11:00:00"),
  },
  {
    id: "doc-validation-prd",
    filename: "validation-report-prd.md",
    path: "devDocs/validation-report-prd.md",
    type: "checklist",
    updatedAt: new Date("2025-10-18T14:00:00"),
  },
  {
    id: "doc-ux-spec",
    filename: "ux-design-specification.md",
    path: "devDocs/ux-decisions/ux-design-specification.md",
    type: "ux",
    updatedAt: new Date("2025-10-20T10:00:00"),
  },
  // Solutioning outputs
  {
    id: "doc-architecture",
    filename: "architecture.md",
    path: "devDocs/architecture.md",
    type: "tech-spec",
    updatedAt: new Date("2025-11-04T16:00:00"),
  },
  {
    id: "doc-epics",
    filename: "epics.md",
    path: "devDocs/epics.md",
    type: "epic",
    updatedAt: new Date("2025-10-25T14:00:00"),
  },
  {
    id: "doc-test-design",
    filename: "test-design.md",
    path: "devDocs/test-design/test-design.md",
    type: "tech-spec",
    updatedAt: new Date("2025-10-26T09:00:00"),
  },
  {
    id: "doc-validation-arch",
    filename: "validation-report-architecture.md",
    path: "devDocs/validation-report-architecture.md",
    type: "checklist",
    updatedAt: new Date("2025-10-27T11:00:00"),
  },
  {
    id: "doc-impl-readiness",
    filename: "implementation-readiness.md",
    path: "devDocs/implementation-readiness.md",
    type: "output",
    updatedAt: new Date("2025-10-28T14:00:00"),
  },
  // Implementation outputs
  {
    id: "doc-sprint-status",
    filename: "sprint-status.yaml",
    path: "devDocs/sprint_artifacts/sprint-status.yaml",
    type: "sprint-status",
    updatedAt: new Date("2025-11-04T20:06:00"),
  },
  // Epic 10 tech spec
  {
    id: "doc-tech-spec-epic-10",
    filename: "tech-spec-epic-10.md",
    path: "devDocs/docs/stories/epic-10/tech-spec-epic-10.md",
    type: "tech-spec",
    updatedAt: new Date("2025-11-12T10:00:00"),
  },
  // Stories folder structure - Epic 2 (completed)
  {
    id: "doc-stories-2",
    filename: "epic-2",
    path: "devDocs/docs/stories/epic-2",
    type: "story",
    updatedAt: new Date("2025-11-01T15:00:00"),
    epicKey: "epic-2",
    children: [
      {
        id: "doc-story-2-v1",
        filename: "2-v1-define-s3-key-schema-and-ddb-model-pk-sk-gsis.md",
        path: "devDocs/docs/stories/epic-2/2-v1-define-s3-key-schema-and-ddb-model-pk-sk-gsis.md",
        type: "story",
        storyKey: "2-v1-define-s3-key-schema-and-ddb-model-pk-sk-gsis",
        updatedAt: new Date("2025-10-30T10:00:00"),
      },
      {
        id: "doc-story-2-v2",
        filename: "2-v2-lineage-manifest-naming-schema-validation.md",
        path: "devDocs/docs/stories/epic-2/2-v2-lineage-manifest-naming-schema-validation.md",
        type: "story",
        storyKey: "2-v2-lineage-manifest-naming-schema-validation",
        updatedAt: new Date("2025-10-30T14:00:00"),
      },
      {
        id: "doc-story-2-v3",
        filename: "2-v3-soft-delete-restore-with-trash-7-30d.md",
        path: "devDocs/docs/stories/epic-2/2-v3-soft-delete-restore-with-trash-7-30d.md",
        type: "story",
        storyKey: "2-v3-soft-delete-restore-with-trash-7-30d",
        updatedAt: new Date("2025-10-31T09:00:00"),
      },
      {
        id: "doc-story-2-v4",
        filename: "2-v4-ingest-service-upload-intent-multipart-finalize-checksums-idempotency.md",
        path: "devDocs/docs/stories/epic-2/2-v4-ingest-service-upload-intent-multipart-finalize-checksums-idempotency.md",
        type: "story",
        storyKey: "2-v4-ingest-service-upload-intent-multipart-finalize-checksums-idempotency",
        updatedAt: new Date("2025-10-31T14:00:00"),
      },
      {
        id: "doc-story-2-v5",
        filename: "2-v5-lineage-finalization-worker-pointer-updates-domain-events.md",
        path: "devDocs/docs/stories/epic-2/2-v5-lineage-finalization-worker-pointer-updates-domain-events.md",
        type: "story",
        storyKey: "2-v5-lineage-finalization-worker-pointer-updates-domain-events",
        updatedAt: new Date("2025-11-01T09:00:00"),
      },
      {
        id: "doc-story-2-v6",
        filename: "2-v6-versions-lineage-apis-list-versions-fetch-manifest.md",
        path: "devDocs/docs/stories/epic-2/2-v6-versions-lineage-apis-list-versions-fetch-manifest.md",
        type: "story",
        storyKey: "2-v6-versions-lineage-apis-list-versions-fetch-manifest",
        updatedAt: new Date("2025-11-01T11:00:00"),
      },
      {
        id: "doc-story-2-v7",
        filename: "2-v7-audit-observability-hardening.md",
        path: "devDocs/docs/stories/epic-2/2-v7-audit-observability-hardening.md",
        type: "story",
        storyKey: "2-v7-audit-observability-hardening",
        updatedAt: new Date("2025-11-01T14:00:00"),
      },
      {
        id: "doc-story-2-v8",
        filename: "2-v8-storage-stack-provisioning-cdk-for-s3-ddb-iam-lifecycle.md",
        path: "devDocs/docs/stories/epic-2/2-v8-storage-stack-provisioning-cdk-for-s3-ddb-iam-lifecycle.md",
        type: "story",
        storyKey: "2-v8-storage-stack-provisioning-cdk-for-s3-ddb-iam-lifecycle",
        updatedAt: new Date("2025-11-01T16:00:00"),
      },
      {
        id: "doc-epic-2-retro",
        filename: "epic-2-retrospective.md",
        path: "devDocs/docs/stories/epic-2/epic-2-retrospective.md",
        type: "output",
        updatedAt: new Date("2025-11-02T10:00:00"),
      },
    ],
  },
  // Stories folder structure - Epic 10 (in progress)
  {
    id: "doc-stories-10",
    filename: "epic-10",
    path: "devDocs/docs/stories/epic-10",
    type: "story",
    updatedAt: new Date("2025-11-12T08:00:00"),
    epicKey: "epic-10",
    children: [
      {
        id: "doc-story-10-dply1",
        filename: "10-dply1-ci-cd-and-dev-deploy.md",
        path: "devDocs/docs/stories/epic-10/10-dply1-ci-cd-and-dev-deploy.md",
        type: "story",
        storyKey: "10-dply1-ci-cd-and-dev-deploy",
        updatedAt: new Date("2025-11-08T16:00:00"),
      },
      {
        id: "doc-story-10-dply2",
        filename: "10-dply2-migrate-storage-iac-to-sst-ion.md",
        path: "devDocs/docs/stories/epic-10/10-dply2-migrate-storage-iac-to-sst-ion.md",
        type: "story",
        storyKey: "10-dply2-migrate-storage-iac-to-sst-ion",
        updatedAt: new Date("2025-11-10T14:00:00"),
      },
      {
        id: "doc-story-10-dply3",
        filename: "10-dply3-domains-tls-web-hosting.md",
        path: "devDocs/docs/stories/epic-10/10-dply3-domains-tls-web-hosting.md",
        type: "story",
        storyKey: "10-dply3-domains-tls-web-hosting",
        updatedAt: new Date("2025-11-12T08:00:00"),
      },
    ],
  },
]

// Keep old exports for backwards compatibility
export const SAMPLE_EPICS = VERSIC_EPICS
export const SAMPLE_DOCS = VERSIC_DOCS
