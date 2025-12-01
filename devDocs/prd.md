# Mission Control - Product Requirements Document

**Author:** Arul  
**Date:** 2025-11-28  
**Version:** 1.0

---

## Executive Summary

Mission Control adds a graphical control surface for the BMAD Method, bringing agents, workflows, and progress tracking into one view. It reuses the existing Next.js v0 UI and will be delivered first as an Electron desktop app (VS Code extension to follow) while replacing mock data with live BMAD workflow/status data.

### What Makes This Special

The first GUI for BMAD: a single-pane view of agents, workflows, and status with quick command handoffs. Users feel in control because everything they need is visible at a glance, without digging through CLI outputs.

---

## Project Classification

**Technical Type:** Desktop app (Electron first; VS Code extension next)  
**Domain:** General software  
**Complexity:** Low

Primary surface: Electron desktop app reusing the existing Next.js v0 UI; Secondary: VS Code extension reusing the same components (without embedded terminal/BYOK).  
Data mode: Replace mock data with live BMAD workflow/status data from the local repo (e.g., devDocs/bmm-workflow-status.yaml) plus agent/workflow definitions.  
Core value: Visual control surface for BMAD agents and workflows so users can see progress and actions at a glance.  
Product brief: None provided.  
Domain brief/research docs: None provided.

---

## Success Criteria

- Time-to-first-status: load and render workflow status in <2s for repos with ≤50 workflows and devDocs present.
- Data fidelity: 100% of workflow cards pull live data from devDocs/bmm-workflow-status.yaml and agent/workflow definitions; no mock data in production.
- Parity: desktop app matches existing Next.js v0 UI for repo select, workflow board, chat, terminal, and command copy; VS Code variant matches minus embedded terminal/BYOK.
- Reliability: critical actions (repo select, status refresh, command copy) succeed ≥99% across supported OS versions.
- Control perception: ≥80% of pilot users report “in control” with at-a-glance BMAD progress (survey).
- Update readiness: Electron auto-update channel surfaces version and update status with <1 min staleness; offline shows last-known version state.

---

## Product Scope

### MVP - Minimum Viable Product (Desktop first)

- Package existing Next.js v0 UI inside Electron.
- Replace mock data with live BMAD repo data (workflow status, agents/workflows, docs).
- Repo selection and validation that BMAD is installed and initialized.
- Workflow board: phases, per-workflow cards, statuses, next actions, doc links.
- Command assist: copy/rerun suggested CLI commands; embedded terminal (desktop) in repo context.
- Chat/assist: BYOK chat in desktop app with workflow context sharing.
- Docs surface: show key generated docs (e.g., devDocs docScan outputs, workflow status).

**MVP rationale (why it is minimal/viable):** Electron shell + live BMAD data delivers the differentiator (single-pane control room) on day 1; repo validation and workflow board make the app trustworthy; embedded terminal/command copy keep actionability; BYOK chat unlocks contextual help; docs surface prevents context loss.

**Out of scope (initial):** mobile/SEO, multi-tenant SaaS, cloud sync/backends, remote workflow execution, analytics dashboards, cross-repo aggregation, non-macOS packaging, telemetry/PII capture. Rationale: not required to deliver single-pane control room for a local BMAD repo and would delay parity; telemetry/PII deferred to avoid compliance overhead in MVP.

### Growth Features (Post-MVP)

- VS Code extension UI using the same components; swap terminal/BYOK for Copilot-backed chat and command copy.
- Multi-repo switcher and recent-repo memory.
- Inline notifications when BMAD files change.
- Lightweight offline cache of last-known status for read-only viewing.

### Vision (Future)

- Automated “apply next action” flows that run workflows directly from the UI.
- Cross-repo Mission Control with aggregation of statuses.
- Deeper agent transparency (who did what, when) with timeline overlays.
- Rich analytics on workflow efficiency (non-time-based; e.g., steps completed, blockers raised).

**Deferral reasons (Growth/Vision):**

- Multi-repo/notifications/offline cache (Growth) deferred until single-repo control room is stable.
- VS Code constraints and Copilot-backed chat (Growth) after desktop parity proves the model.
- Automation, cross-repo, analytics (Vision) depend on stable IPC patterns, trust in base UX, and a telemetry/compliance plan; kept for later phases.

---

## Desktop App Specific Requirements

Guided by desktop_app project-type signals.

- **Platform support:** Electron on macOS first; path to Windows/Linux with filesystem permissions and terminal integrations abstracted.
- **System integration:** Respect repo-local BMAD data; provide clipboard copy for commands; allow deep-linking to repo paths within the app.
- **Update strategy:** Auto-update channel for the Electron shell; surface current version and update availability.
- **Offline capabilities:** Read-only viewing of last-synced status when offline; block write actions that require CLI when offline.
- **Skip sections:** Web SEO and mobile features are out of scope.

### Platform Support

- macOS desktop (primary); design abstractions for Windows/Linux to follow.
- Single binary install with permissions to read/write within the repo path.
- Electron shell wraps Next.js build with consistent dark theme and window controls.

### System Integration and Updates

- File access limited to the selected repo (and devDocs outputs).
- Command copy/paste with clipboard.
- Auto-update mechanism with release notes surfaced in-app.

### Offline Capabilities

- Cache last-read workflow status and doc listings for read-only view.
- Prevent command execution and terminal launch when offline; communicate state clearly.

---

## User Experience Principles

- Control room feel: dense, high-signal dashboard; prioritize status and next actions over decoration.
- Quick-scan layout: workflow board, actions, agents, and docs visible without deep navigation.
- Consistent theming with existing Next.js v0 UI; dark-first.
- Reduce overwhelm: progressive disclosure of step details; keep “copy command” and “run” close to context.
- Keyboard-friendly for power users; clear empty states when BMAD is not initialized.

### Key Interactions

- Select repo → validate BMAD install → render workflow status.
- Open workflow cards → see status, outputs, next steps → copy/run commands.
- Launch chat (desktop) with contextual info from the selected workflow.
- Open embedded terminal (desktop) in repo context; copy commands inline.
- In VS Code extension, use the same UI minus embedded terminal/BYOK; rely on Copilot-backed chat and command copy.

---

## Functional Requirements

**Workspace & Data**

- FR-001 [MVP] Users can select a local BMAD repo and set it as the active workspace; persists last-selected repo.
- FR-002 [MVP] Detect BMAD install/initialization and file health (devDocs/bmm-workflow-status.yaml, required directories); show blocking errors.
- FR-003 [MVP] Read workflow status files and render phases/workflows within 2s for repos ≤50 workflows; warn if stale (>5 min) or missing.
- FR-004 [MVP] Refresh data from disk on demand; reflect changes in <2s; no cached mock data.
- FR-005 [MVP] View generated docs (docScan outputs, architecture overview) from the repo with links to file paths.
- FR-006 [MVP] Offline/read-only mode: when offline, block write/CLI actions, allow cached viewing, and label state.
- FR-007 [MVP] Auto-update channel for Electron shell; surface current version and update availability; allow defer/accept.

**Workflow Visibility & Control**

- FR-008 [MVP] Board of phases and workflows with status, agent owner, expected output path, and last-updated timestamp.
- FR-009 [MVP] Workflow card with step details, statuses, outputs, and doc links; show if data is stale.
- FR-010 [MVP] Recommended next workflows/actions based on workflow-status guidance.
- FR-011 [MVP] Copy suggested CLI commands for a workflow directly from the card; confirm copy.
- FR-012 [MVP] Launch a workflow run from the UI (desktop) with repo context; block when offline.
- FR-013 [MVP] Show doc links for key outputs (docScan, architecture, epics once present) with existence check.

**Agents, Chat, and Terminal**

- FR-014 [MVP] Display agent roster and roles tied to workflows.
- FR-015 [MVP] Start BYOK chat session (desktop) with workflow context attached; redact secrets from logs; chat launch ≤1s.
- FR-016 [MVP] Share workflow context (status, outputs) into chat threads.
- FR-017 [MVP] Embedded terminal in active repo context; block when offline; show warnings on permissions issues; terminal open ≤2s.
- FR-018 [MVP] Inline command copy/paste into terminal launcher with success confirmation; copy success in <0.5s.

**VS Code Extension Variant**

- FR-019 [Growth] Run UI inside VS Code with Copilot-backed chat (no BYOK), no embedded terminal.
- FR-020 [Growth] Copy commands for external terminal execution when embedded terminal is unavailable.
- FR-021 [Growth] Enforce VS Code constraints (respect VS Code workspace path, no local BYOK storage, no Electron APIs).

**Reliability & State**

- FR-013A [MVP] Workflow board adapts to the project’s selected track (`selected_track`), field type (`field_type`), and referenced `workflow_path` in `devDocs/bmm-workflow-status.yaml` (quick-flow, bmad-method, enterprise; greenfield/brownfield). Phases/workflows and optional/recommended/conditional/prerequisite flags render from that path file. If `workflow_path` is missing, surface an actionable error and allow manual selection of track/field type.
- FR-022 [MVP] Clear empty/error states when BMAD is not initialized or files are missing; include remediation steps.
- FR-023 [MVP] Persist last-selected repo and UI filters between sessions.
- FR-024 [MVP] Prevent actions that require CLI when offline and surface the reason.
- FR-025 [MVP] Log recent workflow actions/runs for user visibility (local only).
- FR-026 [Growth] Offline cache of last-known status and docs for read-only viewing; show staleness.
- FR-027 [Growth] Inline notifications when BMAD files change; prompt refresh.
- FR-028 [Growth] Multi-repo switcher and recent-repo memory.
- FR-029 [Vision] Automated “apply next action” flows to run workflows from UI (guardrails, confirmations).
- FR-030 [Vision] Cross-repo Mission Control with aggregated statuses.
- FR-031 [Vision] Analytics on workflow efficiency (e.g., steps completed, blockers raised) without timing metrics.

**FR dependencies and notes**

- FR-012 depends on FR-001/FR-002/FR-003 (repo selection, health, status load).
- FR-017 depends on FR-001/FR-002 (repo context) and FR-006 (offline blocking).
- FR-015 depends on FR-001 (context) and FR-006 (offline state messaging).
- Differentiator coverage: FR-008–FR-013 (control room/command handoff) reinforce single-pane visibility.

**Acceptance Criteria (per FR)**

- FR-001: Select and persist repo; survives app restart; wrong path shows clear error.
- FR-002: Detect BMAD init; if missing devDocs/bmm-workflow-status.yaml, show blocking state with remediation link.
- FR-003: Status load p50 <2s/p95 <3s for ≤50 workflows; staleness flag if >5 min; missing file shows actionable error.
- FR-004: Manual refresh completes <2s; UI reflects new data; no mock data fallback.
- FR-005: Doc links resolve to existing files; broken links show inline warning.
- FR-006: Offline mode banner; blocks runs/terminal/chat launch; cached read still works.
- FR-007: Update status visible with <1 min staleness; defer/accept options; offline shows last-known version.
- FR-008: Board renders all phases/workflows with status/owner/output path/last-updated; stale badge shown when applicable.
- FR-009: Card shows steps/status/output links; stale badge shown; open card <1s.
- FR-010: Recommended actions list present when available; empty state if none.
- FR-011: Copy command confirms in <0.5s; copies exact CLI string.
- FR-012: Launch workflow run only when online and repo valid; blocks otherwise with reason.
- FR-013: Doc links for key outputs show existence status; missing docs show warning.
- FR-014: Agent roster loads and matches agent definitions; shows role per agent.
- FR-015: BYOK chat launches ≤1s; context includes selected workflow; logs redact secrets.
- FR-016: Share status/output into chat thread; link back to source card.
- FR-017: Terminal opens ≤2s in repo path; blocked offline; permission errors surfaced.
- FR-018: Copy/paste into terminal launcher confirms success; copy <0.5s.
- FR-019: VS Code variant runs without Electron/BYOK; respects VS Code workspace path.
- FR-020: Copy commands available in VS Code variant; no embedded terminal.
- FR-021: No Electron APIs used in VS Code; Copilot chat available when configured.
- FR-022: Empty/error states show remediation steps for missing BMAD artifacts.
- FR-023: Repo and filters persist across sessions.
- FR-024: Offline blocking enforced for CLI actions with clear reason.
- FR-025: Local log of recent actions available; no PII/keys stored.
- FR-026: Offline cache shows staleness timestamp; read-only when offline.
- FR-027: File change notifications prompt refresh without auto-applying.
- FR-028: Multi-repo switcher remembers recent repos; selects one active at a time.
- FR-029: Automation flows require confirm step; run in repo context only.
- FR-030: Cross-repo view aggregates statuses; identifies source repo per item.
- FR-031: Analytics report counts (steps completed, blockers raised) without timing/PII; toggleable.

---

## Non-Functional Requirements

### Performance

- Status read/render p50 <2s, p95 <3s for repos ≤50 workflows with devDocs present.
- Refresh and command copy actions remain non-blocking; UI stays responsive while reading local files or triggering CLI processes.

### Security

- Access limited to user-selected repo paths; no unexpected network calls.
- BYOK secrets stay local; do not log keys; VS Code variant forbids BYOK storage.
- Handle filesystem permissions gracefully and inform the user when access is blocked; redact paths in user-facing errors.

### Scalability

- Support multiple repos (one active at a time) and large workflow status files without UI degradation; surface staleness for slow reads.
- Architecture allows additional surfaces (Windows/Linux) without major UI changes; abstract shell-specific APIs.

### Accessibility

- Keyboard navigation for primary actions (repo select, open workflow, copy command, launch chat/terminal).
- Clear focus states and readable contrast aligned with the existing dark theme.

### Integration

- Compatible with BMAD CLI/workflow versions shipped in this repo; surface version and status in UI.
- Electron desktop: bundled runtime with auto-update (with defer/accept path).
- VS Code extension: uses VS Code APIs for file access and Copilot-backed chat; no embedded terminal/BYOK; respects VS Code workspace path.

### Availability & Reliability

- Critical actions (repo select, status refresh, command copy) succeed ≥99% across supported OS versions.
- Offline mode clearly indicated; destructive actions disabled when offline.

### Compliance

- Local-only data access; no regulated data flows anticipated.
- If future network integrations appear, add compliance review before release.

### Metrics and Observability

- Log local-only events for status read durations, refresh latency, copy/launch actions, and error types; no PII/keys.

## Data, Integration, and Dependencies

- Data sources: devDocs/bmm-workflow-status.yaml (status), agent/workflow definitions, docScan outputs (index, architecture, component inventory, development guide).
- IPC/API expectations: Electron shell wraps Next.js UI; filesystem access via preload/secure bridge; no direct Node access in renderer.
- VS Code variant: relies on VS Code workspace APIs for file access; no Electron APIs; Copilot-backed chat instead of BYOK.
- External dependencies: BMAD CLI installed in repo, git available for repo path checks, OS clipboard for command copy, network only for BYOK/Copilot (if configured).
- Known unknowns: Electron updater channel choice and code-signing, VS Code Copilot API constraints, offline cache size/eviction strategy.

## Architecture Handoff Prep

- Provide data-flow and IPC diagrams for: repo selection → status/doc reads → board rendering; command copy/launch paths; chat/terminal bridges.
- Include VS Code variant flow (workspace path → status/doc reads; Copilot chat).
- Add scope→FR mapping table (MVP, Growth, Vision) for architecture consumption.

## Business Rules and Edge Cases

- Offline rules: allow read-only viewing of cached status/docs; block runs/terminal when offline; label offline state.
- Repo validation: require devDocs/bmm-workflow-status.yaml and expected directories; show remediation steps if missing.
- Permissions: surface readable error if OS denies file access; allow retry after granting permission.
- Missing artifacts: graceful empty states when status/docs absent; do not crash.
- Cache refresh: show staleness timestamp; allow manual refresh; auto-refresh no more than every 60s to avoid churn.
- Jargon: define BYOK as “Bring Your Own Key” for user-provided model/chat keys.

## References

- devDocs/docScan/index.md
- devDocs/docScan/project-overview.md
- devDocs/docScan/architecture.md
- devDocs/docScan/component-inventory.md
- devDocs/docScan/development-guide.md

## Traceability and Cross-References

- Success criteria → FRs: time-to-first-status (FR-003), data fidelity (FR-003/FR-005), parity (FR-008–FR-018), reliability (FR-022–FR-025), control perception (FR-008–FR-013), update readiness (FR-007).
- Scope → FRs: MVP (FR-001–FR-018), Growth (FR-019–FR-028), Vision (FR-029–FR-031).
- Data/integration → FRs: status/doc sources and IPC (FR-003/FR-004/FR-013/FR-017).
- Future linkage: FRs will map to epics/stories in the next workflow for full coverage and sequencing.

---

## PRD Summary

- Desktop-first Mission Control that wraps the existing Next.js v0 UI in Electron, wired to live BMAD data.
- VS Code extension follows, reusing UI while swapping terminal/BYOK for Copilot chat.
- Focus on visibility, command handoff, and trustable status for BMAD workflows.

## Product Value Summary

Mission Control gives BMAD users a trustworthy, at-a-glance control room that turns method files and agents into a visible, actionable interface across desktop and VS Code.
