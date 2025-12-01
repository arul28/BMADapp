# Project Documentation Index – BMAD Mission Control

## Project Overview

- **Type:** Monorepo with 2 parts (core CLI/tooling, mission-control-ui Next.js)
- **Primary Language:** Node.js/JS (core), TypeScript/React (UI)
- **Architecture:** Core BMAD orchestrator + Next.js UI (Electron/VS Code targets)

## Quick Reference

- **Core:** `src/modules/bmm/**`, `tools/cli`, `docs`, `test`
- **UI:** `apps/ui` (Next.js 16, Radix UI, Tailwind)
- **Outputs:** `devDocs/` (generated docs)
- **Installer payload (excluded from scans):** `.bmad/`

## Generated Documentation

- [Project Overview](./project-overview.md)
- [Architecture](./architecture.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Component Inventory](./component-inventory.md)
- [Development Guide](./development-guide.md)

## Existing Documentation (selected)

- Method docs: `src/modules/bmm/docs/*`, `src/modules/bmm/README.md`
- Workflows/agents: `src/modules/bmm/workflows/**`, `src/modules/bmm/agents/*.agent.yaml`
- Test architecture KB: `src/modules/bmm/testarch/knowledge/*`
- Public docs: `docs/*` (installers, IDE guides, customization, upgrades)

## Getting Started

- Run core install: `npm install`
- Run UI install: `cd apps/ui && pnpm install`
- UI dev: `pnpm dev` (in `apps/ui`)
- UI build: `pnpm build && pnpm start`
- Workflow status: see `devDocs/bmm-workflow-status.yaml` (brownfield, method track)
