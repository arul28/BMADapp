# Playwright E2E Suite

This scaffolds a production-ready Playwright (TypeScript) test bed with fixture composition, data factories, deterministic network handling, and failure-only artifacts.

## Getting Started

1. Use Node 22: `nvm use 22`
2. Install deps (root): `npm install`
3. Install browsers: `npx playwright install --with-deps`
4. Configure env: copy `.env.example` to `.env` and set `BASE_URL`, `API_URL`, `TEST_ENV`
5. Start the app (example): `npm run dev` or `pnpm dev` inside `apps/ui`
6. Run tests: `npm run test:e2e`

## Key Files

- `playwright.config.ts` — env map + timeout standards (action 15s, navigation 30s, expect 10s, test 60s), HTML + JUnit reporters, failure-only artifacts, multi-browser projects.
- `tests/support/fixtures/index.ts` — merge-friendly fixture surface; auto-cleanup for factories.
- `tests/support/fixtures/factories/user-factory.ts` — faker-driven API seeding with teardown.
- `tests/e2e/example.spec.ts` — network-first navigation sample and factory-backed test (skips if `API_URL` absent).
- `.env.example` — defaults for `BASE_URL`, `API_URL`, `TEST_ENV`.

## Practices Applied (from TEA knowledge base)

- Fixture Architecture: pure functions wrapped in fixtures; auto-cleanup in teardown to keep tests parallel-safe.
- Data Factories: faker-based payloads with overrides; API-first seeding instead of UI setup.
- Network-First: register waits/mocks before navigation; await responses instead of hard waits.
- Config Guardrails: env map + fail-fast `TEST_ENV`; standardized timeouts and failure-only artifacts.
- Test Quality: no hard waits, explicit assertions in tests, unique data, <300 lines per test.

## Running & Debugging

- Target environments: set `TEST_ENV=local|staging|production` (defaults to `local`).
- Override base URL/API: set `BASE_URL` and `API_URL` in `.env` (config reads them).
- Reports/artifacts: `test-results/` (screenshots/videos/traces on failure), HTML report at `test-results/html`.
- Common flags: `npm run test:e2e -- --headed`, `--project=chromium`, `--grep @tag`, `--ui` for Playwright UI.

## Next Steps

- Add feature-focused fixtures (auth, network mocks, logging) using the same pattern and merge them via `mergeTests` if needed.
- Layer factories for other domains (accounts, orders, feature flags) with per-test cleanup.
- Wire CI to upload `test-results/` and `test-results/html` on failure.
