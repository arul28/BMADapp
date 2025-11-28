# Architecture – BMAD Mission Control

## System Overview
- **Core (BMAD Method):** CLI/orchestrator with YAML workflows and agent definitions in `src/modules/bmm`. Provides workflow execution (document-project, workflow-status, etc.), agent roles (pm, analyst, architect, ux-designer, tea, sm), and method docs/test architecture. CLI entrypoints live under `tools/cli`.
- **Mission Control UI:** Next.js 16 app (`apps/v0`) that surfaces workflow tracking, actions, chat, terminal, and docs. Intended to be wrapped in Electron for desktop parity and adapted for VS Code with Copilot-backed chat (no embedded terminal/BYOK there).

## Responsibilities and Boundaries
- **core**
  - Orchestrates workflows/agents; maintains method assets and test-architecture knowledge.
  - Exposes commands/agents consumed by UI (e.g., workflow-status, document-project).
- **mission-control-ui**
  - Presents board/status, workflow runners, chat/terminal launchers, repo selection, docs surface.
  - Reads/writes repo-scoped BMAD artifacts (e.g., `devDocs/bmm-workflow-status.yaml`).

## Data & State Flows
- **Repository registry:** `apps/v0/lib/repository-store.ts` stores known repos, active repo, and BMAD install/initialization flags.
- **Workflow state:** UI reads generated YAML (e.g., `devDocs/bmm-workflow-status.yaml`) to render progress and guide next actions.
- **Chat/Terminal:** `chat-manager`/`terminal-manager` components manage threads/sessions; UI allows BYOK and inline command copy/paste; Copilot-backed chat planned for VS Code.

## UI Composition (apps/v0)
- **Layout:** `app/layout.tsx` sets dark theme, metadata, global styles.
- **Entry:** `app/page.tsx` wires repository selection, phases/boards, drawers, chat/terminal managers, workflow runner, docs manager, agents panel.
- **BMAD feature components (examples):**
  - Workspace: `board-view`, `workflow-card`, `workflow-step-runner`, `phase-action-drawer`, `discovery-action-drawer`, `phase-workflow-card`, `epic-card`, `story-panel`, `sprint-planning-card`, `sprint-retro-card`.
  - Communication/assist: `chat-manager`, `chat-panel`, `chat-launch-inline`, `terminal-manager`, `terminal-launch-dialog`, `copy-commands-inline`.
  - Repo & status: `repository-picker`, `agents-panel`, `docs-manager`, `init-required-screen`, `welcome-screen`.
- **Primitives:** Extensive Radix-derived UI kit under `components/ui/*` (dialogs, forms, navigation, tables, toasts, sheets, sliders, charts, etc.).

## Integration Notes
- **Electron:** Wrap Next.js output; map `terminal-manager` to embedded terminal; keep BYOK chat. Ensure filesystem access for BMAD repo paths and status files.
- **VS Code Extension:** Reuse UI components; drop embedded terminal/BYOK; integrate Copilot-backed chat and command copy/paste; surface workflow status from repo `devDocs` files.

## Extensibility
- Workflows/agents/data live in `src/modules/bmm` and can be updated independently of the UI shell; keep UI decoupled via file- and command-based interfaces.
