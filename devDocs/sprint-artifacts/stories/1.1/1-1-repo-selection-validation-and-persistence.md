# Story 1.1: Repo selection, validation, and persistence

Status: drafted

## Story

As a BMAD Mission Control user,
I want to select and persist a valid BMAD repo with health checks,
so that the desktop app always opens in the correct context with trustworthy data.

## Context Summary

- Story key: 1-1-repo-selection-validation-and-persistence (epic 1), story_id 1.1, target file `/Users/arul/BMADapp/devDocs/sprint-artifacts/stories/1.1/1-1-repo-selection-validation-and-persistence.md`. [Source: devDocs/sprint-artifacts/sprint-status.yaml]
- Epic intent: Electron MVP with live BMAD data, repo-aware shell, multi-repo selection, and no terminal/BYOK yet; reuse shared apps/v0 Next.js bundle without forking UI. [Source: devDocs/epics.md]
- Tech spec focus: repo allowlist + validation on selection, persistence of active/recent repos, contextIsolation on/nodeIntegration off in Electron 33.x, local-only reads of devDocs artifacts, offline-aware gating, and update surface. [Source: devDocs/sprint-artifacts/epic_tech_spec/tech-spec-epic-1.md]
- PRD constraints: replace mocks with live BMAD files, status load p50<2s for ≤50 workflows, reliability ≥99% for repo select/refresh/copy, offline/read-only clarity, and desktop-first delivery. [Source: devDocs/prd.md]
- Architecture alignment: Next.js 16 App Router reused across Electron and future VS Code variant; data access restricted to repo-local devDocs (status, docScan, PRD/architecture/epics) via preload bridge with repo allowlist and CSP hardening. [Source: devDocs/architecture.md]
- Previous story context: none (first story in epic 1); no prior learnings to import.

## Structure Alignment

- Repo structure baseline: apps/v0 Next.js 16 UI (Radix/Tailwind), planned apps/desktop Electron shell with preload bridge, devDocs for generated artifacts, .bmad for method assets, tools/cli for BMAD entrypoints. [Source: devDocs/architecture.md]
- Unified project structure doc not present; align new persistence/validation code with existing apps/v0 patterns (feature-first folders, typed IPC contracts) and avoid host-specific forks. [Source: devDocs/architecture.md]
- No prior story artifacts to reuse; ensure new files land under apps/v0 (renderer) and planned apps/desktop (main/preload) in accordance with architecture map.

## Acceptance Criteria

1. When no repo is selected and the user chooses a folder, the app validates required BMAD artifacts (e.g., devDocs/bmm-workflow-status.yaml, docScan outputs, epics/prd/architecture) and persists the path as the active repo. [Source: devDocs/epics.md]
2. When the app relaunches with a saved repo, it restores that repo automatically and revalidates health before rendering; invalid or missing artifacts surface a blocking health error without setting the repo active. [Source: devDocs/epics.md]
3. Repo selection and health wiring reuse the shared apps/v0 Next.js bundle logic, with only Electron host adaptations (contextIsolation on, nodeIntegration off, preload allowlist) and no UI forks. [Source: devDocs/epics.md; devDocs/architecture.md; devDocs/sprint-artifacts/epic_tech_spec/tech-spec-epic-1.md]

## Tasks / Subtasks

- [ ] Implement repo selection and validation flow: wire repo picker to repository-store, validate required BMAD artifacts (devDocs/bmm-workflow-status.yaml, docScan outputs, epics/prd/architecture) before persisting active repo. (AC1) [Source: devDocs/epics.md; devDocs/architecture.md]
  - [ ] Persist selected repo path and timestamp to app data/recent list after successful validation. (AC1)
  - [ ] Surface blocking health error when validation fails; do not persist invalid repo. (AC1)
- [ ] On app launch, restore saved repo and re-run validation; if artifacts missing/invalid, show health error and clear active repo to force reselection. (AC2) [Source: devDocs/epics.md; devDocs/prd.md]
- [ ] Ensure Electron host wiring reuses shared apps/v0 bundle with host-only adaptations: contextIsolation on, nodeIntegration off, preload bridge enforcing repo allowlist for FS reads. Avoid renderer/UI forks. (AC3) [Source: devDocs/architecture.md; devDocs/sprint-artifacts/epic_tech_spec/tech-spec-epic-1.md]
- [ ] Tests: repository-store unit tests for select/persist/restore and validation gating (pass/fail paths). (AC1, AC2)
- [ ] Tests: integration path for repo select → validate → persist → restore with blocking error cases to ensure gating and persistence rules hold. (AC1, AC2)
- [ ] Tests: Electron host wiring/config checks (contextIsolation, nodeIntegration off, preload allowlist) and renderer reuse of shared bundle. (AC3)

## Dev Notes

- Validate BMAD artifacts (devDocs/bmm-workflow-status.yaml, docScan outputs, PRD/architecture/epics) before persisting or restoring repos; block activation on failures and keep offline/read-only messaging consistent. [Source: devDocs/epics.md; devDocs/prd.md]
- Reuse shared apps/v0 Next.js 16 bundle; keep renderer code unchanged, host adaptations only via Electron preload (contextIsolation on, nodeIntegration off, repo allowlist, CSP hardening). [Source: devDocs/architecture.md; devDocs/sprint-artifacts/epic_tech_spec/tech-spec-epic-1.md]
- Repository-store should persist active/recent repos in app data, revalidate on launch, and guard reliability target (≥99% success for select/refresh/copy) by surfacing clear health errors. [Source: devDocs/prd.md; devDocs/sprint-artifacts/epic_tech_spec/tech-spec-epic-1.md]
- Data scope remains local: read devDocs artifacts only; no remote calls except future update feed; sanitize paths and enforce repo allowlist in preload. [Source: devDocs/architecture.md]
- Performance sensitivity: status ingest/render expected p50<2s for ≤50 workflows—keep validation/reads off main thread and avoid blocking UI. [Source: devDocs/prd.md]

### Project Structure Notes

- Renderer/UI lives in `apps/v0` (feature-first components, shared primitives); keep repo picker/health logic there and avoid creating parallel renderer codepaths. [Source: devDocs/architecture.md]
- Electron host/preload belongs in `apps/desktop` when added; wire allowlisted IPC (`bmad:read-status`, `bmad:read-doc`, `bmad:repo-health`) and reuse shared bundle output. [Source: devDocs/architecture.md]
- Generated artifacts stay under `devDocs/*`; this story writes to `devDocs/sprint-artifacts/stories/1.1`. No unified-project-structure doc found; follow current layout.

### References

- devDocs/epics.md — Epic 1: Electron MVP (Story 1.1 BDD) [§ Epic 1]
- devDocs/prd.md — Workspace & Data requirements; Success Criteria [§ Product Scope, § Success Criteria]
- devDocs/architecture.md — System Architecture Alignment; Project Structure & repo allowlist [§ System Architecture Alignment, § Project Structure]
- devDocs/sprint-artifacts/epic_tech_spec/tech-spec-epic-1.md — Services/Modules; APIs and Interfaces [§ Services and Modules, § APIs and Interfaces]

## Change Log

- 2025-11-29: Initial draft created (status: drafted).

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Codex (GPT-5)

### Debug Log References

### Completion Notes List

### File List
