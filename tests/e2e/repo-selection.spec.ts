import path from 'path'
import os from 'os'
import fs from 'fs/promises'
import { test, expect } from '../support/fixtures'

const loadRoutes = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const validateRoute = require('../../apps/ui/app/api/repo/validate/route').POST
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const persistRoute = require('../../apps/ui/app/api/repo/persist/route').POST
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const restoreRoute = require('../../apps/ui/app/api/repo/restore/route').POST
  return { validateRoute, persistRoute, restoreRoute }
}

test.describe('Story 1.1 — Repo selection, validation, and persistence (config gate)', () => {
  test.beforeEach(({ repoFixture }) => {
    process.env.BMAD_APP_DATA_DIR = path.join(os.tmpdir(), `bmad-appdata-${Date.now()}`)
    process.env.BMAD_REPO_ALLOWLIST = repoFixture.allowlistRoot()
    const targets = [
      '../../apps/ui/lib/server/repo-health',
      '../../apps/ui/app/api/repo/validate/route',
      '../../apps/ui/app/api/repo/persist/route',
      '../../apps/ui/app/api/repo/restore/route',
    ]
    for (const target of targets) {
      try {
        // eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires
        const resolved = require.resolve(target)
        delete require.cache[resolved]
      } catch {
        // ignore cache misses
      }
    }
  })

  test('[P0] validates healthy repo when config exists and persists active+recent state', async ({ repoFixture }) => {
    const { validateRoute, persistRoute } = loadRoutes()
    const { repoPath, expectedArtifacts } = await repoFixture.createValidRepo()
    const canonicalRepoPath = await fs.realpath(repoPath)

    const validateResponse = await validateRoute(
      new Request('http://localhost/api/repo/validate', { method: 'POST', body: JSON.stringify({ repoPath }) }),
    )
    expect(validateResponse.status).toBe(200)
    const validateBody = await validateResponse.json()
    expect(validateBody.status).toBe('healthy')
    expect(validateBody.artifacts).toEqual(expect.arrayContaining(expectedArtifacts))

    const persistResponse = await persistRoute(
      new Request('http://localhost/api/repo/persist', { method: 'POST', body: JSON.stringify({ repoPath }) }),
    )
    expect(persistResponse.status).toBe(200)
    const persistBody = await persistResponse.json()
    expect(persistBody.state?.active?.repoPath).toBe(canonicalRepoPath)
    expect(persistBody.state?.recent[0]?.repoPath).toBe(canonicalRepoPath)
    expect(persistBody.state?.active?.artifacts).toEqual(expect.arrayContaining(expectedArtifacts))
  })

  test('[P0] restore revalidates and clears active on unhealthy repo', async ({ repoFixture }) => {
    const { persistRoute, restoreRoute } = loadRoutes()
    const { repoPath } = await repoFixture.createInvalidRepo()

    const persistResponse = await persistRoute(
      new Request('http://localhost/api/repo/persist', { method: 'POST', body: JSON.stringify({ repoPath }) }),
    )
    expect(persistResponse.status).toBe(422)
    const persistBody = await persistResponse.json()
    expect(persistBody.state?.active).toBeNull()

    const restoreResponse = await restoreRoute(
      new Request('http://localhost/api/repo/restore', { method: 'POST', body: JSON.stringify({ repoPath }) }),
    )
    expect(restoreResponse.status).toBe(422)
    const restoreBody = await restoreResponse.json()
    expect(restoreBody.status).toBe('unhealthy')
    expect(restoreBody.missing).toContain('bmm/config.yaml')
    expect(restoreBody.state?.active).toBeNull()
  })

  test('[P1] fails when output folder configured but unreadable', async ({ repoFixture }) => {
    const { validateRoute } = loadRoutes()
    const { repoPath } = await repoFixture.createValidRepo({ includeOutputFolder: false, includeOutputLine: true })

    const validateResponse = await validateRoute(
      new Request('http://localhost/api/repo/validate', { method: 'POST', body: JSON.stringify({ repoPath }) }),
    )

    expect(validateResponse.status).toBe(422)
    const body = await validateResponse.json()
    expect(body.status).toBe('unhealthy')
    expect(body.missing).toContain('devDocs')
  })

  test('[P1] rejects repos outside allowlist', async () => {
    const { validateRoute } = loadRoutes()
    const forbiddenPath = '/tmp/forbidden-repo'
    const response = await validateRoute(
      new Request('http://localhost/api/repo/validate', { method: 'POST', body: JSON.stringify({ repoPath: forbiddenPath }) }),
    )
    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body.code).toBe('FORBIDDEN_REPO_PATH')
  })

  test('[P1] restore returns persisted repo state and artifacts', async ({ repoFixture }) => {
    const { persistRoute, restoreRoute } = loadRoutes()
    const { repoPath, expectedArtifacts } = await repoFixture.createValidRepo()
    const canonicalRepoPath = await fs.realpath(repoPath)

    await persistRoute(
      new Request('http://localhost/api/repo/persist', { method: 'POST', body: JSON.stringify({ repoPath }) }),
    )

    const restoreResponse = await restoreRoute(
      new Request('http://localhost/api/repo/restore', { method: 'POST', body: JSON.stringify({ repoPath }) }),
    )
    expect(restoreResponse.status).toBe(200)
    const body = await restoreResponse.json()
    expect(body.status).toBe('healthy')
    expect(body.repoPath).toBe(canonicalRepoPath)
    expect(body.artifacts).toEqual(expect.arrayContaining(expectedArtifacts))
    expect(body.state?.active?.repoPath).toBe(canonicalRepoPath)
    expect(body.state?.recent.length).toBeGreaterThan(0)
  })
})
