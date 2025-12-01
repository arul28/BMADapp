# Epic Technical Specification: Electron MVP — Live Data, UI Tracking, Command/Prompt Copy & Edit, Auto-Update

Date: 2025-11-28
Author: Arul
Epic ID: 1
Status: Draft

---

## Overview

Electron-wrap the existing Next.js v0 Mission Control UI to render live BMAD repo data (no mocks) with a single-pane board of workflows, agents, next actions, and key docs. PRD alignment (devDocs/prd.md): Time-to-first-status <2s for ≤50 workflows (PRD lines 35-36), 100% live data replacing mocks (35-37), ≥99% success for repo select/status refresh/command copy (38), control-perception target via at-a-glance view (15-16, 39), and auto-update visibility with <1m staleness (40).

Ship the desktop MVP with multi-repo selection and recent history, actionable empty/error states, and docs surfacing, while deferring embedded terminal and BYOK chat to later epics; keeps desktop-first focus per PRD project classification (19-27).

## Objectives and Scope

In scope

- Package apps/ui Next.js bundle in an Electron shell (Node 22, contextIsolation on, preload bridge) with repo allowlisting and offline-aware behavior.
- Repo selection, validation, and persistence; multi-repo switcher with recent history and health gating.
- Workflow board rendering from devDocs/bmm-workflow-status.yaml with staleness warnings, agent roster, and next-action hints.
- Command/prompt copy and inline edit with sanitization and success feedback (<0.5s).
- Docs surfacing for PRD, architecture, epics/docScan outputs with existence checks and actionable empty states.
- Auto-update visibility (current vs available) with defer/apply flow; offline shows last-known version.
- Base offline/read-only mode gating for actions that require writes/CLI; local action logging without PII.
- Solutioning sequence now includes TEA-led Test Framework Setup (`bmad framework`) and CI/CD Pipeline Setup (`bmad ci`) between architecture validation and implementation readiness; covered under Story 1.3 acceptance (cards visible with valid status keys and persistent commands).

Out of scope

- Embedded terminal execution and run-in-app flows (Epic 3).
- BYOK chat/session flows (Epic 3); VS Code extension variant (Epic 2).
- Automation/cross-repo aggregation/analytics (Epics 5+).

## System Architecture Alignment

Reuses the shared Next.js 16 (apps/ui) bundle inside an Electron 33.x shell with contextIsolation enabled, nodeIntegration disabled, and a preload bridge for repo-scoped file reads (YAML/MD), command copy, and offline state. Aligns to the architecture guidance: Node 22 runtime per `.nvmrc`, local-only data access to devDocs artifacts (workflow status, docScan, PRD/architecture/epics), repo allowlisting via repository-store, staleness tagging on reads, and hardened IPC/CSP. AutoUpdater surfaces version/update state; no remote calls beyond explicit BYOK (deferred here). VS Code-specific constraints are excluded in this epic.

## Detailed Design

### Services and Modules

- Electron shell (apps/desktop to be added): wraps Next.js build, enforces contextIsolation on/nodeIntegration off, exposes preload bridge for repo-scoped FS reads (status/docs), command copy, offline state, and update channel surface.
- UI bundle (apps/ui): board-view/workflow-card, repository-picker, docs-manager, agents-panel, copy-commands-inline; reuses dark theme and shared primitives.
- Repository store: manages active repo, recent repos, health flags, and staleness timestamps; persists selections across sessions.
- Status ingest/render: reads devDocs/bmm-workflow-status.yaml, parses YAML, tags staleness, renders phases/workflows/cards with agent roster and next-actions.
- Docs surface: resolves PRD, architecture, epics/docScan files with existence checks; links to file paths and shows missing-state guidance.
- Update surface: reads version/current vs available from autoUpdater feed; defer/apply flow with offline fallback to last-known state.
- Action logging: local-only, bounded, PII-safe record of user actions (selections, copies, refreshes) to support reliability/debugging.

### Data Models and Contracts

- Repo context: `{ path, isValid, lastValidatedAt, recentRepos[] }`.
- Workflow status entry (from devDocs/bmm-workflow-status.yaml): `{ id, phase, status, agent, outputPath, lastUpdated, staleMs, recommendations? }`.
- Doc reference: `{ title, path, exists, lastReadAt, staleMs }`.
- Update state: `{ currentVersion, availableVersion?, lastCheckedAt, offlineLastKnown }`.
- Action log entry: `{ id, type (select|copy|refresh|updateCheck), ts, repoPath, errorCode? }`.
- Relationships: repo context gates status/doc reads and update state; each workflow status entry ties to an outputPath in the selected repo; doc references link to PRD/architecture/epic/docScan artifacts and surface staleness alongside status entries; action log entries record user actions against the active repo; update state is keyed to the app build and tagged with repo context for offline cache provenance.

### APIs and Interfaces

- Preload IPC (desktop): `bmad:read-status`, `bmad:read-doc`, `bmad:copy-command`, `bmad:is-offline`, `bmad:repo-health`, `bmad:update-state` (read-only), mirroring types in `apps/ui/lib/ipc-types.ts`.
- IPC request/response shapes (typed):
  - `bmad:read-status` req `{ repoPath }`; res `{ entries: WorkflowStatusEntry[], lastUpdated, staleMs }`; errors: `MISSING_FILE`, `PARSE_ERROR`, `PERMISSION_DENIED`.
  - `bmad:read-doc` req `{ repoPath, relativePath }`; res `{ content, exists, lastReadAt, staleMs }`; errors: `MISSING_FILE`, `PERMISSION_DENIED`.
  - `bmad:copy-command` req `{ commandText }`; res `{ copied: boolean, sanitizedText }`; errors: `INVALID_INPUT`.
  - `bmad:is-offline` req `{}`; res `{ offline: boolean, lastCheckedAt }`.
  - `bmad:repo-health` req `{ repoPath }`; res `{ isValid, issues?: string[] }`; errors: `INVALID_REPO`, `PERMISSION_DENIED`.
  - `bmad:update-state` req `{}`; res `{ currentVersion, availableVersion?, lastCheckedAt, offlineLastKnown }`.
- Renderer consumption: repository-store provides repo state; board/docs components consume typed loaders returning `content, exists, updatedAt, staleMs`.
- File inputs: devDocs/bmm-workflow-status.yaml (status), devDocs/prd.md, devDocs/architecture.md, devDocs/docScan/\*.md, devDocs/epics.md; all read locally, no remote fetch.
- Update feed: autoUpdater channel; UI surfaces state only (no silent apply), requires signature-verified packages; offline shows cached state.
- Clipboard: explicit user action triggers copy; sanitize and confirm success in <0.5s.

### Workflows and Sequencing

- Launch → repo picker (load recent repos, default to last) → validate BMAD artifacts (devDocs/bmm-workflow-status.yaml, docScan index) → show health/empty state.
- Load status/docs → compute staleness → render board with phases, workflow cards, agent roster, doc links, next actions.
- Command/prompt copy/edit inline → sanitize → copy → toast; offline still allows copy, blocks run actions (out of scope here).
- Manual refresh → reread status/docs → update staleness → log action.
- Update check → surface current vs available → allow defer/apply; offline uses last-known.
- Multi-repo switch → re-validate new repo, reset caches/staleness, persist recent list.
- Offline mode → banner + gating: block write/run actions, allow read-only cached status/docs with staleness label.

## Non-Functional Requirements

### Performance

- Status ingest/render p50 <2s (p95 <3s) for ≤50 workflows; doc existence checks non-blocking.
- Copy/clipboard confirmation <0.5s; UI remains responsive during file reads via worker/IPC.
- Update check/UI read of cached state <1s; defer heavy parsing off main thread where needed.

### Security

- Repo-allowlist on preload; reject paths outside selected repo; contextIsolation on, nodeIntegration off.
- No remote calls except update feed and optional BYOK (deferred); BYOK storage forbidden this epic.
- Redact paths/keys in UI errors; sanitize copied commands; enforce CSP and preload allowlist.

### Reliability/Availability

- Offline/read-only mode blocks terminal/chat/run actions (future) and labels stale data; manual refresh available.
- Action logging (local) for repo selections, refresh, copy, update checks; bounded retention to avoid bloat.
- Graceful empty/error states for missing devDocs; staleness badge when last-updated >5m.

### Observability

- Local logs emit structured events (level, event, repoPath, durationMs, errorCode); no PII/keys.
- Staleness metadata on status/docs; surfaced in UI with timestamps.

## Dependencies and Integrations

- Root (CLI/core): Node >=20, dependencies include js-yaml 4.1.0, yaml 2.7.0, commander 14, fs-extra 11.3.0, semver 7.6.3.
- UI (apps/ui): Next 16.0.3, React/React-DOM 19.2.0, Radix UI suite, Tailwind 4.1.9, date-fns 4.1.0, recharts 2.15.4, zod 3.25.76.
- Planned desktop shell (this epic): Electron 33.x, electron-builder 24.x, node-pty 1.0.x, xterm 5.x, electron-store 9.x; autoUpdater feed for delta updates (no manual GitHub downloads).
- Clipboard/OS: system clipboard for copy; app data storage for caches/logs; no network except update feed.
- Tooling: pnpm for apps/ui; npm for root; align to `.nvmrc` (Node 22) for UI build and Electron runtime consistency.

## Acceptance Criteria (Authoritative)

1. Repo selection and validation succeed with clear errors for missing/invalid BMAD artifacts; last-selected and recent repos persist across restarts.
2. Workflow board renders all phases/workflows from devDocs/bmm-workflow-status.yaml with agent roster, output paths, and staleness badge when >5m; load p50 <2s (p95 <3s) for ≤50 workflows.
3. Command/prompt copy+edit provides sanitized text and confirms success <0.5s; no command execution occurs in this epic.
4. Docs surface shows PRD, architecture, epics/docScan links with existence checks; missing docs show actionable remediation.
5. Offline/read-only mode blocks actions requiring writes/CLI, allows cached read with staleness label, and shows banner explaining state.
6. Auto-update surface shows current vs available version with defer/apply flow; offline shows last-known version; updates delivered via feed (no manual GitHub redownload).
7. Local action log records selections, refreshes, copy, update checks without PII/keys; bounded retention.
8. Electron shell runs Next.js bundle with contextIsolation on/nodeIntegration off; preload restricts FS to selected repo paths; CSP hardened.

## Traceability Mapping (AC → Spec → Components → Tests)

- AC1 → Objectives/Scope; Services (repository store, validation); Workflows (launch/validate). Components: repo picker, health checks. Tests: unit repository-store validation; integration E2E repo select and BMAD artifact detection.
- AC2 → Objectives/Scope; Services (status ingest/render); NFR Performance/Reliability. Components: board-view, workflow-card. Tests: integration render with ≤50 workflows under 3s p95; contract parse of bmm-workflow-status.yaml.
- AC3 → Objectives/Scope; Services (command copy); APIs; NFR Performance/Security. Components: copy-commands-inline. Tests: unit sanitizer; integration copy confirmation <0.5s.
- AC4 → Objectives/Scope; Docs surface; Services; Workflows. Components: docs-manager. Tests: integration doc existence/missing states; unit doc loader with staleness labels.
- AC5 → Objectives/Scope; NFR Reliability/Availability; Workflows (offline mode). Components: offline gating/banners. Tests: integration offline mode gating run actions; unit offline detector.
- AC6 → Objectives/Scope; System Architecture Alignment; Dependencies; Workflows (update check). Components: update surface, autoUpdater feed. Tests: integration update state rendering online/offline; unit version comparison.
- AC7 → Objectives/Scope; Services (action logging); NFR Observability/Reliability. Components: local log store. Tests: unit bounded log store; integration action log writes on select/refresh/copy/update-check.
- AC8 → System Architecture Alignment; NFR Security; APIs; Services (Electron shell/preload). Components: preload bridge, CSP. Tests: contract IPC type enforcement; unit path allowlist; security lint on preload options.

## Risks, Assumptions, Open Questions

- Risk: Update feed configuration/code-signing delay could block auto-update surface; Mitigation: prototype feed early, stub UI with last-known state until signed feed ready.
- Risk: Large devDocs/bmm-workflow-status.yaml parsing overhead; Mitigation: offload parsing to worker/IPC, paginate/virtualize board.
- Risk: Repo allowlist gaps could allow unintended FS reads; Mitigation: strict path validation in preload and shared IPC types.
- Assumption: Single active repo at a time; multi-repo interactions limited to selection history, not concurrent reads. Mitigation: enforce single-repo lock in repository-store; backlog item to evaluate concurrent read safety post-MVP.
- Question: Preferred update feed host/signing approach (S3/GitHub Releases with delta/differential updates)? Next steps: decide host and signing plan; add action to provision feed and validate autoUpdater channel before UI ships.

## Test Strategy Summary

- Unit: repository-store (selection, persistence, health flags), status/doc loaders (staleness calc, missing-file branches), command copy sanitizer.
- Contract: typed IPC surface between preload and renderer; mocks for bmad:\* channels; ensure path allowlist and error codes (MISSING_FILE, PERMISSION_DENIED, OFFLINE, PARSE_ERROR).
- Integration/UI: render board with sample status file ≤50 workflows and assert p95 render <3s; offline banner/gating; docs existence states; update surface showing current/available/offline.
- Manual/smoke: end-to-end on macOS with Electron shell—select repo, load board, copy command, view docs, view update state offline; verify no network beyond update feed.
