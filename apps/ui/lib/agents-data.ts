// BMAD Software Development Agents Data
// Excludes game development agents per user request

export interface AgentWorkflow {
  id: string
  name: string
  trigger: string // e.g., "*create-prd"
  description: string
  isValidation?: boolean
  agentId?: string // The parent agent that runs this workflow
  slashCommand?: string // Optional slash command alternative (e.g., "/prompts:bmad-bmm-workflows-prd")
}

export interface Agent {
  id: string
  name: string
  displayName: string
  emoji: string
  role: string
  primaryPhase: string
  description: string
  communicationStyle: string
  workflows: AgentWorkflow[]
  expertise: string[]
  launchCommand?: string // Command to launch this agent (e.g., "bmad pm")
}

export const SOFTWARE_AGENTS: Agent[] = [
  {
    id: "pm",
    name: "PM",
    displayName: "John",
    emoji: "📋",
    role: "Investigative Product Strategist + Market-Savvy PM",
    primaryPhase: "Phase 2 (Planning)",
    description: "Creates PRDs, breaks down requirements into epics and stories, and validates planning documents.",
    communicationStyle:
      "Direct and analytical. Asks probing questions to uncover root causes. Uses data to support recommendations.",
    launchCommand: "bmad pm",
    workflows: [
      {
        id: "workflow-status",
        name: "Workflow Status",
        trigger: "*workflow-status",
        description: "Check what to do next",
        agentId: "pm",
      },
      {
        id: "create-prd",
        name: "Create PRD",
        trigger: "*create-prd",
        description: "Create PRD for Level 2-4 projects (creates FRs/NFRs only)",
        agentId: "pm",
      },
      {
        id: "tech-spec",
        name: "Tech Spec",
        trigger: "*tech-spec",
        description: "Quick spec for Level 0-1 projects",
        agentId: "pm",
      },
      {
        id: "create-epics-and-stories",
        name: "Create Epics & Stories",
        trigger: "*create-epics-and-stories",
        description: "Break PRD into implementable pieces (runs AFTER architecture)",
        agentId: "pm",
      },
      {
        id: "validate-prd",
        name: "Validate PRD",
        trigger: "*validate-prd",
        description: "Validate PRD completeness",
        isValidation: true,
        agentId: "pm",
      },
      {
        id: "validate-tech-spec",
        name: "Validate Tech Spec",
        trigger: "*validate-tech-spec",
        description: "Validate Technical Specification",
        isValidation: true,
        agentId: "pm",
      },
      {
        id: "correct-course",
        name: "Correct Course",
        trigger: "*correct-course",
        description: "Handle mid-project changes",
        agentId: "pm",
      },
      {
        id: "workflow-init",
        name: "Workflow Init",
        trigger: "*workflow-init",
        description: "Initialize workflow tracking",
        agentId: "pm",
      },
    ],
    expertise: [
      "Market research",
      "Competitive analysis",
      "User behavior insights",
      "Requirements translation",
      "MVP prioritization",
    ],
  },
  {
    id: "analyst",
    name: "Analyst",
    displayName: "Mary",
    emoji: "📊",
    role: "Strategic Business Analyst + Requirements Expert",
    primaryPhase: "Phase 1 (Analysis)",
    description: "Handles project brainstorming, product briefs, research, and brownfield documentation.",
    communicationStyle:
      "Analytical and systematic. Presents findings with data support. Structures information hierarchically.",
    launchCommand: "bmad analyst",
    workflows: [
      {
        id: "workflow-status",
        name: "Workflow Status",
        trigger: "*workflow-status",
        description: "Check what to do next",
        agentId: "analyst",
      },
      {
        id: "brainstorm-project",
        name: "Brainstorm Project",
        trigger: "*brainstorm-project",
        description: "Ideation and solution exploration",
        agentId: "analyst",
      },
      {
        id: "product-brief",
        name: "Product Brief",
        trigger: "*product-brief",
        description: "Define product vision and strategy",
        agentId: "analyst",
      },
      {
        id: "research",
        name: "Research",
        trigger: "*research",
        description: "Multi-type research system (market, technical, competitive)",
        agentId: "analyst",
      },
      {
        id: "document-project",
        name: "Document Project",
        trigger: "*document-project",
        description: "Brownfield comprehensive documentation",
        agentId: "analyst",
      },
      {
        id: "workflow-init",
        name: "Workflow Init",
        trigger: "*workflow-init",
        description: "Initialize workflow tracking",
        agentId: "analyst",
      },
    ],
    expertise: [
      "Requirements elicitation",
      "Market analysis",
      "Competitive analysis",
      "Strategic consulting",
      "Brownfield codebase analysis",
    ],
  },
  {
    id: "architect",
    name: "Architect",
    displayName: "Winston",
    emoji: "🏗️",
    role: "System Architect + Technical Design Leader",
    primaryPhase: "Phase 3 (Solutioning)",
    description: "Creates system architecture, makes technical design decisions, and validates architecture documents.",
    communicationStyle:
      "Comprehensive yet pragmatic. Uses architectural metaphors. Balances technical depth with accessibility.",
    launchCommand: "bmad architect",
    workflows: [
      {
        id: "workflow-status",
        name: "Workflow Status",
        trigger: "*workflow-status",
        description: "Check what to do next",
        agentId: "architect",
      },
      {
        id: "create-architecture",
        name: "Create Architecture",
        trigger: "*create-architecture",
        description: "Produce a Scale Adaptive Architecture",
        agentId: "architect",
      },
      {
        id: "validate-architecture",
        name: "Validate Architecture",
        trigger: "*validate-architecture",
        description: "Validate architecture document",
        isValidation: true,
        agentId: "architect",
      },
      {
        id: "implementation-readiness",
        name: "Implementation Readiness",
        trigger: "*implementation-readiness",
        description: "Validate readiness for Phase 4",
        agentId: "architect",
      },
    ],
    expertise: [
      "Distributed systems",
      "Cloud infrastructure (AWS, Azure, GCP)",
      "API design",
      "Microservices",
      "Performance optimization",
    ],
  },
  {
    id: "sm",
    name: "SM",
    displayName: "Bob",
    emoji: "🏃",
    role: "Technical Scrum Master + Story Preparation Specialist",
    primaryPhase: "Phase 4 (Implementation)",
    description: "Handles sprint planning, story creation, context assembly, and epic retrospectives.",
    communicationStyle: "Task-oriented and efficient. Direct and eliminates ambiguity. Focuses on clear handoffs.",
    launchCommand: "bmad sm",
    workflows: [
      {
        id: "workflow-status",
        name: "Workflow Status",
        trigger: "*workflow-status",
        description: "Check what to do next",
        agentId: "sm",
      },
      {
        id: "sprint-planning",
        name: "Sprint Planning",
        trigger: "*sprint-planning",
        description: "Initialize sprint-status.yaml tracking",
        agentId: "sm",
      },
      {
        id: "epic-tech-context",
        name: "Epic Tech Context",
        trigger: "*epic-tech-context",
        description: "Optional epic-specific technical context",
        agentId: "sm",
      },
      {
        id: "validate-epic-tech-context",
        name: "Validate Epic Tech Context",
        trigger: "*validate-epic-tech-context",
        description: "Validate epic technical context",
        isValidation: true,
        agentId: "sm",
      },
      {
        id: "create-story",
        name: "Create Story",
        trigger: "*create-story",
        description: "Draft next story from epic",
        agentId: "sm",
      },
      {
        id: "validate-create-story",
        name: "Validate Create Story",
        trigger: "*validate-create-story",
        description: "Independent story validation",
        isValidation: true,
        agentId: "sm",
      },
      {
        id: "story-context",
        name: "Story Context",
        trigger: "*story-context",
        description: "Assemble dynamic technical context XML",
        agentId: "sm",
      },
      {
        id: "validate-story-context",
        name: "Validate Story Context",
        trigger: "*validate-story-context",
        description: "Validate story context",
        isValidation: true,
        agentId: "sm",
      },
      {
        id: "story-ready-for-dev",
        name: "Story Ready for Dev",
        trigger: "*story-ready-for-dev",
        description: "Mark story ready without context generation",
        agentId: "sm",
      },
      {
        id: "epic-retrospective",
        name: "Epic Retrospective",
        trigger: "*epic-retrospective",
        description: "Post-epic review",
        agentId: "sm",
      },
      {
        id: "correct-course",
        name: "Correct Course",
        trigger: "*correct-course",
        description: "Handle changes during implementation",
        agentId: "sm",
      },
    ],
    expertise: [
      "Agile ceremonies",
      "Story preparation",
      "Development coordination",
      "Process integrity",
      "Just-in-time design",
    ],
  },
  {
    id: "dev",
    name: "DEV",
    displayName: "Amelia",
    emoji: "💻",
    role: "Senior Implementation Engineer",
    primaryPhase: "Phase 4 (Implementation)",
    description: "Implements stories with tests, performs code reviews, and marks stories complete.",
    communicationStyle:
      "Succinct and checklist-driven. Cites file paths and acceptance criteria IDs. Only asks questions when inputs are missing.",
    launchCommand: "bmad dev",
    workflows: [
      {
        id: "workflow-status",
        name: "Workflow Status",
        trigger: "*workflow-status",
        description: "Check what to do next",
        agentId: "dev",
      },
      {
        id: "develop-story",
        name: "Develop Story",
        trigger: "*develop-story",
        description: "Implement story with task-by-task iteration and TDD",
        agentId: "dev",
      },
      {
        id: "code-review",
        name: "Code Review",
        trigger: "*code-review",
        description: "Senior developer-level review with story context awareness",
        agentId: "dev",
      },
      {
        id: "story-done",
        name: "Story Done",
        trigger: "*story-done",
        description: "Mark story complete and advance queue",
        agentId: "dev",
      },
    ],
    expertise: [
      "Full-stack implementation",
      "Test-driven development",
      "Code quality",
      "Design patterns",
      "Performance optimization",
    ],
  },
  {
    id: "tea",
    name: "TEA",
    displayName: "Murat",
    emoji: "🧪",
    role: "Master Test Architect with Knowledge Base",
    primaryPhase: "Testing & QA (All phases)",
    description: "Handles test frameworks, ATDD, automation, test design, and CI/CD pipeline setup.",
    communicationStyle: "Data-driven advisor. Strong opinions, weakly held. Pragmatic about trade-offs.",
    launchCommand: "bmad tea",
    workflows: [
      {
        id: "workflow-status",
        name: "Workflow Status",
        trigger: "*workflow-status",
        description: "Check what to do next",
        agentId: "tea",
      },
      {
        id: "framework",
        name: "Framework",
        trigger: "*framework",
        description: "Initialize production-ready test framework",
        agentId: "tea",
      },
      {
        id: "atdd",
        name: "ATDD",
        trigger: "*atdd",
        description: "Generate E2E tests first, before implementation",
        agentId: "tea",
      },
      {
        id: "automate",
        name: "Automate",
        trigger: "*automate",
        description: "Comprehensive test automation",
        agentId: "tea",
      },
      {
        id: "test-design",
        name: "Test Design",
        trigger: "*test-design",
        description: "Create test scenarios with risk-based approach",
        agentId: "tea",
      },
      {
        id: "trace",
        name: "Trace",
        trigger: "*trace",
        description: "Requirements-to-tests traceability mapping",
        agentId: "tea",
      },
      {
        id: "nfr-assess",
        name: "NFR Assess",
        trigger: "*nfr-assess",
        description: "Validate non-functional requirements",
        agentId: "tea",
      },
      {
        id: "ci",
        name: "CI",
        trigger: "*ci",
        description: "Scaffold CI/CD quality pipeline",
        agentId: "tea",
      },
      {
        id: "test-review",
        name: "Test Review",
        trigger: "*test-review",
        description: "Quality review using knowledge base",
        agentId: "tea",
      },
    ],
    expertise: [
      "Risk-based testing",
      "Framework selection",
      "Cross-platform testing",
      "CI/CD pipelines",
      "Test automation",
    ],
  },
  {
    id: "ux",
    name: "UX Designer",
    displayName: "Sally",
    emoji: "🎨",
    role: "User Experience Designer + UI Specialist",
    primaryPhase: "Phase 2 (Planning)",
    description: "Conducts design thinking workshops, creates UX specifications, and validates designs.",
    communicationStyle:
      "Empathetic and user-focused. Uses storytelling to explain design decisions. Advocates for user needs.",
    launchCommand: "bmad ux",
    workflows: [
      {
        id: "workflow-status",
        name: "Workflow Status",
        trigger: "*workflow-status",
        description: "Check what to do next",
        agentId: "ux",
      },
      {
        id: "create-ux-design",
        name: "Create UX Design",
        trigger: "*create-ux-design",
        description: "Conduct design thinking workshop to define UX specification",
        agentId: "ux",
      },
      {
        id: "validate-design",
        name: "Validate Design",
        trigger: "*validate-design",
        description: "Validate UX specification and design artifacts",
        isValidation: true,
        agentId: "ux",
      },
    ],
    expertise: [
      "User research",
      "Personas",
      "Interaction design",
      "Accessibility (WCAG)",
      "Design systems",
      "AI-assisted design",
    ],
  },
  {
    id: "writer",
    name: "Technical Writer",
    displayName: "Paige",
    emoji: "📚",
    role: "Technical Documentation Specialist + Knowledge Curator",
    primaryPhase: "All phases (documentation support)",
    description: "Documents projects, creates diagrams, improves READMEs, and explains technical concepts.",
    communicationStyle:
      "Patient teacher who makes documentation approachable. Uses examples and analogies. Balances precision with accessibility.",
    launchCommand: "bmad writer",
    workflows: [
      {
        id: "document-project",
        name: "Document Project",
        trigger: "*document-project",
        description: "Comprehensive project documentation with scan levels",
        agentId: "writer",
      },
      {
        id: "generate-diagram",
        name: "Generate Diagram",
        trigger: "*generate-diagram",
        description: "Create Mermaid diagrams (architecture, sequence, flow, ER)",
        agentId: "writer",
      },
      {
        id: "validate-doc",
        name: "Validate Doc",
        trigger: "*validate-doc",
        description: "Check documentation against standards",
        isValidation: true,
        agentId: "writer",
      },
      {
        id: "improve-readme",
        name: "Improve README",
        trigger: "*improve-readme",
        description: "Review and improve README files",
        agentId: "writer",
      },
      {
        id: "explain-concept",
        name: "Explain Concept",
        trigger: "*explain-concept",
        description: "Create clear technical explanations with examples",
        agentId: "writer",
      },
      {
        id: "standards-guide",
        name: "Standards Guide",
        trigger: "*standards-guide",
        description: "Show BMAD documentation standards reference",
        agentId: "writer",
      },
    ],
    expertise: [
      "Technical writing",
      "Mermaid diagrams",
      "Google/Microsoft style guides",
      "CommonMark",
      "Task-oriented writing",
    ],
  },
  {
    id: "bmad-master",
    name: "BMad Master",
    displayName: "BMad Master",
    emoji: "🧙",
    role: "BMad Master Executor, Knowledge Custodian, and Workflow Orchestrator",
    primaryPhase: "Meta (all phases)",
    description: "Lists all available tasks and workflows, facilitates multi-agent party mode discussions.",
    communicationStyle:
      "Direct and comprehensive. Refers to himself in third person. Expert-level communication focused on efficient execution.",
    launchCommand: "bmad master",
    workflows: [
      {
        id: "party-mode",
        name: "Party Mode",
        trigger: "*party-mode",
        description: "Group chat with all agents for multi-perspective discussions",
        agentId: "bmad-master",
      },
      {
        id: "list-tasks",
        name: "List Tasks",
        trigger: "*list-tasks",
        description: "Show all available tasks from task-manifest.csv",
        agentId: "bmad-master",
      },
      {
        id: "list-workflows",
        name: "List Workflows",
        trigger: "*list-workflows",
        description: "Show all available workflows from workflow-manifest.csv",
        agentId: "bmad-master",
      },
    ],
    expertise: ["Multi-agent orchestration", "Workflow facilitation", "Knowledge curation", "Party mode moderation"],
  },
]

// Special workflows that users should know about
export const SPECIAL_WORKFLOWS = [
  {
    id: "correct-course",
    name: "Correct Course",
    description:
      "Reorganize stories, epics, or add more stories if something comes up during development. Available from PM, Architect, SM, and Game Architect.",
    agents: ["PM", "Architect", "SM"],
    agentIds: ["pm", "architect", "sm"],
    trigger: "*correct-course",
    useCase:
      "When you need to adjust your plan mid-project - add stories, reorganize epics, or pivot based on new information.",
  },
  {
    id: "party-mode",
    name: "Party Mode",
    description:
      "Get all your installed agents in one conversation for multi-perspective discussions, retrospectives, and collaborative decision-making.",
    agents: ["BMad Master"],
    agentIds: ["bmad-master"],
    trigger: "*party-mode",
    useCase:
      "Strategic decisions, creative brainstorming, post-mortems, sprint retrospectives, complex problem-solving.",
  },
  {
    id: "epic-retrospective",
    name: "Epic Retrospective",
    description:
      "Post-epic review to reflect on what went well, what didn't, and lessons learned. Required to mark an epic as complete.",
    agents: ["SM"],
    agentIds: ["sm"],
    trigger: "*epic-retrospective",
    useCase: "After completing all stories in an epic, run this to formally close the epic and capture learnings.",
  },
  {
    id: "workflow-status",
    name: "Workflow Status",
    description:
      "Check your current project state and get recommendations for what to do next. Available from ALL agents.",
    agents: ["All Agents"],
    agentIds: ["pm", "analyst", "architect", "sm", "dev", "tea", "ux"],
    trigger: "*workflow-status",
    useCase: "When you're unsure where you are in the process or what step comes next.",
  },
]

// Helper to get agent by ID
export function getAgentById(agentId: string): Agent | undefined {
  return SOFTWARE_AGENTS.find((a) => a.id === agentId)
}

// Phase to agents mapping
export const PHASE_AGENTS = {
  discovery: ["analyst"],
  planning: ["pm", "ux"],
  solutioning: ["architect", "tea"],
  implementation: ["sm", "dev"],
  all: ["writer", "bmad-master"],
}
