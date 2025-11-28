# Source Tree Analysis – BMAD Mission Control (Deep Scan)

Repository type: Monorepo

Parts
- core: BMAD CLI/tooling, workflows, agents, schema code (`src/modules/**`, `tools/**`)
- mission-control-ui: Next.js 16 app for Mission Control UI (`apps/v0/**`)

Scope for scan
- Included: `src/modules/bmm/**` (priority), other `src/modules/**` as context, `apps/v0/**`
- Excluded: `.bmad/**` (installer artifacts), `devDocs/**` (outputs)

High-level layout
```
apps/
  v0/                 Next.js 16 app-router UI (Mission Control)
    app/              Layout/page entry
    components/       BMAD UI components (board, actions, terminal/chat managers)
    lib/              BMAD data models, repository-store helpers
    public/           Icons/assets
    styles/           Tailwind/CSS
  desktop/            (empty placeholder for Electron shell)

src/
  modules/
    bmm/              Core BMAD method assets (workflows, agents, docs, testarch)
      workflows/      YAML workflows + instructions (workflow-status, document-project, etc.)
      agents/         Agent definitions (pm, analyst, architect, ux-designer, tea, etc.)
      docs/           Method guides, references, quick start, brownfield guide
      testarch/       Test architecture knowledge base
      teams/          Default team configurations
      sub-modules/    IDE-specific injections (claude-code, etc.)
    bmb/              Additional module docs
    bmgd/             Game dev module docs
    cis/              Compliance/infra docs
  core/               Shared core code
  utility/            Utility scripts/helpers

tools/
  cli/                BMAD CLI entrypoints and bundlers
  schema/             Schema tooling
  flattener/          Bundle flattener

docs/                 Public docs (installers, IDE guides, customization, upgrades)
test/                 Tests and fixtures
devDocs/              (outputs; excluded)
.bmad/                (installer payload; excluded)
```

Notes
- Mission Control UI (`apps/v0`) mirrors planned Electron/VS Code experiences; copy UI/theming/components from here.
- BMAD method logic, workflows, and agent definitions live in `src/modules/bmm`; treat as authoritative source for orchestration.
