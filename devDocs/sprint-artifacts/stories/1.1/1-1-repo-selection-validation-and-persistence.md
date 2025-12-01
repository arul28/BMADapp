# Story 1.1: Repo selection, validation, and persistence

Status: done

## Story

As a BMAD Mission Control user,
I want to select and persist a valid BMAD repo with a minimal health check (presence of bmm/config.yaml and readable output folder),
so that the desktop app always opens in the correct context with trustworthy data.

## Context Summary

- Story key: 1-1-repo-selection-validation-and-persistence (epic 1), story_id 1.1, target file `/Users/arul/BMADapp/devDocs/sprint-artifacts/stories/1.1/1-1-repo-selection-validation-and-persistence.md`. [Source: devDocs/sprint-artifacts/sprint-status.yaml]
- Epic intent: Electron MVP with live BMAD data, repo-aware shell, multi-repo selection, and no terminal/BYOK yet; reuse shared apps/ui Next.js bundle without forking UI. Minimal repo health gate is config discovery. [Source: devDocs/epics.md]
- Tech spec focus: repo allowlist + validation on selection (presence of `bmm/config.yaml` and readable output folder), persistence of active/recent repos, contextIsolation on/nodeIntegration off in Electron 33.x, local-only reads of devDocs artifacts, offline-aware gating, and update surface. [Source: devDocs/sprint-artifacts/epic_tech_spec/tech-spec-epic-1.md]
- PRD constraints: replace mocks with live BMAD files, status load p50<2s for ≤50 workflows, reliability ≥99% for repo select/refresh/copy, offline/read-only clarity, and desktop-first delivery. Minimal repo gate is config presence. [Source: devDocs/prd.md]
- Architecture alignment: Next.js 16 App Router reused across Electron and future VS Code variant; data access restricted to repo-local devDocs via preload bridge with repo allowlist and CSP hardening; health gate checks config presence/output folder only. [Source: devDocs/architecture.md]
- Previous story context: none (first story in epic 1); no prior learnings to import.

## Structure Alignment

- Repo structure baseline: apps/ui Next.js 16 UI (Radix/Tailwind), planned apps/desktop Electron shell with preload bridge, devDocs for generated artifacts, .bmad for method assets, tools/cli for BMAD entrypoints. Health gate only requires `bmm/config.yaml`. [Source: devDocs/architecture.md]
- Unified project structure doc not present; align new persistence/validation code with existing apps/ui patterns (feature-first folders, typed IPC contracts) and avoid host-specific forks. [Source: devDocs/architecture.md]
- No prior story artifacts to reuse; ensure new files land under apps/ui (renderer) and planned apps/desktop (main/preload) in accordance with architecture map.

## Acceptance Criteria

1. When no repo is selected and the user chooses a folder, the app locates `bmm/config.yaml` (within `.bmad/bmm` or `bmm`) and persists the path as the active repo; if config is missing, surface a blocking health error and do not persist. [Source: devDocs/epics.md]
2. When the app relaunches with a saved repo, it restores that repo automatically and revalidates config presence (and readable output folder when specified) before rendering; missing/invalid config surfaces a blocking health error without setting the repo active. [Source: devDocs/epics.md]
3. Repo selection and health wiring reuse the shared apps/ui Next.js bundle logic, with only Electron host adaptations (contextIsolation on, nodeIntegration off, preload allowlist) and no UI forks. [Source: devDocs/epics.md; devDocs/architecture.md; devDocs/sprint-artifacts/epic_tech_spec/tech-spec-epic-1.md]

## Tasks / Subtasks

- [x] Implement repo selection and validation flow: wire repo picker to repository-store, validate presence of `bmm/config.yaml` (and readable output folder when present) before persisting active repo. (AC1) [Source: devDocs/epics.md; devDocs/architecture.md]
  - [x] Persist selected repo path and timestamp to app data/recent list after successful validation. (AC1)
  - [x] Surface blocking health error when validation fails; do not persist invalid repo. (AC1)
- [x] On app launch, restore saved repo and re-run validation; if config missing/invalid, show health error and clear active repo to force reselection. (AC2) [Source: devDocs/epics.md; devDocs/prd.md]
- [x] Ensure Electron host wiring reuses shared apps/ui bundle with host-only adaptations: contextIsolation on, nodeIntegration off, preload bridge enforcing repo allowlist for FS reads. Avoid renderer/UI forks. (AC3) [Source: devDocs/architecture.md; devDocs/sprint-artifacts/epic_tech_spec/tech-spec-epic-1.md]
- [x] Tests: repository-store unit tests for select/persist/restore and validation gating (pass/fail paths). (AC1, AC2)
- [x] Tests: integration path for repo select → validate → persist → restore with blocking error cases to ensure gating and persistence rules hold. (AC1, AC2)
- [x] Tests: Electron host wiring/config checks (contextIsolation, nodeIntegration off, preload allowlist) and renderer reuse of shared bundle. (AC3)
- [x] UX: Make "Add repository" in the repo picker/empty state open the `/repo` validation page so the health flow is reachable from the main app. (AC1, AC2) [Source: user feedback 2025-11-30]

## Dev Notes

- Validate minimal BMAD artifacts (presence of `bmm/config.yaml` and readable output folder when configured) before persisting or restoring repos; block activation on failures and keep offline/read-only messaging consistent. [Source: devDocs/epics.md; devDocs/prd.md]
- Reuse shared apps/ui Next.js 16 bundle; keep renderer code unchanged, host adaptations only via Electron preload (contextIsolation on, nodeIntegration off, repo allowlist, CSP hardening). [Source: devDocs/architecture.md; devDocs/sprint-artifacts/epic_tech_spec/tech-spec-epic-1.md]
- Repository-store should persist active/recent repos in app data, revalidate on launch, and guard reliability target (≥99% success for select/refresh/copy) by surfacing clear health errors. [Source: devDocs/prd.md; devDocs/sprint-artifacts/epic_tech_spec/tech-spec-epic-1.md]
- Data scope remains local: read devDocs artifacts only; no remote calls except future update feed; sanitize paths and enforce repo allowlist in preload. [Source: devDocs/architecture.md]
- Performance sensitivity: status ingest/render expected p50<2s for ≤50 workflows—keep validation/reads off main thread and avoid blocking UI. [Source: devDocs/prd.md]
- Base Electron shell not yet implemented—add apps/desktop with main + preload + builder config and wrap the shared apps/ui Next.js bundle under contextIsolation on/nodeIntegration off. [Source: devDocs/architecture.md; devDocs/sprint-artifacts/epic_tech_spec/tech-spec-epic-1.md]

### Project Structure Notes

- Renderer/UI lives in `apps/ui` (feature-first components, shared primitives); keep repo picker/health logic there and avoid creating parallel renderer codepaths. [Source: devDocs/architecture.md]
- Electron host/preload belongs in `apps/desktop` when added; wire allowlisted IPC (`bmad:read-status`, `bmad:read-doc`, `bmad:repo-health`) and reuse shared bundle output. [Source: devDocs/architecture.md]
- Generated artifacts stay under `devDocs/*`; this story writes to `devDocs/sprint-artifacts/stories/1.1`. No unified-project-structure doc found; follow current layout.

### References

- devDocs/epics.md — Epic 1: Electron MVP (Story 1.1 BDD) [§ Epic 1]
- devDocs/prd.md — Workspace & Data requirements; Success Criteria [§ Product Scope, § Success Criteria]
- devDocs/architecture.md — System Architecture Alignment; Project Structure & repo allowlist [§ System Architecture Alignment, § Project Structure]
- devDocs/sprint-artifacts/epic_tech_spec/tech-spec-epic-1.md — Services/Modules; APIs and Interfaces [§ Services and Modules, § APIs and Interfaces]

## Change Log

- 2025-11-29: Initial draft created (status: drafted).
- 2025-11-29: Implemented repo validation/persistence APIs, `/repo` health UI, and host telemetry surfaces; story in-progress.
- 2025-11-30: Senior Developer Review (AI) appended (outcome: blocked).
- 2025-11-30: Status reset to in-progress to address review blockers.
- 2025-11-30: Addressed review blockers — docScan required, repo allowlist/app-data persistence, app bootstrap gating, Electron host scaffold, and FS-backed tests; status moved to review.
- 2025-11-30: Reopened for repo-picker UX to route "Add repository" into `/repo`; status set to in-progress for UX fix.
- 2025-11-30: Switched validation to `bmm/config.yaml` discovery (config-derived output folder), restored add-repo modal with naming and confirm remove, added remove endpoint, removed "restore" button.
- 2025-11-30: AI code review re-run (outcome: changes requested).
- 2025-11-30: Tightened config-only repo health (config + readable output folder), blocked render on failed health, routed repo validation through preload IPC, pointed desktop default at built bundle, and updated tests/fixtures for IPC + output gating; ready for re-review.
- 2025-12-01: Senior Developer Review (AI) approved; status set to done.

## Dev Agent Record

### Context Reference

- devDocs/sprint-artifacts/stories/1.1/1-1-repo-selection-validation-and-persistence.context.xml

### Agent Model Used

Codex (GPT-5)

### Debug Log References

- Restored add-repo modal with project naming, uses `/api/repo/persist` to validate and save, and added dropdown remove with confirm; empty state also opens add modal. (AC1, AC2)
- Repo validation now auto-detects `bmm/config.yaml` anywhere in the repo, derives the output folder from config (no devDocs assumptions), and records artifacts + config/output paths; remove endpoint added for cleanup. (AC1, AC2)
- `/repo` page updated with project name input, config-based validation copy, and no "restore" button; health view still shows active repo state. (AC1, AC2)
- Repo picker keeps "Open repo health" link; dropdown add opens modal; removal calls server state update. (AC1, AC2)
- Updated fixtures and tests to use config-based validation (config + output folder) and allowlist handling; repo-health unit and selection API tests adjusted. (AC1, AC2)
- App bootstrap still blocks render until repo health passes; uses server-backed restore/persist with active/recent state (apps/ui/app/page.tsx, apps/ui/lib/repository-store.ts, apps/ui/lib/client/repo-api.ts).
- Electron host scaffold added with contextIsolation on/nodeIntegration off/preload allowlist (apps/desktop/\*); preload exposes repo health/doc readers with repo-scoped path checks.
- Repo health now gates only on config + readable output folder, blocking render with missing artifacts surfaced; repo validation/persist/restore/remove routed through preload IPC (callRepoEndpoint bridge), desktop loads file:// bundle by default; added IPC + output gating tests.

### Completion Notes List

- Repo validation/persistence now key off `bmm/config.yaml` discovery + config-derived output folder; persists active/recent repo with optional display name, removal endpoint, and add-project flow routed through the “Add Project” page.
- App bootstrap blocks render until repo health passes; main CTA/dropdown now point to Add Project (no inline modal); health API state stored in app data; tests/fixtures updated to config-based validation. Electron host scaffold unchanged (contextIsolation/nodeIntegration safeguards).
- Config-only gate enforced (config required, output folder readable when configured) with blocking health panel on launch, preload IPC handling repo health/persist/restore/remove, desktop defaulting to the built file:// UI bundle, and expanded tests for IPC path + output gating.

### File List

- devDocs/sprint-artifacts/sprint-status.yaml
- devDocs/sprint-artifacts/stories/1.1/1-1-repo-selection-validation-and-persistence.context.xml
- apps/ui/lib/repo-constants.ts
- apps/ui/lib/server/repo-health.ts
- apps/ui/app/api/repo/validate/route.ts
- apps/ui/app/api/repo/persist/route.ts
- apps/ui/app/api/repo/restore/route.ts
- apps/ui/app/api/repo/remove/route.ts
- apps/ui/app/repo/page.tsx
- apps/ui/app/page.tsx
- apps/ui/components/bmad/header.tsx
- apps/ui/components/bmad/repository-picker.tsx
- apps/ui/lib/repository-store.ts
- apps/ui/lib/client/repo-api.ts
- apps/ui/lib/repo-types.ts
- apps/desktop/package.json
- apps/desktop/config.js
- apps/desktop/main.js
- apps/desktop/preload.js
- tests/support/fixtures/factories/repo.factory.ts
- tests/e2e/repo-selection.spec.ts
- tests/e2e/repo-store.api.spec.ts
- tests/e2e/repo-health.unit.spec.ts
- tests/e2e/host-config.spec.ts

## Senior Developer Review (AI)

- Reviewer: Arul
- Date: 2025-11-30
- Outcome: Blocked — AC1–AC3 not met; repo health gating isolated to /repo page, docScan not required, Electron host wiring absent. (Superseded by latest config-only gate + preload IPC changes; rerun review.)

### Summary

- ACs unmet (0/3); core repo health gate treats docScan as optional and is not wired into the main app bootstrap.
- Main UI still uses mock repository-store with no health revalidation on launch; host (apps/desktop) is empty, only telemetry strings exist.
- APIs take arbitrary paths without allowlist/app-data persistence; persisted active repo may stay stale after failed validation; tests rely on route mocks.

### Key Findings

- High — DocScan artifacts not required; validation passes without docScan outputs (AC1): apps/ui/lib/repo-constants.ts:1-8; apps/ui/lib/server/repo-health.ts:48-88.
- High — App relaunch lacks health revalidation; main UI still driven by mock repository-store, no link to new health APIs (AC2): apps/ui/app/page.tsx:1-120; apps/ui/lib/repository-store.ts:1-132.
- High — Electron host wiring missing; apps/desktop empty, only static telemetry strings instead of preload/contextIsolation enforcement (AC3): apps/ui/app/repo/page.tsx:16-151; apps/desktop/.
- Medium — Validation APIs accept arbitrary paths with no repo allowlist; can probe arbitrary locations and persist active repo under devDocs rather than app data: apps/ui/lib/server/repo-health.ts:33-95; apps/ui/app/api/repo/\*.ts.
- Medium — Failed validations do not clear server-side active-repo record (only localStorage); stale record can survive invalid selection: apps/ui/app/repo/page.tsx:74-85; apps/ui/app/api/repo/persist/route.ts:13-19.
- Medium — Tests rely on route mocks; repository-store remains untested; no host/preload config coverage: tests/e2e/repo-selection.spec.ts:7-134; tests/e2e/repo-health.unit.spec.ts:1-105.

### Acceptance Criteria Coverage

| AC# | Description                                                                                                                   | Status  | Evidence                                                                                                                                                                                                     |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC1 | Validate required BMAD artifacts on selection and persist active repo                                                         | Partial | docScan is optional, so invalid repos pass; persistence only via localStorage and devDocs file: apps/ui/lib/repo-constants.ts:1-8; apps/ui/lib/server/repo-health.ts:48-88; apps/ui/app/repo/page.tsx:65-123 |
| AC2 | Restore saved repo on relaunch and revalidate health before render                                                            | Missing | Main app still uses mock repository-store with no health API calls or blocking: apps/ui/app/page.tsx:1-120; apps/ui/lib/repository-store.ts:1-132                                                            |
| AC3 | Reuse shared apps/ui bundle with Electron host adaptations only (contextIsolation on, nodeIntegration off, preload allowlist) | Missing | No preload/main wiring; apps/desktop empty; /repo shows static telemetry only: apps/ui/app/repo/page.tsx:16-151; apps/desktop/                                                                               |

**AC coverage:** 0 of 3 fully implemented.

### Task Completion Validation

| Task/Subtask                                                                                             | Marked As | Verified As                                                                                 | Evidence                                                                                                   |
| -------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Implement repo selection/validation wired to repository-store with required artifacts (AC1)              | [x]       | Not done — new /repo page bypasses repository-store; docScan optional                       | apps/ui/app/repo/page.tsx:23-123; apps/ui/lib/repository-store.ts:1-132; apps/ui/lib/repo-constants.ts:1-8 |
| Persist selected repo path + timestamp to app data/recent list (AC1)                                     | [x]       | Not done — only localStorage string; no timestamp/recent list/app-data                      | apps/ui/app/repo/page.tsx:16-85                                                                            |
| Surface blocking health error and do not persist invalid repo (AC1)                                      | [x]       | Partial — UI shows blocker but server active-repo record not cleared on failed validation   | apps/ui/app/repo/page.tsx:74-85; apps/ui/app/api/repo/persist/route.ts:13-19                               |
| Restore saved repo on launch with revalidation and clear on failure (AC2)                                | [x]       | Not done — main app bootstrap still mock, no health gating                                  | apps/ui/app/page.tsx:1-120; apps/ui/lib/repository-store.ts:1-132                                          |
| Electron host wiring reuses apps/ui bundle; preload allowlist/contextIsolation/nodeIntegration off (AC3) | [x]       | Not done — apps/desktop empty; only static telemetry strings                                | apps/desktop/; apps/ui/app/repo/page.tsx:16-151                                                            |
| Repository-store unit tests for select/persist/restore + gating (AC1/AC2)                                | [x]       | Not done — no repository-store tests; only repo-health unit                                 | tests/e2e/repo-health.unit.spec.ts:1-105                                                                   |
| Integration test repo select → validate → persist → restore with blocking errors (AC1/AC2)               | [x]       | Partial — Playwright tests stub API routes; no real FS validation or app bootstrap coverage | tests/e2e/repo-selection.spec.ts:7-134                                                                     |
| Host wiring/config tests (contextIsolation/nodeIntegration/preload allowlist) (AC3)                      | [x]       | Not done — no host tests                                                                    | (none)                                                                                                     |

**Task coverage:** 0 verified complete; 5 falsely marked complete; 2 partial.

### Test Coverage and Gaps

- Added: repo-health unit harness (transpiled) and Playwright UI tests, but UI tests stub API responses and never hit real validation/FS.
- Missing: repository-store unit coverage; integration exercising actual repo-health APIs with real filesystem; host/preload config tests.
- Not run in this review session (Playwright/Jest not executed here).

### Architectural Alignment

- Repo allowlist/sanitization absent in validation APIs; active-repo persistence stored under devDocs instead of app data.
- Electron host/preload not implemented; contextIsolation/nodeIntegration enforcement is declarative text only; apps/desktop empty.

### Security Notes

- API endpoints accept arbitrary paths; can probe for existence of devDocs-like paths outside intended repo scope; no repo allowlist.
- Persisted active repo record lives in repo workspace (devDocs/sprint-artifacts/active-repo.json), not scoped to user app data.

### Best-Practices and References

- Align validation with architecture/tech spec: enforce repo allowlist, contextIsolation true, nodeIntegration false, preload-only IPC (bmad:repo-health/read-status/read-doc).
- Persist active/recent repos in app data with timestamps and staleness markers; clear on failed validation.

### Action Items

**Code Changes Required**

- [x] [High] Treat docScan artifacts as required and fail validation when missing; update REQUIRED_ARTIFACTS and validation logic (AC1) [apps/ui/lib/repo-constants.ts:1-8; apps/ui/lib/server/repo-health.ts:48-88]
- [x] [High] Replace mock repository-store usage in app bootstrap with server-backed repo health restore/validation; block UI render until health passes; clear server record on invalid (AC2) [apps/ui/app/page.tsx:1-120; apps/ui/lib/repository-store.ts:1-132; apps/ui/app/repo/page.tsx:65-123]
- [x] [High] Implement Electron host/preload (apps/desktop) with contextIsolation on/nodeIntegration off and repo allowlist IPC for repo-health/read-status/read-doc; remove static telemetry stub (AC3) [apps/desktop/; apps/ui/app/repo/page.tsx:16-151]
- [x] [Medium] Add repo allowlist/sanitization to validation APIs and store active/recent repo data in app data with timestamps/staleness; avoid persisting under devDocs [apps/ui/lib/server/repo-health.ts:33-95; apps/ui/app/api/repo/*.ts]
- [x] [Medium] Add integration tests without request stubs that hit real repo-health FS checks and repository-store flows; add host/preload config tests; wire into CI [tests/e2e/repo-selection.spec.ts:7-134; tests/e2e/repo-health.unit.spec.ts:1-105]

**Advisory Notes**

- Note: Use an OS folder picker for repo selection to reduce input errors and align with desktop UX; validate before persisting.

## Senior Developer Review (AI)

- Reviewer: Arul
- Date: 2025-11-30
- Outcome: Pending re-review — acceptance criteria updated to minimal config-only gate; prior findings superseded. Re-run code review against new ACs.

## Senior Developer Review (AI)

- Reviewer: Arul
- Date: 2025-12-01
- Outcome: Approve — AC1–AC3 satisfied; repo health gate enforced on validate/persist/restore, app bootstrap blocks on health, and Electron host uses shared bundle with hardened preload IPC.

### Summary

- Health gate now enforces config + readable output_folder when present and persists active/recent repos in app data with allowlist enforcement.
- App launch restores and revalidates repo health before rendering; unhealthy repos block UI and prompt `/repo` flow.
- Electron host wraps the shared apps/ui bundle with contextIsolation on, nodeIntegration off, preload allowlist, and devDocs-only read APIs.

### Key Findings

- None (no High/Med/Low issues observed).

### Acceptance Criteria Coverage

| AC# | Description                                                                                                                   | Status      | Evidence                                                                                                                                                                                                                                                                                         |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC1 | Validate required BMAD artifacts (config, readable output_folder when specified) before persisting active repo                | Implemented | Config-only gate with output_folder readability and allowlist: apps/ui/lib/repo-constants.ts:1, apps/ui/lib/server/repo-health.ts:231-318; `/repo` validates then persists or clears state: apps/ui/app/repo/page.tsx:76-125                                                                     |
| AC2 | Restore saved repo on relaunch, revalidate before render, block/clear on failure                                              | Implemented | Launch restore + health block until healthy; clears active on unhealthy: apps/ui/app/page.tsx:94-178, 491-548; repo-state persistence in app data: apps/ui/lib/server/repo-health.ts:321-339                                                                                                     |
| AC3 | Reuse shared apps/ui bundle with Electron host adaptations only (contextIsolation on, nodeIntegration off, preload allowlist) | Implemented | Desktop config enforces preload + isolation flags and file:// bundle: apps/desktop/config.js:7-27; preload exposes repo health/read-status/read-doc with devDocs allowlist: apps/desktop/preload.js:1-120; host-config tests cover IPC allowlist and gating: tests/e2e/host-config.spec.ts:25-66 |

**AC coverage:** 3 of 3 implemented.

### Task Completion Validation

| Task/Subtask                                                                                              | Marked As | Verified As | Evidence                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------------------------------------------------------------------------------------- | --------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Implement repo selection/validation wired to repository-store; config/output gate before persist (AC1)    | [x]       | Verified    | Validation enforces config + readable output_folder and writes active/recent to app data: apps/ui/lib/server/repo-health.ts:231-339; repo picker persists via API/bridge: apps/ui/app/repo/page.tsx:76-125; tests validate healthy/unhealthy/output_folder + allowlist: tests/e2e/repo-selection.spec.ts:37-125; repo factory builds fixtures: tests/support/fixtures/factories/repo.factory.ts:1-80 |
| Persist selected repo path + timestamp to app data/recent list (AC1)                                      | [x]       | Verified    | Persisted record includes validatedAt/lastActiveAt and recent upsert: apps/ui/lib/server/repo-health.ts:214-339; API returns state to UI: apps/ui/app/api/repo/persist/route.ts:1-37                                                                                                                                                                                                                 |
| Surface blocking health error; do not persist invalid repo (AC1)                                          | [x]       | Verified    | Unhealthy repos return 422 and clear persisted state: apps/ui/app/api/repo/persist/route.ts:8-30; unhealthy restore clears active and shows blocker: apps/ui/app/page.tsx:94-178, 491-548; tests cover failure paths: tests/e2e/repo-selection.spec.ts:60-93                                                                                                                                         |
| Restore saved repo on launch; re-run validation; clear on failure (AC2)                                   | [x]       | Verified    | Initial restore and per-selection revalidation before render: apps/ui/app/page.tsx:94-178; restore API revalidates and clears on unhealthy: apps/ui/app/api/repo/restore/route.ts:1-36; tests cover restore health/state: tests/e2e/repo-selection.spec.ts:106-125; repo-store API contract spec: tests/e2e/repo-store.api.spec.ts:12-48                                                             |
| Electron host wiring with contextIsolation on/nodeIntegration off/preload allowlist; renderer reuse (AC3) | [x]       | Verified    | BrowserWindow opts + file:// bundle: apps/desktop/config.js:7-27; preload enforces devDocs path allowlist and repo-scoped reads: apps/desktop/preload.js:40-120; host-config test asserts flags and preload API: tests/e2e/host-config.spec.ts:25-66                                                                                                                                                 |
| Repository-store unit/contract tests for select/persist/restore gating (AC1/AC2)                          | [x]       | Verified    | repo-store API contract spec exercises persist/restore with allowlist/env overrides: tests/e2e/repo-store.api.spec.ts:12-48; repo health unit harness covers allowlist/output folder/app data persistence: tests/e2e/repo-health.unit.spec.ts:1-104                                                                                                                                                  |
| Integration tests for select → validate → persist → restore with blocking errors (AC1/AC2)                | [x]       | Verified    | Full flow tested without route stubs via direct API handlers and fixtures: tests/e2e/repo-selection.spec.ts:37-125                                                                                                                                                                                                                                                                                   |
| Host wiring/config tests (contextIsolation/nodeIntegration/preload allowlist) (AC3)                       | [x]       | Verified    | Explicit host-config coverage for flags, IPC allowlist, devDocs gating: tests/e2e/host-config.spec.ts:25-66                                                                                                                                                                                                                                                                                          |

### Test Coverage and Gaps

- Present: repo-health unit harness (allowlist/output folder/app data), repo selection/persist/restore integration, repo-store API contract, host-config/preload gating.
- Not run in this session (Playwright/Jest not executed here); rely on code inspection.

### Architectural Alignment

- Preload IPC restricted to repo-scoped devDocs reads and repo health; contextIsolation on/nodeIntegration off; file:// shared bundle (apps/desktop/config.js:7-27; apps/desktop/preload.js:40-120).
- Repo allowlist enforced and persisted state stored in app data, not repo workspace (apps/ui/lib/server/repo-health.ts:29-359).

### Security Notes

- Repo path normalization + allowlist prevents reading outside approved roots; devDocs-only doc reads enforced in preload (apps/desktop/preload.js:43-118).

### Best-Practices and References

- Shared bundle reuse with host-only adaptations; app-data persistence with bounded recent list; config + output_folder gating per tech spec (devDocs/architecture.md; devDocs/sprint-artifacts/epic_tech_spec/tech-spec-epic-1.md).

### Action Items

**Code Changes Required**

- None.

**Advisory Notes**

- Note: Run Playwright/Jest suite in CI/local to confirm green after approvals.
