import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs/promises'
import os from 'os'

const Module = require('module')

const electronMock = {
  contextBridge: {
    exposeInMainWorld: () => {},
  },
}

const originalLoad = Module._load
Module._load = (request, parent, isMain) => {
  if (request === 'electron') return electronMock
  return originalLoad(request, parent, isMain)
}

const config = require('../../apps/desktop/config')
const preload = require('../../apps/desktop/preload')

Module._load = originalLoad

test.describe('Electron host configuration', () => {
  test('enforces preload hardening and IPC allowlist', async () => {
    expect(config.browserWindowOptions.webPreferences.contextIsolation).toBe(true)
    expect(config.browserWindowOptions.webPreferences.nodeIntegration).toBe(false)
    expect(config.browserWindowOptions.webPreferences.sandbox).toBe(false)
    expect(config.browserWindowOptions.webPreferences.preload).toBe(path.join(path.dirname(config.PRELOAD_PATH), 'preload.js'))
    expect(config.DEFAULT_URL.startsWith('file://')).toBe(true)
    expect(config.IPC_ALLOWLIST).toEqual(expect.arrayContaining(['bmad:repo-health', 'bmad:read-status', 'bmad:read-doc']))
  })

  test('preload exposes repo health API and devDocs allowlist', async () => {
    expect(preload.IPC_ALLOWLIST).toEqual(expect.arrayContaining(['bmad:repo-health']))
    expect(preload.ALLOWED_DOC_PREFIX).toBe('devDocs')
    expect(preload.api.allowedRoots.length).toBeGreaterThan(0)
    expect(typeof preload.api.repoHealth).toBe('function')
    expect(typeof preload.api.persistRepo).toBe('function')
    expect(typeof preload.api.restoreRepo).toBe('function')
    expect(typeof preload.api.removeRepo).toBe('function')
  })

  test('preload repoHealth enforces config-only gate and output readability', async () => {
    const repoPath = path.join(os.homedir(), `bmad-preload-${Date.now()}`)
    const configPath = path.join(repoPath, '.bmad', 'bmm', 'config.yaml')
    await fs.mkdir(path.dirname(configPath), { recursive: true })
    await fs.writeFile(configPath, [
      '# BMM Module Configuration',
      'project_name: Preload Repo',
      "output_folder: '{project-root}/devDocs'",
    ].join('\n'))

    const first = await preload.api.repoHealth(repoPath)
    expect(first.status).toBe('unhealthy')
    expect(first.missing).toContain('devDocs')

    await fs.mkdir(path.join(repoPath, 'devDocs'), { recursive: true })
    const second = await preload.api.repoHealth(repoPath)
    expect(second.status).toBe('healthy')
    expect(second.artifacts.some((a: string) => a.endsWith('config.yaml'))).toBe(true)
    expect(second.artifacts).toEqual(expect.arrayContaining(['devDocs']))

    await fs.rm(repoPath, { recursive: true, force: true })
  })
})
