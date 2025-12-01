import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import ts from 'typescript'
import { test, expect } from '@playwright/test'

const originalCwd = process.cwd()
const originalEnv = { ...process.env }

let tmpRoot: string
let repoHealth: typeof import('../../apps/ui/lib/server/repo-health')

const CONFIG_RELATIVE = path.join('.bmad', 'bmm', 'config.yaml')
const OUTPUT_FOLDER = 'devDocs'

const writeConfigRepo = async (
  repoPath: string,
  options: { includeOutputLine?: boolean; createOutputFolder?: boolean } = {},
) => {
  const { includeOutputLine = true, createOutputFolder = true } = options
  const configPath = path.join(repoPath, CONFIG_RELATIVE)
  await fs.mkdir(path.dirname(configPath), { recursive: true })
  const lines = ['# BMM Module Configuration', 'project_name: Test Repo']
  if (includeOutputLine) {
    lines.push("output_folder: '{project-root}/devDocs'")
  }
  await fs.writeFile(configPath, lines.join('\n'), 'utf8')
  if (includeOutputLine && createOutputFolder) {
    await fs.mkdir(path.join(repoPath, OUTPUT_FOLDER), { recursive: true })
  }
}

const transpileToTmp = async (sourceRel: string, destRel: string) => {
  const sourcePath = path.join(originalCwd, sourceRel)
  const source = await fs.readFile(sourcePath, 'utf8')
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
      esModuleInterop: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
    },
    fileName: path.basename(sourcePath),
  })

  const destPath = path.join(tmpRoot, destRel)
  await fs.mkdir(path.dirname(destPath), { recursive: true })
  await fs.writeFile(destPath, transpiled.outputText, 'utf8')
  return destPath
}

test.describe('Repo health server logic', () => {
  test.beforeAll(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-health-'))
    process.chdir(tmpRoot)
    process.env.BMAD_APP_DATA_DIR = path.join(tmpRoot, 'app-data')
    process.env.BMAD_REPO_ALLOWLIST = tmpRoot
    await fs.mkdir(path.join(tmpRoot, 'devDocs', 'sprint-artifacts'), { recursive: true })

    await transpileToTmp('apps/ui/lib/repo-constants.ts', 'apps/ui/lib/repo-constants.js')
    const compiledRepoHealth = await transpileToTmp('apps/ui/lib/server/repo-health.ts', 'apps/ui/lib/server/repo-health.js')

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    repoHealth = require(compiledRepoHealth)
  })

  test.afterAll(async () => {
    process.chdir(originalCwd)
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete process.env[key]
      }
    }
    for (const [key, value] of Object.entries(originalEnv)) {
      process.env[key] = value
    }
    await fs.rm(tmpRoot, { recursive: true, force: true })
  })

  test('returns healthy when required and optional artifacts exist', async () => {
    const repoPath = path.join(tmpRoot, 'valid-repo')
    await writeConfigRepo(repoPath)

    const result = await repoHealth.validateRepo(repoPath)

    const canonicalPath = await fs.realpath(repoPath)

    expect(result.status).toBe('healthy')
    expect(result.repoPath).toBe(canonicalPath)
    expect(result.artifacts).toEqual(expect.arrayContaining([CONFIG_RELATIVE]))
    // output folder optional; when present, ensure it is captured
    expect(result.artifacts.some((a: string) => a === OUTPUT_FOLDER)).toBe(true)
  })

  test('reports missing required artifact for unhealthy repo', async () => {
    const repoPath = path.join(tmpRoot, 'invalid-repo')
    await fs.mkdir(repoPath, { recursive: true })

    const result = await repoHealth.validateRepo(repoPath)

    expect(result.status).toBe('unhealthy')
    expect(result.missing).toContain('bmm/config.yaml')
  })

  test('blocks repo outside allowlist', async () => {
    const repoPath = path.join(os.tmpdir(), 'outside-allowlist')
    await writeConfigRepo(repoPath)

    await expect(repoHealth.validateRepo(repoPath)).rejects.toMatchObject({ code: 'FORBIDDEN_REPO_PATH' })
  })

  test('fails when output folder is configured but missing', async () => {
    const repoPath = path.join(tmpRoot, 'missing-output')
    await writeConfigRepo(repoPath, { includeOutputLine: true, createOutputFolder: false })

    const result = await repoHealth.validateRepo(repoPath)

    expect(result.status).toBe('unhealthy')
    expect(result.missing).toContain('devDocs')
  })

  test('passes when only config exists and no output folder configured', async () => {
    const repoPath = path.join(tmpRoot, 'config-only')
    await writeConfigRepo(repoPath, { includeOutputLine: false })

    const result = await repoHealth.validateRepo(repoPath)

    expect(result.status).toBe('healthy')
    expect(result.artifacts).toContain(CONFIG_RELATIVE)
    expect(result.artifacts).not.toContain(OUTPUT_FOLDER)
  })

  test('persists, reads, and clears active repo record', async () => {
    const repoPath = path.join(tmpRoot, 'persisted-repo')
    await writeConfigRepo(repoPath)

    const validation = await repoHealth.validateRepo(repoPath)
    const canonicalPath = await fs.realpath(repoPath)
    expect(validation.status).toBe('healthy')

    const stateAfterPersist = await repoHealth.persistActiveRepo(validation)
    expect(stateAfterPersist.active?.repoPath).toBe(canonicalPath)
    expect(stateAfterPersist.recent[0]?.repoPath).toBe(canonicalPath)

    const stateRead = await repoHealth.readPersistedRepo()
    expect(stateRead.active?.repoPath).toBe(canonicalPath)

    const stateAfterClear = await repoHealth.clearPersistedRepo(canonicalPath)
    expect(stateAfterClear.active).toBeNull()
    expect(stateAfterClear.recent).toHaveLength(0)

    const exists = await fs
      .access(repoHealth.REPO_STATE_PATH)
      .then(() => true)
      .catch(() => false)
    expect(exists).toBe(true)
  })
})
