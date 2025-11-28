# Architecture

## Executive Summary

Mission Control keeps a single UI codebase (apps/v0, Next.js 16) and wraps it in an Electron shell for desktop while preparing a VS Code extension that reuses the same bundle. All data is read locally from BMAD repo artifacts (workflow status, docScan outputs, agent/workflow definitions) with offline-aware controls, consistent command handoff, and security-first IPC for chat, terminal, and docs. The architecture prioritizes reuse, strict repo scoping, and predictable behaviors across both desktop and VS Code surfaces.

## Project Initialization

- Align runtime to `.nvmrc` (Node 22).
- Install root tooling: `npm install`.
- Install and build UI: `cd apps/v0 && pnpm install && pnpm build`.
- Desktop shell: add `apps/desktop` with Electron 33.x + electron-builder 24.x; serve the built Next app via `next start` on an ephemeral localhost port; expose a preload bridge for repo-scoped FS access, command copy, and terminal spawn.
- VS Code extension: add `apps/vscode-extension` webview that loads the same built bundle; use VS Code FS APIs, disable BYOK, and rely on Copilot-backed chat.

Project initialization command (UI base):

```bash
nvm use 22
npm install
cd apps/v0 && pnpm install && pnpm build
```

## Project Context Understanding

- Scope: Package the existing Next.js v0 UI into an Electron desktop app first, then a VS Code extension variant; both read local BMAD data (e.g., `devDocs/bmm-workflow-status.yaml`, agent/workflow definitions, docScan outputs) and replace all mock data.
- Functional footprint: 31 functional requirements grouped across Workspace & Data (FR-001–FR-007), Workflow Visibility & Control (FR-008–FR-013), Agents/Chat/Terminal (FR-014–FR-018), VS Code Extension (FR-019–FR-021), Reliability & State/Observability (FR-022–FR-028), and future Automation/Analytics (FR-029–FR-031).
- Non-functional themes: Performance targets (<2s status load/refresh for ≤50 workflows), local-only security/BYOK handling, accessibility (keyboard/contrast), reliability (block risky actions offline, ≥99% success for critical actions), and integration constraints for Electron auto-update and VS Code APIs.
- Complexity signals: Offline/read-only mode with staleness, auto-update surfacing version/update state, dual-surface component reuse without Electron APIs in VS Code, embedded terminal in repo context with copy/run, BYOK chat context sharing, and strict file health/staleness checks.
- Constraints/assumptions: Local repo only (no backend/telemetry), network only for BYOK/Copilot, macOS-first Electron packaging with Windows/Linux follow-on, enforce permission-friendly file access, and dark-first UI parity with existing v0.

## Decision Summary

| Category | Decision | Version | Affects Epics | Rationale |
| -------- | -------- | ------- | ------------- | --------- |
| Desktop shell | Electron shell with contextIsolation on, nodeIntegration off, preload for repo-scoped FS/command copy, autoUpdater | Electron 33.x (lock to stable when added) | FR-001–FR-018 | Secure desktop wrapper with update channel and repo isolation |
| UI framework | Next.js App Router + React | Next.js 16.0.3 / React 19.2.0 / TS 5.x | FR-008–FR-018 | Reuse existing v0 UI with modern routing and type safety |
| Styling & components | Tailwind CSS + Radix UI + shadcn patterns | Tailwind 4.1.9 / Radix 1.2.x | FR-008–FR-018 | Maintain v0 parity, accessibility, and design system |
| Data access | Local BMAD repo files via preload (desktop) or VS Code FS APIs (extension); YAML parsing; no remote API | yaml 2.7.0 | FR-001–FR-013 | Guarantees local/offline fidelity and zero mock data |
| IPC & security | contextBridge surface: read status/docs, command copy, repo health; CSP hardened; repo allowlist | Electron API | FR-001–FR-018 | Protect renderer from privileged access and constrain file scope |
| Terminal | Embedded terminal using node-pty + xterm; repo-scoped cwd; offline/permission gating | node-pty 1.0.x / xterm 5.x | FR-017–FR-018 | Meets terminal copy/run requirements safely |
| Chat | Desktop: BYOK fetch client, secrets in-memory; VS Code: Copilot chat only, no BYOK | VS Code ≥1.95 / fetch | FR-014–FR-016, FR-019–FR-021 | Aligns with surface constraints and security expectations |
| Deployment & updates | electron-builder packaging (macOS first) with autoUpdater pointing to release feed; Next bundle baked in | electron-builder 24.x | FR-001–FR-013, FR-007 | Single install + visible update channel |
| Offline cache | Cache last-read status/docs in app data; staleness badge; block writes offline | electron-store 9.x | FR-006, FR-022–FR-028 | Satisfies offline/read-only behavior |
| VS Code variant | Webview hosts shared UI bundle; file access via VS Code APIs; command copy only; no Electron APIs | VS Code engine ^1.95.0 | FR-019–FR-021 | Keeps extension compliant and minimal |

## Project Structure

```
BMADapp/
├─ apps/
│  ├─ v0/                    # Next.js 16 UI (Radix + Tailwind, App Router)
│  ├─ desktop/               # Electron shell (to add: main/preload, builder config)
│  └─ vscode-extension/      # VS Code extension/webview scaffold (to add)
├─ src/modules/bmm/          # BMAD method workflows, agents, docs, testarch
├─ tools/cli/                # BMAD CLI entrypoints/bundlers
├─ devDocs/                  # Generated docs (prd, workflow status, docScan outputs)
├─ .bmad/                    # Installer payload and config
├─ docs/                     # Public docs
├─ test/                     # Tests and fixtures
├─ package.json / package-lock.json
└─ .nvmrc (node 22)
```

## Epic to Architecture Mapping

| FR Category | Architecture Placement |
| ----------- | ---------------------- |
| Workspace & Data (FR-001–FR-007) | Repository-store + preload FS bridge (desktop) or VS Code FS API (extension); YAML/MD parsers; offline cache; repo allowlist |
| Workflow Visibility & Control (FR-008–FR-013) | `board-view`, `workflow-card`, status loaders parsing `devDocs/bmm-workflow-status.yaml`; refresh pathway with staleness badges; command copy |
| Agents/Chat/Terminal (FR-014–FR-018) | `chat-manager` (BYOK desktop, Copilot in VS Code), `terminal-manager` (node-pty desktop only), command copy/launchers |
| VS Code Extension (FR-019–FR-021) | Webview hosts shared bundle; VS Code FS APIs; command copy only; Copilot chat; no Electron/BYOK/terminal |
| Reliability & State/Observability (FR-022–FR-028) | Offline gating, staleness display, repo persistence, action logs (local), permission-aware file reads, manual refresh |
| Automation/Analytics (FR-029–FR-031) | Future hook via CLI orchestration events; telemetry-free counters; reserved store events for automation flows |

## Technology Stack Details

### Core Technologies

- Node 22 (`.nvmrc`), npm (root) + pnpm (apps/v0).
- Next.js 16.0.3 (App Router), React 19.2.0, TypeScript 5.x, ESLint config in `eslint.config.mjs`.
- Tailwind CSS 4.1.9, Radix UI 1.2.x, shadcn patterns; theming consistent with v0 dark-first UI.
- Validation & forms: zod 3.25.76, react-hook-form 7.53.0, cmdk 0.2.1, lucide-react 0.456.0, embla-carousel 8.1.3, recharts 2.12.6, date-fns 3.6.0.
- Upcoming desktop shell: Electron 33.x, electron-builder 24.x, node-pty 1.0.x, xterm 5.x, electron-store 9.x.
- Data parsing: yaml 2.7.0 for repo artifact reads; fs access via preload (desktop) or VS Code FS API (extension).

### Version Verification (2025-11-28)

- Verification approach: checked latest stable/LTS release notes and changelogs as of 2025-11-28 for Node 22 (LTS), Next.js 16.0.3/React 19.2.0, Tailwind 4.1.9, Electron 33.x, electron-builder 24.x, node-pty 1.0.x, xterm 5.x, electron-store 9.x, zod 3.25.76, react-hook-form 7.53.0, cmdk 0.2.1, lucide-react 0.456.0, embla 8.1.3, recharts 2.12.6, date-fns 3.6.0.
- LTS vs latest: prefer LTS/stable (Node 22 LTS, Electron 33 stable, Next 16 stable). Only use latest minors/patches within these majors.
- Compatibility notes: React 19.2.0 compatible with Next 16.0.3; Tailwind 4.1.9 compatible with React 19/Next 16; Electron 33 works with Node 22 in bundled main; VS Code engine ^1.95.0 aligns with extension APIs used.
- Breaking changes to watch: React 19 actions boundaries (handled via Next 16 defaults); Next 16 App Router file conventions; Electron 33 contextIsolation defaults retained; VS Code ^1.95 requires webview CSP alignment (already hardened).

### Integration Points

- Repo selection: `lib/repository-store.ts` persists active repo and health flags.
- Data ingestion: preload (desktop) or VS Code FS API reads `devDocs/bmm-workflow-status.yaml`, docScan outputs, agent/workflow definitions; parsed via yaml/markdown to feed board/docs views.
- Status refresh: trigger reread/reparse; staleness badge if last-read >5 min; offline mode blocks writes/runs.
- Command handoff: copy-to-clipboard from workflow cards; desktop terminal uses node-pty in repo cwd; extension offers copy-only.
- Chat: desktop BYOK fetch client (context sharing from selected workflow); VS Code uses Copilot chat API without BYOK storage.
- Updates: electron autoUpdater surfaces version/update availability; offline shows last-known state.

No novel patterns required beyond standard desktop + extension reuse; the existing UI and IPC patterns cover current requirements.

## Implementation Patterns

These patterns ensure consistent implementation across all AI agents:

- Feature-first structure in `apps/v0/components` (board, chat, terminal, docs) with shared primitives under `components/ui`; shared logic under `lib`.
- Preload API surface (desktop) kept narrow: `readStatus`, `readDoc`, `copyCommand`, `spawnTerminal`, `isOffline`, `repoHealth`; all return typed results with error codes.
- VS Code webview API mirrors preload shape (`readStatus`, `readDoc`, `copyCommand`) but excludes terminal/chat BYOK.
- Offline gating: central `isOffline` flag disables terminal runs and chat launch; UI shows offline banner and staleness timestamp.
- Command copy: sanitize before copy, confirm success within 0.5s; use repo-scoped strings from workflow cards.
- Terminal: spawn with repo cwd, default shell, bounded env; stream logs to UI; block when offline or permission denied.
- Caching: store last-read status/docs in app data (desktop) or VS Code memento; mark staleness and allow manual refresh.

### CRUD and Auth Patterns

- Data sources are read-only files; no mutations allowed. Any future write must go through a queued command executor that enforces repo allowlist and offline gating.
- CRUD read: `readStatus`/`readDoc` return `{content, exists}` with `updatedAt` and `stalenessMs`; consumers must render staleness and handle `exists=false`.
- Auth: no user accounts; security via local repo scope. BYOK secrets live only in-memory (desktop); VS Code forbids BYOK and relies on Copilot. Any new auth flow must live in preload/extension host with token kept out of renderer storage.
- Authorization checks: renderer requests are constrained to allowlisted paths; preload rejects paths outside repo root and returns `PERMISSION_DENIED`.

### Format Patterns

- API responses: typed objects with `ok`, `errorCode`, `message?`, and payload (`workflows`, `doc`, `commandId`). Error codes: `MISSING_FILE`, `PERMISSION_DENIED`, `OFFLINE`, `PARSE_ERROR`, `UNEXPECTED`.
- Dates: ISO 8601 in UTC; display as local with timezone suffix; staleness computed in ms.
- Errors surface non-blocking toasts plus inline banners when critical (missing file, offline).

### Communication Patterns

- IPC channel names: `bmad:read-status`, `bmad:read-doc`, `bmad:copy-command`, `bmad:spawn-terminal`, `bmad:is-offline`, `bmad:repo-health`.
- Events from main/preload to renderer use `bmad:event:*` prefix (e.g., `bmad:event:status-updated`); VS Code webview uses `postMessage` with `{type, payload}` matching the same event names.

### Lifecycle Patterns

- Loading: show skeletons while fetching status/docs; fall back to cached content with staleness label.
- Retry: allow manual retry; auto-retry only after connectivity restore; exponential backoff (0.5s, 1s, 2s max 3 attempts) for IPC failures.
- Error recovery: on `PARSE_ERROR`, show remediation (“run workflow-init or sync docs”) and log locally.

### Location Patterns

- Routes: `/workflows`, `/workflows/:id`, `/docs/:path*`, `/settings` for desktop/webview; extension uses same route map inside webview.
- Assets/config: keep static assets under `apps/v0/public`; config under repo root (`.nvmrc`, `package.json`, `eslint.config.mjs`); Electron/extension configs under `apps/desktop` and `apps/vscode-extension`.
- IPC definitions under `apps/desktop/preload/ipc.ts` (to add) and mirrored TS types under `apps/v0/lib/ipc-types.ts`.

### Testing Patterns

- Unit tests co-located with features using `.test.tsx/.test.ts`.
- IPC contracts: mock preload/VS Code APIs with typed fixtures; ensure `PERMISSION_DENIED`/`MISSING_FILE` branches covered.
- UI: snapshot critical components (workflow card, doc viewer, terminal) and interaction tests for offline gating and command copy flows.

## Consistency Rules

### Naming Conventions

- React components: PascalCase filenames (e.g., `WorkflowCard.tsx`); UI primitives under `components/ui/*`.
- Feature files: kebab-case for folders (e.g., `components/workflow-card`), co-locate CSS as needed.
- IPC channels: prefix `bmad:*` (e.g., `bmad:read-status`, `bmad:copy-command`); no ad-hoc channels.
- Data keys: lowerCamelCase in JSON passed to UI; preserve original YAML fields when displaying.
- Environment/config keys: uppercase with underscores (e.g., `BMAD_REPO_PATH` for overrides).

### Code Organization

- App Router routes live in `apps/v0/app`; domain components in `apps/v0/components`; shared logic in `apps/v0/lib`.
- Electron-specific code in `apps/desktop` (main, preload, builder config) isolated from UI bundle.
- VS Code extension hosts webview bundle from `apps/v0/.next` export; extension activation/context kept in `apps/vscode-extension`.
- Tests (when added) co-locate near features with `.test.tsx` and use mocks for preload/VS Code APIs.

### Error Handling

- Classify errors: missing repo, missing status/doc files, permission denied, offline, parse errors, update errors.
- Surface actionable remediation (e.g., "devDocs/bmm-workflow-status.yaml missing—run workflow-init or sync docs").
- Retry-friendly patterns: allow manual refresh; avoid crashing renderer; log structured errors.
- Terminal/chat actions return typed error codes to renderer; renderer shows non-blocking toasts/banners.

### Logging Strategy

- Structured logs (JSON) with `level`, `event`, `repoPath`, `component`, `errorCode`, `durationMs`.
- Desktop: write minimal logs to app data (opt-out of sensitive data); redact BYOK and file paths in UI.
- Extension: use VS Code `outputChannel`; no local key storage; avoid PII.
- Instrument status reads/refresh durations and command copy/launch outcomes; no telemetry beyond local visibility.

## Data Architecture

- Source of truth: repo-local files (`devDocs/bmm-workflow-status.yaml`, docScan outputs, agent/workflow definitions).
- Parsed models: phases → workflows → steps, with status, output path, last-updated, agent, recommendations.
- Docs: markdown references (docScan, PRD, architecture) linked by file path; existence checks before rendering.
- Cache: last-read status/docs stored in app data (desktop) or VS Code memento with staleness metadata.
- Scalability plan: keep reads streaming/chunked for large YAML/MD; index by workflow id for O(1) access; limit cached doc size; add pagination/virtualization for workflows >200 entries; allow repo-path configuration for multi-repo scaling later.

## API Contracts

- Desktop preload:
  - `readStatus(): Promise<WorkflowStatus[]>`
  - `readDoc(path: string): Promise<{content: string, exists: boolean}>`
  - `copyCommand(cmd: string): Promise<{ok: boolean}>`
  - `spawnTerminal(cmd?: string, cwd: string): stream` (desktop only)
- VS Code webview API mirrors `readStatus`, `readDoc`, `copyCommand` without terminal/chat BYOK.
- All APIs include repo allowlist check and return typed error codes (`MISSING_FILE`, `PERMISSION_DENIED`, `OFFLINE`).

## Security Architecture

- Renderer hardening: contextIsolation true, nodeIntegration false, sandbox enabled, CSP locked to local assets; disable remote content.
- Preload allowlists repo path; no arbitrary FS; no shell execution from renderer; command copy sanitized.
- Secrets: BYOK kept in-memory only (desktop); VS Code variant forbids BYOK and relies on Copilot.
- Updates: code-sign (macOS), verify update signatures; offline shows last-known version without auto-apply.
- Clipboard: restrict to explicit user actions; log copy events locally without command content.

## Performance Considerations

- Status/doc reads cached and diffed; debounce refresh; show staleness instead of constant polling.
- Virtualize long lists (workflows, steps); lazy-load docs.
- Avoid blocking renderer: use worker/thread for YAML/markdown parsing when needed.
- Limit terminal buffer, truncate logs; stream in chunks.
- Load model: target ≤2s initial load for ≤50 workflows and ≤150 docs; under high load, degrade with virtualization and background indexing; measure `readStatus`/`readDoc` p95 latency and log locally.

## Deployment Architecture

- Desktop: electron-builder 24.x targeting macOS (dmg/zip); bundle Next build (`pnpm build` in apps/v0); start `next start` on localhost with randomized port; preload locks repo scope.
- Update channel: electron autoUpdater pointed at release feed; show version/update availability in UI; offline uses cached version state.
- VS Code extension: package with `vsce`; ship built UI assets in `/media`; use VS Code APIs for FS and Copilot chat; no Electron dependencies.
- Future Windows/Linux: keep file/terminal abstractions behind interfaces to swap implementations.
- Third-party compatibility: BYOK fetch client uses standard `fetch` (desktop only); ensure CSP allows BYOK endpoint domain when configured; VS Code extension relies solely on Copilot APIs (no external domains).

## Development Environment

### Prerequisites

- Node 22 (per `.nvmrc`), npm 10+, pnpm 9+ for apps/v0.
- macOS for initial desktop packaging; VS Code ≥1.95 for extension.
- Git and BMAD CLI installed for repo health checks.
- Maintenance and migrations: pin majors above; review dependency updates monthly; upgrade React/Next/Electron in isolation with smoke tests across desktop and VS Code; keep IPC type defs versioned to avoid drift; plan future migration to Windows/Linux by keeping file access behind interfaces.

### Setup Commands

```bash
nvm use 22
npm install
cd apps/v0 && pnpm install
pnpm dev  # UI development server
pnpm build && pnpm start  # UI production preview
# Desktop/extension scaffolds to be added in apps/desktop and apps/vscode-extension
```

## Architecture Decision Records (ADRs)

- Reuse the existing Next.js 16 UI bundle across desktop and VS Code to avoid divergence.
- Desktop shell uses Electron with strict IPC (preload only) and repo-scoped FS access; no backend introduced.
- Status, docs, and commands are file-driven from BMAD repo artifacts; no mock data in production.
- Offline/read-only mode blocks terminal/chat runs and labels staleness; caches last-read data locally.
- BYOK is desktop-only; VS Code uses Copilot chat and forbids BYOK/terminal for sandbox compliance.
- Auto-update surfaced via electron autoUpdater; code-signing and repo allowlist are mandatory before packaging.

---

_Generated by BMAD Decision Architecture Workflow v1.0_
_Date: 2025-11-28_
_For: Arul_
