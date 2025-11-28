# Development Guide – BMAD Mission Control

## Prerequisites
- Node.js 20+
- npm (root CLI/tooling) and pnpm (UI, pnpm-lock.yaml in `apps/v0`)

## Install
```
# Root (CLI/tooling)
npm install

# Mission Control UI
cd apps/v0
pnpm install
```

## Run
```
# UI dev server
cd apps/v0
pnpm dev

# UI build/start
pnpm build
pnpm start
```

## Project Structure (working set)
- CLI/tooling: `src/modules/bmm/**`, `tools/cli`, `docs`, `test`.
- UI: `apps/v0` (Next.js), with components under `components/` and data/stores under `lib/`.
- Excluded from scans: `.bmad/` (installer payload), `devDocs/` (outputs).

## Electron/VS Code Notes
- Electron: wrap the `apps/v0` UI; map `terminal-manager` to embedded terminal; keep BYOK chat.
- VS Code extension: reuse UI components, remove embedded terminal/BYOK; integrate Copilot-backed chat and command copy/paste; read BMAD status from repo `devDocs` files.

## Lint/Format (root)
```
npm run lint
npm run format:check
```
