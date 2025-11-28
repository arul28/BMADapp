# Project Overview – BMAD Mission Control

## Purpose
- Build Mission Control UI for the BMAD Method: Electron/desktop and VS Code extension experiences that mirror the Next.js app in `apps/v0`.
- Keep BMAD Method orchestration authoritative in `src/modules/bmm` (workflows, agents, docs, test architecture).

## Parts
- **core (CLI/tooling):** BMAD orchestrator, workflows, agents, docs, test architecture (`src/modules/bmm/**`, `tools/cli`, `src/modules/**`).
- **mission-control-ui (web/desktop/VS Code surfaces):** Next.js 16 app at `apps/v0` (Radix UI, Tailwind, app router); to be wrapped for Electron and adapted for VS Code UI with Copilot-backed chat.

## Tech Stack
- **Core:** Node.js/JS, CLI tooling, YAML workflows/agents, schema helpers.
- **UI:** TypeScript, React, Next.js 16 (app router), Radix UI, Tailwind, Sonner, cmdk.

## Key Directories
- `apps/v0`: Mission Control UI (Next.js) to replicate in Electron/VS Code.
- `src/modules/bmm`: BMAD workflows/agents/docs/testarch (authoritative method content).
- `docs`: Public docs (installers, IDE info, customization, upgrades).
- `tools/cli`: BMAD CLI entrypoints/bundlers.
- `devDocs`: Generated outputs (this folder).

## Existing Documentation Highlights
- Method docs: `src/modules/bmm/docs/*` (guides, references, quick start, brownfield guide, workflow references).
- Agents: `src/modules/bmm/agents/*.agent.yaml`.
- Workflows: `src/modules/bmm/workflows/**` (document-project, workflow-status, etc.).
- Test architecture KB: `src/modules/bmm/testarch/knowledge/*`.
- Public docs: `docs/*` (installers/bundlers, IDE guides, customization, upgrades).

## Getting Started
- Core: `npm install` (root) to prep CLI/tooling; scripts in `package.json`.
- UI: `cd apps/v0 && pnpm install && pnpm dev` (or `pnpm build && pnpm start`).
- Electron shell: currently placeholder at `apps/desktop`; plan to wrap `apps/v0` UI.
- VS Code extension: leverage `apps/v0` UI components; remove terminal/BYOK, use Copilot-backed chat and command copy/paste.
