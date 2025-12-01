# Sprint Change Proposal — Solutioning TEA Additions (Test Framework Setup, CI/CD Pipeline)

Date: 2025-11-29
Author: Arul
Mode: Batch

## Section 1: Issue Summary

- Change trigger: Added two new Solutioning workflows for the TEA agent in `apps/ui/lib/bmad-data.ts` — "Test Framework Setup" (`bmad framework`, id `solutioning-framework`) and "CI/CD Pipeline Setup" (`bmad ci`, id `solutioning-ci`).
- Context: Solutioning phase now has three TEA-driven workflows (validate architecture → test framework setup → CI/CD setup) before implementation readiness.
- Objective: Ensure BMAD documentation reflects the new workflows without adding new stories; fold expectations into existing Epic 1 Story 1.3 (board render) and keep Story 1.1 intact.

## Section 2: Impact Analysis

- Epic impact: Epic 1 remains the home; expectations live inside Story 1.3 (board render) instead of new stories. Story 1.1 stays untouched.
- Story impact: Update Story 1.3 acceptance to require Solutioning TEA cards (framework/CI/CD) render with valid status icons, persisted commands, and ordering. No new stories added.
- Artifact impact:
  - `devDocs/bmm-workflow-status.yaml`: Leave as-is (no status edits).
  - `devDocs/epics.md`: Update Story 1.3 acceptance to cover the new Solutioning cards.
  - `devDocs/sprint-artifacts/sprint-status.yaml`: Remove added story slugs; keep existing list.
  - `devDocs/sprint-artifacts/epic_tech_spec/tech-spec-epic-1.md`: Note Solutioning sequence change under Story 1.3 coverage.
- Technical impact: Ensure valid status keys and persistent command edits for `bmad framework`/`bmad ci`; handled via board rendering logic in Story 1.3.

## Section 3: Recommended Approach

- Path: Direct adjustment without new stories; fold requirements into Story 1.3 acceptance and keep status file untouched.
- Rationale: Keeps workflow card expectations with the board-render story, mirrors how other cards are handled, and prevents story inflation.
- Effort/Risk: Low effort, low risk; main check is Story 1.3 acceptance coverage and status-key validity in UI data.

## Section 4: Detailed Change Proposals

- Workflow status: No changes; rely on UI data definitions and existing status file.
- Epics: Update Story 1.3 acceptance to explicitly include the TEA Solutioning cards (framework, CI/CD) with valid statuses and persisted commands; no new stories.
- Sprint tracking: Keep existing story list; do not add new slugs.
- Epic tech spec: Note the Solutioning sequence now includes the TEA-led framework and CI/CD setup, covered by Story 1.3 acceptance.

## Section 5: Implementation Handoff

- Change scope: Minor — documentation alignment only (no new stories, no status file edits).
- Handoff: Keep Solutioning cards visible and executable under Story 1.3; ensure commands `bmad framework` and `bmad ci` remain editable/persistent and use valid status keys in UI data.
- Success criteria:
  - Solutioning board shows both new cards with status icons and editable commands.
  - Epics reflect the requirement inside Story 1.3; sprint-status unchanged; Story 1.1 untouched.
  - No invalid status values causing UI render errors.
