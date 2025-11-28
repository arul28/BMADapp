# System-Level Test Design

## Testability Assessment

- Controllability: Repo-scoped, file-driven data (devDocs/*.md/yaml) allows deterministic seeding and mutation for tests; IPC bridge planned with contextIsolation/nodeIntegration off enables mocking via preload contract; terminal/chat actions can be gated by offline flag. Gaps: auto-update feed and BYOK secret handling not yet testable in local stubs.
- Observability: Structured logs planned (JSON, local-only) and staleness indicators; needs explicit log/telemetry hooks surfaced to Playwright (console/Server-Timing/trace IDs). Missing: standardized health endpoint for renderer → preload → file system, and update-channel diagnostics.
- Reliability: Offline/read-only mode and repo allowlist are defined; success criteria target ≥99% for critical actions. Risks: file permission errors, missing devDocs, and update flow resiliency; need deterministic fallback paths and fixture-based cache tests.

## Architecturally Significant Requirements (ASRs)

- Performance (<2s status load/render for ≤50 workflows): Local YAML/MD reads; must validate parsing throughput and virtualization of board lists.
- Security (repo allowlist, IPC hardening, BYOK desktop-only): Enforce contextIsolation, sanitize clipboard/command copy, forbid Electron APIs in VS Code variant.
- Reliability (offline/read-only gating, ≥99% success for critical actions): Must block terminal/chat/CLI when offline; handle missing devDocs with actionable states.
- Update readiness (auto-update channel with <1 min staleness): Require mockable update feed and restart/apply flow; offline shows last-known version.
- Data fidelity (no mock data in prod): All board/cards/doc surfaces must read repo files; tests must fail on fallback/mock usage.

## Test Levels Strategy

- Unit (~45%): Parsing (YAML/MD), data mappers, repo validation, IPC schema guards, offline gating logic, clipboard sanitization helpers.
- Integration (~35%): Preload IPC contract (readStatus/readDoc/copyCommand), repo allowlist enforcement, file-permission handling, update-service adapter, VS Code FS access shim.
- E2E (~20%): Playwright Electron for desktop shell (board render, staleness, offline gating, command copy), Playwright webview harness for VS Code variant (no Electron APIs), performance budget checks on status load.

## NFR Testing Approach

- Security: Playwright Electron to assert contextIsolation/nodeIntegration settings, IPC allowlist violations blocked, command copy sanitized; npm audit/Snyk in CI; BYOK secrets never persisted (storageState/FS scan). VS Code variant explicitly denies Electron APIs.
- Performance: k6/local timing harness for status read/render (<2s p95 for ≤50 workflows); measure parse + render separately; Lighthouse/Playwright tracing for perceived performance.
- Reliability: Fault-injection in tests (missing devDocs, permission denied, offline flag) → actionable UI states; retry/backoff only where specified; ensure ≥99% pass on critical actions (repo select, status load, command copy) via burn-in runs.
- Maintainability: Coverage ≥80%, duplication <5% (jscpd), explicit assertions only; test length/time limits per `test-quality` fragment; structured logging validated via headers/console hooks.

## Test Environment Requirements

- Local repo with devDocs (prd.md, architecture.md, epics.md, bmm-workflow-status.yaml); fixture generator for synthetic workflow-status files (≤50 workflows, stale/non-stale cases).
- Playwright Electron harness with preload contract mockability; separate Playwright webview harness for VS Code variant; k6 for status load timing.
- Update feed stub server for auto-update flows; offline toggle hook; file-permission simulation (chmod/deny) in CI-friendly way.

## Testability Concerns (if any)

- Auto-update path lacks defined mock/stub channel; risk of untestable update gating.
- Permission-denied and missing-file states need deterministic fixtures; otherwise flaky in CI.
- BYOK secret handling/storage not yet specified for testing; must ensure no disk persistence.
- Cross-surface divergence risk (Electron vs VS Code) if shared bundle uses Electron-only APIs.

## Recommendations for Sprint 0

- Stand up Playwright Electron + webview harnesses with shared fixtures for devDocs inputs; add contract tests for preload IPC (allowlist, contextIsolation, repo scope).
- Add fixture generator for workflow-status YAML (fresh vs stale) and doc presence/absence; wire into board tests and offline gating scenarios.
- Implement update-feed stub + restart flow tests; assert offline shows last-known version and blocks apply.
- Enforce quality gates in CI: coverage ≥80%, duplication <5%, no hard waits, deterministic waits only; burn-in critical flows (repo select, status load, copy) to validate ≥99% success.
- Define secret-handling rules for BYOK (desktop) and explicit denial for VS Code; add scans to ensure no secrets written to disk.
