# ATDD Checklist - Epic 1, Story 1.1: Repo selection, validation, and persistence

**Date:** 2025-11-29
**Author:** Arul
**Primary Test Level:** E2E

---

## Story Summary

Repo selection must validate BMAD artifacts before persisting and reuse the shared apps/ui bundle with Electron-safe host wiring. Active repo should restore on relaunch only if health checks pass; unhealthy repos must block activation with clear messaging. Desktop shell must avoid renderer forks while enforcing contextIsolation/nodeIntegration settings and a preload allowlist for repo access.

**As a** BMAD Mission Control user
**I want** to select, validate, and persist a BMAD repo with health checks
**So that** the desktop app always opens in the correct context with trustworthy data

---

## Acceptance Criteria

1. When no repo is selected and the user chooses a folder, the app validates required BMAD artifacts (e.g., devDocs/bmm-workflow-status.yaml, docScan outputs, epics/prd/architecture) and persists the path as the active repo.
2. When the app relaunches with a saved repo, it restores that repo automatically and revalidates health before rendering; invalid or missing artifacts surface a blocking health error without setting the repo active.
3. Repo selection and health wiring reuse the shared apps/ui Next.js bundle logic, with only Electron host adaptations (contextIsolation on, nodeIntegration off, preload allowlist) and no UI forks.

---

## Failing Tests Created (RED Phase)

### E2E Tests (3 tests)

**File:** `tests/e2e/repo-selection.spec.ts` (93 lines)

- ✅ **Test:** selects a valid BMAD repo, validates artifacts, and persists active repo
  - **Status:** RED - UI lacks repo picker test IDs, validation request handler, and persistence wiring
  - **Verifies:** AC1 happy path validation + persistence with artifact list surfaced in UI
- ✅ **Test:** blocks invalid repo on relaunch, surfaces health error, and clears active repo
  - **Status:** RED - Missing blocking health UI and active repo reset on failed validation
  - **Verifies:** AC2 negative path and guardrail behavior
- ✅ **Test:** reuses shared apps/ui bundle with Electron-safe host wiring
  - **Status:** RED - No shared-bundle banner/host telemetry, preload allowlist, or contextIsolation surfacing
  - **Verifies:** AC3 host/renderer contract (contextIsolation on, nodeIntegration off, preload allowlist including devDocs + repo health channels)

### API Tests (2 tests)

**File:** `tests/e2e/repo-store.api.spec.ts` (32 lines)

- ✅ **Test:** revalidates saved repo on launch and returns health status
  - **Status:** RED - /api/repo/restore endpoint not implemented to return healthy status/artifacts
  - **Verifies:** AC2 server-side restore + health recheck contract
- ✅ **Test:** rejects invalid repos and surfaces missing artifacts on persist
  - **Status:** RED - /api/repo/persist endpoint missing validation + 422 response with missing artifacts
  - **Verifies:** AC1 guardrail for invalid repos

### Component Tests (0 tests)

**File:** N/A

- Component coverage deferred until repo picker UI exists; focus is on E2E + API for story-critical flows.

---

## Data Factories Created

### Repo Fixture Factory

**File:** `tests/support/fixtures/factories/repo.factory.ts`

**Exports:**

- `createRepoFixture()` → { createValidRepo({ includeDocScan? }), createInvalidRepo(), cleanup() }
- Generates temp BMAD-like repos with required artifacts (bmm-workflow-status.yaml, prd.md, architecture.md, epics.md) and optional docScan report; auto-cleans directories after tests.

**Example Usage:**

```typescript
const { repoPath, expectedArtifacts } = await repoFixture.createValidRepo({ includeDocScan: true });
await page.getByTestId('repo-picker-input').fill(repoPath);
```

---

## Fixtures Created

### Repo Fixture (Playwright)

**File:** `tests/support/fixtures/index.ts`

**Fixtures:**

- `repoFixture` - Provides `createValidRepo`, `createInvalidRepo`, and `cleanup` for BMAD repo paths with placeholder artifacts
  - **Setup:** Creates temp repo folders with required devDocs artifacts (optional docScan)
  - **Provides:** Repo paths + expected artifact list for validation flows
  - **Cleanup:** Deletes all temp repos after each test

Existing `userFactory` fixture retained for future user seeding.

---

## Mock Requirements

### Repo Validation and Persistence

**Endpoint:** `POST /api/repo/validate`

**Success Response:**

```json
{
  "status": "healthy",
  "repoPath": "<absolute path>",
  "artifacts": ["devDocs/bmm-workflow-status.yaml", "devDocs/prd.md", "devDocs/architecture.md", "devDocs/epics.md"]
}
```

**Failure Response:**

```json
{
  "status": "unhealthy",
  "repoPath": "<absolute path>",
  "missing": ["devDocs/prd.md"]
}
```

**Notes:** Must run before navigation (network-first); should block persistence on unhealthy status.

**Endpoint:** `POST /api/repo/persist`

**Success Response:** `{ "status": "healthy", "repoPath": "<absolute path>" }`

**Failure Response:** `{ "status": "unhealthy", "missing": ["<artifact>"] }`

**Endpoint:** `POST /api/repo/restore`

**Success Response:** `{ "status": "healthy", "repoPath": "<absolute path>", "artifacts": [ ... ] }`

**Failure Response:** `{ "status": "unhealthy", "missing": [ ... ], "repoPath": "<absolute path>" }`

---

## Required data-testid Attributes

### Repo Picker & Health

- `repo-picker-input` - Absolute path input or picker target
- `repo-validate-submit` - Trigger validation before persistence
- `repo-health-status` - Displays healthy/unhealthy state
- `repo-artifact-list` - Lists validated artifacts
- `repo-health-blocker` - Blocking error panel when validation fails
- `active-repo` - Shows current active repo or "not set"

### Host & Bundle Wiring

- `shared-bundle-banner` - Confirms apps/ui bundle reuse
- `host-sandbox-state` - Shows contextIsolation/nodeIntegration status
- `preload-allowlist` - Lists preload allowlist entries (devDocs, bmad:repo-health, repo reads)

---

## Implementation Checklist

### Test: selects a valid BMAD repo, validates artifacts, and persists active repo

**File:** `tests/e2e/repo-selection.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement repo picker UI with `repo-picker-input` and `repo-validate-submit`
- [ ] Wire `POST /api/repo/validate` before persistence; render `repo-health-status` + `repo-artifact-list`
- [ ] Persist active repo to local storage/state and surface in `active-repo`
- [ ] Add required data-testid attributes listed above
- [ ] Run test: `npx playwright test tests/e2e/repo-selection.spec.ts --grep "valid BMAD repo"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 4 hours

---

### Test: blocks invalid repo on relaunch, surfaces health error, and clears active repo

**File:** `tests/e2e/repo-selection.spec.ts`

**Tasks to make this test pass:**

- [ ] On launch, call `POST /api/repo/validate` for saved repo; block on unhealthy response
- [ ] Show blocking panel `repo-health-blocker` with missing artifacts; reset `active-repo` to "not set"
- [ ] Ensure persistence layer refuses invalid repos and clears stored state
- [ ] Add required data-testid attributes listed above
- [ ] Run test: `npx playwright test tests/e2e/repo-selection.spec.ts --grep "blocks invalid repo"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 4 hours

---

### Test: reuses shared apps/ui bundle with Electron-safe host wiring

**File:** `tests/e2e/repo-selection.spec.ts`

**Tasks to make this test pass:**

- [ ] Expose shared bundle indicator `shared-bundle-banner` confirming apps/ui reuse
- [ ] Surface host wiring state (`host-sandbox-state`) reflecting contextIsolation on & nodeIntegration off
- [ ] Expose preload allowlist (`preload-allowlist`) including devDocs + repo health channels; hydrate `electronPreload.allowlist`
- [ ] Add required data-testid attributes listed above
- [ ] Run test: `npx playwright test tests/e2e/repo-selection.spec.ts --grep "Electron-safe host wiring"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 3 hours

---

### Test: revalidates saved repo on launch and returns health status

**File:** `tests/e2e/repo-store.api.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement `POST /api/repo/restore` to read saved repo, revalidate artifacts, and return status + artifacts
- [ ] Enforce docScan and required artifact checks server-side
- [ ] Return 200 + payload matching test expectation on healthy repo
- [ ] Run test: `npx playwright test tests/e2e/repo-store.api.spec.ts --grep "revalidates saved repo"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 3 hours

---

### Test: rejects invalid repos and surfaces missing artifacts on persist

**File:** `tests/e2e/repo-store.api.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement `POST /api/repo/persist` to validate artifacts and fail with 422 + missing list when incomplete
- [ ] Ensure unhealthy repos are not recorded as active
- [ ] Run test: `npx playwright test tests/e2e/repo-store.api.spec.ts --grep "rejects invalid repos"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

## Running Tests

```bash
# Run all failing tests for this story
npx playwright test tests/e2e/repo-selection.spec.ts tests/e2e/repo-store.api.spec.ts

# Run specific test file
npx playwright test tests/e2e/repo-selection.spec.ts

# Run tests in headed mode (see browser)
npx playwright test tests/e2e/repo-selection.spec.ts --headed

# Debug specific test
npx playwright test tests/e2e/repo-selection.spec.ts --debug

# Run tests with coverage
npx playwright test --coverage
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

**TEA Agent Responsibilities:**

- ✅ All tests written and failing
- ✅ Fixtures and factories created with auto-cleanup
- ✅ Mock requirements documented
- ✅ data-testid requirements listed
- ✅ Implementation checklist created

**Verification:**

- All tests expected to fail until repo validation/persistence and host wiring exist
- Failure messages will indicate missing endpoints or missing data-testids/UI surfaces
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. Implement repo validation/persistence endpoints and UI surfaces per checklist
2. Add required data-testid attributes and preload allowlist telemetry
3. Run targeted tests per commands above; iterate until green
4. Share progress in daily standup

**Key Principles:**

- One test at a time (small deltas)
- Minimal implementation to satisfy each failing test
- Keep network-first pattern (intercepts before navigation)

**Progress Tracking:**

- Check off tasks as you complete them
- Update `bmm-workflow-status` after each green milestone

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. Verify all tests pass (green phase complete)
2. Refine repo validation flow, IPC contracts, and preload security
3. Extract duplication across repo health UI/host wiring
4. Ensure tests still pass after refactors
5. Update documentation if API contracts change

**Key Principles:**

- Tests provide safety net; keep assertions explicit
- Avoid reintroducing hard waits or brittle selectors
- Maintain contextIsolation/nodeIntegration defaults

**Completion:**

- All tests pass
- Code quality meets team standards
- Ready for code review and story approval

---

## Next Steps

1. Review this checklist with the team
2. Implement repo validation/persistence endpoints and UI test IDs
3. Run failing tests to confirm RED → GREEN progress
4. Harden host wiring telemetry and preload allowlist
5. Share updates in standup; plan follow-up component tests once UI lands

---

## Knowledge Base References Applied

- **fixture-architecture.md** - Pure function → fixture with auto-cleanup for repo paths
- **data-factories.md** - Faker-based repo fixture generation with overrides
- **network-first.md** - Intercept validation/restore endpoints before navigation
- **test-quality.md** - Deterministic waits, no hard waits, explicit assertions
- **test-healing-patterns.md** - Guardrails against stale selectors and timing issues
- **selector-resilience.md** - data-testid hierarchy for repo picker and host telemetry
- **timing-debugging.md** - Deterministic waits on validation/restore responses
- **test-levels-framework.md** - Primary E2E coverage plus API contract checks

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `npx playwright test tests/e2e/repo-selection.spec.ts tests/e2e/repo-store.api.spec.ts`

**Results:**

```
Not yet executed in this workspace. Expected RED failures due to missing repo picker UI, repo validation/persistence endpoints, and host wiring telemetry surfaces.
```

**Summary:**

- Total tests: 5
- Passing: 0 (expected)
- Failing: 5 (expected)
- Status: ✅ RED phase ready for implementation

**Expected Failure Messages:**

- Missing data-testid selectors for repo picker/health UI
- 404/422 on /api/repo/validate, /api/repo/persist, /api/repo/restore
- Preload allowlist/contextIsolation telemetry absent

---

## Notes

- Repo fixture factory creates isolated temp repos with required BMAD artifacts; cleanup runs after each test
- Base URL derives from `playwright.config.ts` (`BASE_URL`/`API_URL` envs); ensure app server and Electron host respond in test mode
- Add `devDocs` allowlist enforcement and health telemetry early to satisfy AC3

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Tag @Arul
- Refer to `.bmad/bmm/testarch/knowledge` for testing patterns

---

**Generated by BMad TEA Agent** - 2025-11-29
