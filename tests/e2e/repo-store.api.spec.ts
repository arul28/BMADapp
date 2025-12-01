import path from 'path'
import os from 'os'
import fs from 'fs/promises'
import { test, expect } from '../support/fixtures';

const loadRoutes = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const restoreRoute = require('../../apps/ui/app/api/repo/restore/route').POST
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const persistRoute = require('../../apps/ui/app/api/repo/persist/route').POST
  return { restoreRoute, persistRoute }
}

test.describe('Story 1.1 — Repository store API contracts', () => {
  test.beforeEach(({ repoFixture }) => {
    process.env.BMAD_APP_DATA_DIR = path.join(os.tmpdir(), `bmad-appdata-${Date.now()}`)
    process.env.BMAD_REPO_ALLOWLIST = repoFixture.allowlistRoot()
    const targets = [
      '../../apps/ui/lib/server/repo-health',
      '../../apps/ui/app/api/repo/restore/route',
      '../../apps/ui/app/api/repo/persist/route',
    ]
    for (const target of targets) {
      try {
        const resolved = require.resolve(target)
        delete require.cache[resolved]
      } catch {
        // ignore cache misses
      }
    }
  })

  test('revalidates saved repo on launch and returns health status', async ({ repoFixture }) => {
    const { restoreRoute } = loadRoutes()
    const { repoPath, expectedArtifacts } = await repoFixture.createValidRepo();
    const canonicalRepoPath = await fs.realpath(repoPath);

    const response = await restoreRoute(
      new Request('http://localhost/api/repo/restore', { method: 'POST', body: JSON.stringify({ repoPath }) }),
    )

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.repoPath).toBe(canonicalRepoPath);
    expect(body.status).toBe('healthy');
    expect(body.artifacts).toEqual(expect.arrayContaining(expectedArtifacts));
  });

  test('rejects invalid repos and surfaces missing artifacts on persist', async ({ repoFixture }) => {
    const { persistRoute } = loadRoutes()
    const { repoPath } = await repoFixture.createInvalidRepo();

    const response = await persistRoute(
      new Request('http://localhost/api/repo/persist', { method: 'POST', body: JSON.stringify({ repoPath }) }),
    )

    expect(response.status).toBe(422);

    const body = await response.json();
    expect(body.status).toBe('unhealthy');
    expect(body.missing).toContain('bmm/config.yaml');
  });
});
