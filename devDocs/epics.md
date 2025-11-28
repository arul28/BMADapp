# Mission Control - Epic Breakdown

**Author:** Arul  
**Date:** 2025-11-28  
**Project Level:** MVP  
**Target Scale:** multiple people

---

## Overview

This living document decomposes the PRD into epics and stories for Mission Control. It will be updated continuously as UX and architecture context evolves.

---

## Workflow Mode

- Mode: CREATE (initial epic and story breakdown; no prior `devDocs/epics.md` found)
- Rationale: Starting fresh from PRD and architecture inputs

---

## Available Context

- PRD: devDocs/prd.md (loaded)
- Architecture: devDocs/architecture.md (loaded)
- UX: none provided (reusing existing apps/v0 UI; no UX brief file found)
- Product brief: none
- Domain brief: none

---

## Functional Requirements Inventory

- FR-001 [MVP] Users can select a local BMAD repo and set it as the active workspace; persists last-selected repo.
- FR-002 [MVP] Detect BMAD install/initialization and file health (devDocs/bmm-workflow-status.yaml, required directories); show blocking errors.
- FR-003 [MVP] Read workflow status files and render phases/workflows within 2s for repos ≤50 workflows; warn if stale (>5 min) or missing.
- FR-004 [MVP] Refresh data from disk on demand; reflect changes in <2s; no cached mock data.
- FR-005 [MVP] View generated docs (docScan outputs, architecture overview) from the repo with links to file paths.
- FR-006 [MVP] Offline/read-only mode: when offline, block write/CLI actions, allow cached viewing, and label state.
- FR-007 [MVP] Auto-update channel for the Electron shell; surface current version and update availability; allow defer/accept.
- FR-008 [MVP] Board of phases and workflows with status, agent owner, expected output path, and last-updated timestamp.
- FR-009 [MVP] Workflow card with step details, statuses, outputs, and doc links; show if data is stale.
- FR-010 [MVP] Recommended next workflows/actions based on workflow-status guidance.
- FR-011 [MVP] Copy suggested CLI commands for a workflow directly from the card; confirm copy.
- FR-012 [MVP] Launch a workflow run from the UI (desktop) with repo context; block when offline.
- FR-013 [MVP] Doc links for key outputs (docScan, architecture, epics once present) with existence check.
- FR-014 [MVP] Display agent roster and roles tied to workflows.
- FR-015 [MVP] Start BYOK chat session (desktop) with workflow context attached; redact secrets from logs; chat launch ≤1s.
- FR-016 [MVP] Share workflow context (status, outputs) into chat threads.
- FR-017 [MVP] Embedded terminal in active repo context; block when offline; show warnings on permissions issues; terminal open ≤2s.
- FR-018 [MVP] Inline command copy/paste into terminal launcher with success confirmation; copy success in <0.5s.
- FR-019 [Growth] Run UI inside VS Code with Copilot-backed chat (no BYOK), no embedded terminal.
- FR-020 [Growth] Copy commands for external terminal execution when embedded terminal is unavailable.
- FR-021 [Growth] Enforce VS Code constraints (respect VS Code workspace path, no local BYOK storage, no Electron APIs).
- FR-022 [MVP] Empty/error states when BMAD is not initialized or files are missing; include remediation steps.
- FR-023 [MVP] Persist last-selected repo and UI filters between sessions.
- FR-024 [MVP] Offline blocking for CLI actions with clear reason.
- FR-025 [MVP] Local log of recent actions available; no PII/keys stored.
- FR-026 [Growth] Offline cache of last-known status/docs for read-only viewing; show staleness.
- FR-027 [Growth] Inline notifications when BMAD files change; prompt refresh.
- FR-028 [Growth] Multi-repo switcher and recent-repo memory.
- FR-029 [Vision] Automated “apply next action” flows to run workflows from UI (guardrails, confirmations).
- FR-030 [Vision] Cross-repo Mission Control with aggregated statuses.
- FR-031 [Vision] Analytics on workflow efficiency (steps completed, blockers raised) without timing/PII; toggleable.

---

## FR Coverage Map

- To be updated after epic/story breakdown.

---

## Epics

### Epic 1: Electron MVP — Live Data, UI Tracking, Command/Prompt Copy & Edit, Auto-Update
- Goal: Ship a repo-aware desktop shell that renders live BMAD workflow/status data (no mocks), surfaces agent/board tracking, delivers command/prompt copy+edit, auto-update, and multi-repo selection with recent history. Terminal and BYOK are explicitly deferred.
- Integration note: Port the existing apps/v0 Next.js web app bundle into the Electron shell; reuse the shared bundle and avoid UI forks.
- FR coverage: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-013, FR-014, FR-022, FR-023, FR-024, FR-025, FR-028 (multi-repo switcher pulled into MVP)
- Stories:
  - Story 1.1: Repo selection, validation, and persistence (sequential anchor)
    - As a user, I want to select a BMAD repo and persist it, so the app always works in the right context.
    - Acceptance (BDD):
      - Given no repo selected, When I pick a folder, Then the app validates BMAD artifacts and saves the path.
      - Given a saved repo, When I relaunch, Then the app restores the selection and revalidates health.
      - Given the desktop shell reuses the apps/v0 Next.js bundle, When repo selection/health is wired, Then it uses shared UI logic with only Electron host adaptations (no UI forks).
    - Prerequisites: none
    - Technical notes: align with `.nvmrc` (Node 22); store in app data; guard against missing devDocs; repo allowlist.
  - Story 1.2: Multi-repo switcher with recent history (parallel-safe)
    - As a user, I want to add/select among multiple local BMAD repos, so I can switch contexts quickly.
    - Acceptance:
      - Given multiple repos, When I open the switcher, Then I see recent repos and can set one active at a time.
      - Given a new repo added, When it’s invalid, Then I see a blocking health error and it is not set active.
    - Prerequisites: Story 1.1
    - Technical notes: bounded recent list; repo allowlist; per-repo health cache; no shared mutable state beyond selection.
  - Story 1.3: Live workflow status ingest, board rendering, and agent roster (parallel-safe after 1.1)
    - As a user, I want the board to render live data from `devDocs/bmm-workflow-status.yaml` within 2s, so I see current progress.
    - Acceptance:
      - Given a healthy repo, When status exists, Then phases/workflows render with status, agent, output path, last-updated, stale badge >5m.
      - Given missing/stale file, When loading, Then I see an actionable error/staleness warning.
      - Agent roster displays role/owner per workflow.
      - Given the Electron shell reuses the apps/v0 Next.js bundle, When ingesting/rendering board data, Then shared UI components are used unchanged with Electron-specific wiring only.
    - Prerequisites: Story 1.1 (repo context); independent of Story 1.2 if using active repo abstraction.
    - Technical notes: YAML parse off main thread; staleness calc; file existence check; no mock data.
  - Story 1.4: Command and prompt copy/edit (parallel-safe after 1.1)
    - As a user, I want to copy and edit suggested commands/prompts before using them, so I can act safely from the board.
    - Acceptance:
      - Given a workflow card, When I click copy, Then the exact command copies with success toast <0.5s.
      - Given a prompt/command editor, When I edit, Then the edited text is validated (no path escapes) and copyable.
      - Given the Electron shell reuses the apps/v0 Next.js bundle, When wiring copy/edit, Then shared UI logic is reused without forking, adapting only the host integration.
    - Prerequisites: Story 1.1 (active repo for substitutions); can run parallel to 1.3.
    - Technical notes: clipboard sanitize; inline editor with guardrails; repo-scoped substitutions only.
  - Story 1.5: Docs surfacing and health checks (parallel-safe after 1.1)
    - As a user, I want links to key docs (docScan, PRD, architecture, epics), so I can open them directly.
    - Acceptance:
      - Given doc exists, When I open from UI, Then it resolves; missing docs show warnings.
    - Prerequisites: Story 1.1 (repo path)
    - Technical notes: existence checks; render paths; no mock data.
  - Story 1.6: Offline/read-only mode (base) (parallel-safe after 1.1)
    - As a user, I want clear offline behavior, so I avoid broken actions.
    - Acceptance:
      - Given offline, When viewing, Then board shows cached data + staleness; actions that need CLI/chat/terminal are blocked with reason.
    - Prerequisites: Story 1.1 (repo context); coordinates with 1.3/1.4 for gating.
    - Technical notes: central `isOffline`; banner + gating; cached reads; no writes.
  - Story 1.7: Auto-update visibility and restart/apply (parallel-safe after 1.1)
    - As a user, I want to see current version and update availability and restart/apply in-app, so I stay current without GitHub.
    - Acceptance:
      - Given updater channel, When an update exists, Then UI surfaces current vs available; offline shows last-known state.
      - Given an update, When I accept, Then app restarts/applies update from in-app flow.
    - Prerequisites: Story 1.1
    - Technical notes: autoUpdater channel; code-sign later; staleness badge; defer/apply paths; package and ship the shared apps/v0 Next.js bundle used by the desktop shell.
  - Story 1.8: Action logging (local, PII-safe) (parallel-safe after 1.1)
    - As a user, I want recent action logs, so I can see what happened.
    - Acceptance:
      - Given local actions, When I open logs, Then I see recent reads/copies without PII/keys.
    - Prerequisites: Story 1.1
    - Technical notes: structured JSON; redact paths/keys; bounded retention.

### Epic 2: VS Code Extension — Parity with Electron MVP (No Terminal/BYOK)
- Goal: Deliver the VS Code extension using the same shared apps/v0 Next.js bundle (no Electron APIs) with live data, board tracking, and command/prompt copy+edit. Terminal and BYOK remain excluded; Copilot overlay is deferred.
- FR coverage: FR-019, FR-020, FR-021 (UI in VS Code with constraints), plus reuse of FR-001–FR-013 where applicable to VS Code constraints (terminal/BYOK excluded here).
- Stories:
  - Story 2.1: VS Code webview host using shared bundle
    - As a user, I want the extension UI to load inside VS Code, so I can view status without leaving the editor.
    - Acceptance: Webview loads the same shared apps/v0 Next.js bundle used by Electron; respects workspace path; no Electron APIs.
    - Prerequisites: Epic 1 build artifacts.
    - Technical notes: package from apps/v0 build; CSP; message passing to extension host; reuse shared bundle artifacts instead of forking UI logic.
  - Story 2.2: Workspace-scoped repo selection and validation
    - As a user, I want the extension to use the VS Code workspace path, so data stays in project scope.
    - Acceptance: Workspace path default; allows override with validation; persists via memento.
    - Prerequisites: Story 2.1
    - Technical notes: VS Code FS APIs; health checks adapted.
  - Story 2.3: Status/doc reading via VS Code FS APIs
    - As a user, I want live status/docs, so I see current data without mocks.
    - Acceptance: Reads workflow status and docs; staleness and missing warnings.
    - Prerequisites: Story 2.2
    - Technical notes: `vscode.workspace.fs`; yaml parse in webview worker.
  - Story 2.4: Command and prompt copy/edit (extension)
    - As a user, I want to copy and edit suggested commands/prompts, so I can run them externally.
    - Acceptance: Copy succeeds <0.5s; edited text validated; confirms success.
    - Prerequisites: Story 2.3
    - Technical notes: clipboard API; sanitize; no repo writes.
  - Story 2.5: Offline and permissions handling in extension
    - As a user, I want clear offline/permission messaging, so I know why actions are blocked.
    - Acceptance: Offline banner; blocked actions with reason; permission errors surfaced.
    - Prerequisites: Story 2.3

### Epic 3: Electron Feature Completers — Terminal, BYOK Chat, Reliability Add-ons
- Goal: Finish desktop-specific capabilities: embedded terminal, BYOK chat, and reliability add-ons (offline cache, file-change notifications, multi-repo).
- FR coverage: FR-014, FR-015, FR-017, FR-018, FR-026, FR-027, FR-028 (and deepen FR-006/FR-025)
- Stories:
  - Story 3.1: Embedded terminal (desktop) with offline/permission guards
  - Story 3.2: BYOK chat with workflow context (desktop)
  - Story 3.3: Offline cache of status/docs with staleness indicators
  - Story 3.4: File-change notifications prompting refresh
  - Story 3.5: Multi-repo UX polish (bulk remove, validation hardening, stale-entry cleanup)
  - Story 3.6: Terminal UX refinements (buffer mgmt, permission recovery flows)
  - Story 3.7: BYOK UX polish (secret entry UX, redaction verification)

### Epic 4: Copilot-Enhanced Extension + Overlay
- Goal: Add Copilot-backed chat and a custom chat overlay in the VS Code extension while keeping constraints (no Electron/BYOK/terminal).
- FR coverage: Extends FR-019–FR-021 with Copilot overlay; leverages FR-020 for command copy; sets groundwork for FR-029/FR-031 later.
- Stories:
  - Story 4.1: Custom chat overlay UI within VS Code webview (Copilot backend)
  - Story 4.2: Context-sharing into overlay from workflow cards/status
  - Story 4.3: Inline command suggestions piped to overlay (copy-only)
  - Story 4.4: Reliability and staleness signaling within overlay

### Epic 5: Automation & Analytics (Vision)
- Goal: Prepare for automation flows and analytics once core surfaces are stable.
- FR coverage: FR-029, FR-030, FR-031
- Stories:
  - Story 5.1: Automation guardrails and confirmation flows
  - Story 5.2: Cross-repo aggregation view scaffolding
  - Story 5.3: Analytics counters (non-PII, no time estimates)

---

## FR Coverage Matrix

| FR | Epic → Story | Parallel-Safety | Notes |
| --- | --- | --- | --- |
| FR-001 (repo select) | E1 → 1.1 | Sequential anchor | Active repo context for all; must land first. |
| FR-002 (BMAD health) | E1 → 1.1 | Sequential anchor | Health gating on select; reused by others. |
| FR-003 (status load) | E1 → 1.3 | Parallel-safe after 1.1 | Board ingest/staleness. |
| FR-004 (refresh) | E1 → 1.3 | Parallel-safe after 1.1 | Manual refresh path. |
| FR-005 (docs view) | E1 → 1.5 | Parallel-safe after 1.1 | Doc links/existence checks. |
| FR-006 (offline mode) | E1 → 1.6; E3 → 3.3 | Parallel-safe after 1.1 (base); later cache | Base gating; deeper cache in E3. |
| FR-007 (auto-update) | E1 → 1.7 | Parallel-safe after 1.1 | In-app update surface/apply. |
| FR-008 (board) | E1 → 1.3 | Parallel-safe after 1.1 | Phases/workflows render. |
| FR-009 (card detail) | E1 → 1.3 | Parallel-safe after 1.1 | Card details/staleness. |
| FR-010 (next actions) | E1 → 1.3 | Parallel-safe after 1.1 | Recommendations from status. |
| FR-011 (copy command) | E1 → 1.4; E2 → 2.4 | Parallel-safe after 1.1 | Copy/edit both surfaces. |
| FR-012 (launch run) | E3 → 3.1 | Parallel-safe after 1.1; depends on terminal | Add run-in-terminal in desktop. |
| FR-013 (doc links) | E1 → 1.5 | Parallel-safe after 1.1 | Includes epics/docScan/architecture. |
| FR-014 (agent roster) | E1 → 1.3 | Parallel-safe after 1.1 | Agent mapping on board. |
| FR-015 (BYOK chat) | E3 → 3.2 | Parallel-safe after 1.1 | Desktop-only. |
| FR-016 (chat context share) | E3 → 3.2 | Parallel-safe after 1.1 | Desktop-only. |
| FR-017 (terminal) | E3 → 3.1 | Parallel-safe after 1.1 | Desktop terminal gating. |
| FR-018 (terminal copy/paste) | E3 → 3.1, 3.6 | Parallel-safe after 1.1 | Desktop terminal UX. |
| FR-019 (VS Code surface) | E2 → 2.1 | Parallel-safe vs E1 after shared bundle | Webview host. |
| FR-020 (VS Code copy) | E2 → 2.4 | Parallel-safe vs E1 after shared bundle | Copy/edit in extension. |
| FR-021 (VS Code constraints) | E2 → 2.1–2.3 | Parallel-safe vs E1 after shared bundle | No Electron/BYOK/terminal. |
| FR-022 (empty/error states) | E1 → 1.1, 1.3 | Parallel-safe after 1.1 | Health/staleness states. |
| FR-023 (persistence) | E1 → 1.1, 1.2 | Sequential anchor (1.1), parallel after | Repo + filters persistence. |
| FR-024 (offline blocking) | E1 → 1.6 | Parallel-safe after 1.1 | Blocks CLI/chat/terminal. |
| FR-025 (local logs) | E1 → 1.8 | Parallel-safe after 1.1 | PII-safe action log. |
| FR-026 (offline cache) | E3 → 3.3 | Parallel-safe after 1.1 | Cached status/docs. |
| FR-027 (file change notify) | E3 → 3.4 | Parallel-safe after 1.1 | Refresh prompts. |
| FR-028 (multi-repo) | E1 → 1.2 (base), E3 → 3.5 (polish) | Parallel-safe after 1.1 | Switcher + UX hardening. |
| FR-029 (automation) | E5 → 5.1 | Parallel-safe after 1.x foundation | Guardrails/confirm flows. |
| FR-030 (cross-repo view) | E5 → 5.2 | Parallel-safe after multi-repo | Aggregation scaffolding. |
| FR-031 (analytics) | E5 → 5.3 | Parallel-safe after instrumentation | Non-PII counters. |

---

## Summary

Initial epic structure defined with prioritized sequencing per roadmap:
- Electron MVP with live data + UI tracking + command/prompt copy+edit + auto-update (Epic 1; terminal/BYOK deferred)
- VS Code extension parity (same features, no terminal/BYOK) (Epic 2)
- Return to Electron for terminal, BYOK chat, reliability add-ons (Epic 3)
- VS Code Copilot overlay (Epic 4)
- Automation/analytics (Epic 5)
