const { contextBridge, ipcRenderer } = require('electron');
let fs;
let path;
let repoModule;
let preloadInitError = null;

try {
  fs = require('node:fs/promises');
  path = require('node:path');

  repoModule = require('./runtime/repo-health');
} catch (error) {
  preloadInitError = error instanceof Error ? error : new Error(String(error));
  // minimal fallbacks to keep bridge defined
  fs = require('node:fs/promises');
  path = require('node:path');
  repoModule = {
    validateRepo: async () => ({ status: 'unhealthy', error: preloadInitError?.message ?? 'preload-init-failed' }),
    persistActiveRepo: async () => ({ active: null, recent: [] }),
    readPersistedRepo: async () => ({ active: null, recent: [] }),
    clearPersistedRepo: async () => ({ active: null, recent: [] }),
    removeRepo: async () => ({ active: null, recent: [] }),
    RepoPathError: Error,
    APP_DATA_ROOT: '',
    ALLOWED_ROOTS: [],
  };
}

const { validateRepo, RepoPathError, APP_DATA_ROOT, ALLOWED_ROOTS, persistActiveRepo, readPersistedRepo, clearPersistedRepo, removeRepo } =
  repoModule;

const IPC_ALLOWLIST = ['bmad:repo-health', 'bmad:read-status', 'bmad:read-doc'];
const ALLOWED_DOC_PREFIX = 'devDocs';

function assertRepoScoped(repoPath, targetPath) {
  const normalizedRepo = path.resolve(repoPath);
  const normalizedTarget = path.resolve(targetPath);
  const withinRepo =
    normalizedTarget === normalizedRepo ||
    (!path.relative(normalizedRepo, normalizedTarget).startsWith('..') &&
      !path.isAbsolute(path.relative(normalizedRepo, normalizedTarget)));
  if (!withinRepo) {
    throw new RepoPathError('Path outside repo scope', 403, 'FORBIDDEN_REPO_PATH');
  }
}

function assertDocPath(relativePath) {
  if (!relativePath || relativePath.includes('..')) {
    throw new RepoPathError('Invalid doc path', 400, 'INVALID_REPO_PATH');
  }
  if (!relativePath.startsWith(ALLOWED_DOC_PREFIX)) {
    throw new RepoPathError('Doc path must be under devDocs', 403, 'FORBIDDEN_REPO_PATH');
  }
}

async function readFileSafe(repoPath, relativePath) {
  assertDocPath(relativePath);
  const targetPath = path.join(repoPath, relativePath);
  assertRepoScoped(repoPath, targetPath);
  const content = await fs.readFile(targetPath, 'utf8');
  const stats = await fs.stat(targetPath);
  return { content, updatedAt: stats.mtime.toISOString(), path: targetPath };
}

const api = {
  ipcAllowlist: IPC_ALLOWLIST,
  appDataRoot: APP_DATA_ROOT,
  allowedRoots: ALLOWED_ROOTS,
  preloadInitError: preloadInitError ? preloadInitError.message : null,
  async chooseRepo() {
    try {
      return await ipcRenderer.invoke('bmad:choose-repo');
    } catch {
      return null;
    }
  },
  async repoHealth(repoPath) {
    return validateRepo(repoPath);
  },
  async persistRepo(repoPath, displayName) {
    const validation = await validateRepo(repoPath, displayName);
    if (validation.status === 'unhealthy') {
      const state = await clearPersistedRepo(validation.repoPath);
      return { ...validation, state };
    }
    const state = await persistActiveRepo(validation);
    return { ...validation, state };
  },
  async restoreRepo(repoPath) {
    const state = await readPersistedRepo();
    const targetPath = repoPath && repoPath.trim().length > 0 ? repoPath : state.active?.repoPath;
    if (!targetPath) {
      return { status: 'unhealthy', message: 'No repo to restore', state };
    }
    const validation = await validateRepo(targetPath);
    if (validation.status === 'unhealthy') {
      const nextState = await clearPersistedRepo(validation.repoPath);
      return { ...validation, state: nextState };
    }
    const nextState = await persistActiveRepo(validation);
    return { ...validation, state: nextState };
  },
  async removeRepo(repoPath) {
    const state = await removeRepo(repoPath);
    return { state };
  },
  async readStatus(repoPath) {
    const statusPath = 'devDocs/bmm-workflow-status.yaml';
    return readFileSafe(repoPath, statusPath);
  },
  async readDoc(repoPath, relativePath) {
    return readFileSafe(repoPath, relativePath);
  },
};

if (contextBridge && typeof contextBridge.exposeInMainWorld === 'function') {
  contextBridge.exposeInMainWorld('bmad', api);
}

// Fallback exposure for environments where contextBridge is unavailable
try {
  if (typeof globalThis !== 'undefined') {
    globalThis.bmad = api;
  }
} catch {
  // ignore
}

module.exports = {
  IPC_ALLOWLIST,
  ALLOWED_DOC_PREFIX,
  api,
};
