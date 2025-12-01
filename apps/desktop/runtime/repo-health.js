const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const os = require('node:os');
const path = require('node:path');

class RepoPathError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const RECENT_LIMIT = 5;
const APP_DATA_ROOT = process.env.BMAD_APP_DATA_DIR ? path.resolve(process.env.BMAD_APP_DATA_DIR) : path.join(os.homedir(), '.bmadapp');
const REPO_STATE_PATH = path.join(APP_DATA_ROOT, 'repository-state.json');
const CONFIG_BASENAME = 'config.yaml';
const CONFIG_DIR_NAME = 'bmm';
const SEARCH_MAX_DEPTH = 5;
const IGNORED_DIRS = new Set(['.git', 'node_modules', '.next', 'dist', 'build', 'out']);

const REQUIRED_ARTIFACTS = ['bmm/config.yaml'];
const OPTIONAL_ARTIFACTS = [];

const DEFAULT_ALLOWED_ROOTS = [os.homedir(), process.cwd()];
const ENV_ALLOWED_ROOTS = process.env.BMAD_REPO_ALLOWLIST
  ? process.env.BMAD_REPO_ALLOWLIST.split(path.delimiter)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => path.resolve(p))
  : [];

function computeAllowedRoots() {
  const roots = [...new Set([...DEFAULT_ALLOWED_ROOTS, ...ENV_ALLOWED_ROOTS])].map((p) => path.resolve(p));
  const expanded = new Set(roots);

  for (const root of roots) {
    try {
      const real = fsSync.realpathSync(root);
      expanded.add(real);
    } catch {
      // ignore missing
    }
  }

  return [...expanded];
}

let ALLOWED_ROOTS = computeAllowedRoots();

function isPathInside(basePath, targetPath) {
  const relative = path.relative(basePath, targetPath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function normalizeRepoPath(repoPath) {
  const trimmed = repoPath.trim();
  if (!trimmed) {
    throw new RepoPathError('repoPath is required', 400, 'INVALID_REPO_PATH');
  }

  const resolved = path.resolve(trimmed);
  if (!path.isAbsolute(resolved)) {
    throw new RepoPathError('repoPath must be absolute', 400, 'INVALID_REPO_PATH');
  }

  return resolved;
}

async function resolveCanonicalPath(repoPath) {
  try {
    return await fs.realpath(repoPath);
  } catch {
    return repoPath;
  }
}

function assertAllowedRepoPath(repoPath) {
  const allowed = ALLOWED_ROOTS.some((root) => isPathInside(root, repoPath));
  if (!allowed) {
    throw new RepoPathError('repoPath is outside the allowed roots', 403, 'FORBIDDEN_REPO_PATH');
  }
}

async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function directoryExists(targetPath) {
  try {
    const stats = await fs.stat(targetPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function readableDirectory(targetPath) {
  try {
    const stats = await fs.stat(targetPath);
    if (!stats.isDirectory()) return false;
    await fs.access(targetPath, fsSync.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function ensureAppDataDir() {
  await fs.mkdir(APP_DATA_ROOT, { recursive: true });
}

async function findConfigInDir(dirPath) {
  const candidate = path.join(dirPath, CONFIG_DIR_NAME, CONFIG_BASENAME);
  if (await fileExists(candidate)) return candidate;
  const direct = path.join(dirPath, CONFIG_BASENAME);
  const isConfig = path.basename(dirPath).toLowerCase() === CONFIG_DIR_NAME && (await fileExists(direct));
  if (isConfig) return direct;
  return null;
}

async function findBmmConfig(repoRoot) {
  const normalizedRoot = path.resolve(repoRoot);
  const preferred = [
    path.join(normalizedRoot, '.bmad', CONFIG_DIR_NAME, CONFIG_BASENAME),
    path.join(normalizedRoot, CONFIG_DIR_NAME, CONFIG_BASENAME),
  ];
  for (const candidate of preferred) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  const queue = [{ dir: normalizedRoot, depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current.depth > SEARCH_MAX_DEPTH) continue;

    const configInDir = await findConfigInDir(current.dir);
    if (configInDir) return configInDir;

    let entries = [];
    try {
      entries = fsSync.readdirSync(current.dir, { withFileTypes: true });
    } catch {
      // ignore unreadable directories
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (IGNORED_DIRS.has(entry.name)) continue;
      const nextDir = path.join(current.dir, entry.name);
      queue.push({ dir: nextDir, depth: current.depth + 1 });
    }
  }

  return null;
}

function extractOutputFolder(rawConfig) {
  const lines = rawConfig.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^output_folder:\s*(.+)$/i);
    if (match) {
      let value = match[1].trim();
      const quoted = (value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'));
      if (quoted) value = value.slice(1, -1);
      return value;
    }
  }
  return;
}

async function readRepositoryState() {
  await ensureAppDataDir();
  if (!fsSync.existsSync(REPO_STATE_PATH)) {
    return { active: null, recent: [] };
  }

  try {
    const raw = await fs.readFile(REPO_STATE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      active: parsed.active ?? null,
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
    };
  } catch {
    return { active: null, recent: [] };
  }
}

async function writeRepositoryState(state) {
  await ensureAppDataDir();
  await fs.writeFile(REPO_STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

function toPersistedRecord(result) {
  const now = new Date().toISOString();
  return {
    repoPath: result.repoPath,
    artifacts: result.artifacts,
    validatedAt: result.validatedAt,
    lastActiveAt: now,
    displayName: result.displayName,
  };
}

function upsertRecent(recent, record) {
  const filtered = recent.filter((entry) => entry.repoPath !== record.repoPath);
  const next = [record, ...filtered];
  return next.slice(0, RECENT_LIMIT);
}

async function validateRepo(repoPath, displayName) {
  const resolvedRepoPath = normalizeRepoPath(repoPath);
  assertAllowedRepoPath(resolvedRepoPath);

  const canonicalRepoPath = await resolveCanonicalPath(resolvedRepoPath);
  assertAllowedRepoPath(canonicalRepoPath);

  const validatedAt = new Date().toISOString();
  const missing = [];
  const foundArtifacts = [];

  const repoDirExists = await directoryExists(canonicalRepoPath);
  if (!repoDirExists) {
    return {
      status: 'unhealthy',
      repoPath: canonicalRepoPath,
      missing: [...REQUIRED_ARTIFACTS],
      validatedAt,
      displayName,
    };
  }

  const configPath = await findBmmConfig(canonicalRepoPath);
  if (!configPath) {
    return {
      status: 'unhealthy',
      repoPath: canonicalRepoPath,
      missing: [...REQUIRED_ARTIFACTS],
      validatedAt,
      displayName,
    };
  }

  const configRelative = path.relative(canonicalRepoPath, configPath);
  foundArtifacts.push(configRelative);

  let outputFolder;
  try {
    const rawConfig = await fs.readFile(configPath, 'utf8');
    const outputToken = extractOutputFolder(rawConfig);
    if (outputToken && outputToken.trim().length > 0) {
      const templated = outputToken.replaceAll(/\{project-root\}/gi, canonicalRepoPath);
      const outputPath = path.isAbsolute(templated) ? path.normalize(templated) : path.normalize(path.join(canonicalRepoPath, templated));
      outputFolder = outputPath;
      const relativeOutput = path.relative(canonicalRepoPath, outputPath) || '.';
      if (await readableDirectory(outputPath)) {
        foundArtifacts.push(relativeOutput);
      } else {
        missing.push(relativeOutput);
      }
    }
  } catch {
    missing.push(...REQUIRED_ARTIFACTS);
  }

  for (const artifact of OPTIONAL_ARTIFACTS) {
    const artifactPath = path.join(canonicalRepoPath, artifact);

    const exists = await fileExists(artifactPath);
    if (exists) {
      foundArtifacts.push(artifact);
    }
  }

  if (missing.length > 0) {
    return {
      status: 'unhealthy',
      repoPath: canonicalRepoPath,
      missing,
      validatedAt,
      displayName,
      configPath: configPath ?? undefined,
      outputFolder,
    };
  }

  return {
    status: 'healthy',
    repoPath: canonicalRepoPath,
    artifacts: foundArtifacts,
    validatedAt,
    displayName,
    configPath,
    outputFolder,
  };
}

async function persistActiveRepo(result) {
  const state = await readRepositoryState();
  const record = toPersistedRecord(result);
  const nextState = {
    active: record,
    recent: upsertRecent(state.recent, record),
  };
  await writeRepositoryState(nextState);
  return nextState;
}

async function clearPersistedRepo(failedRepoPath) {
  const state = await readRepositoryState();
  const filteredRecent = failedRepoPath ? state.recent.filter((entry) => entry.repoPath !== failedRepoPath) : state.recent;
  const nextState = { active: null, recent: filteredRecent };
  await writeRepositoryState(nextState);
  return nextState;
}

async function readPersistedRepo() {
  return readRepositoryState();
}

async function removeRepo(repoPath) {
  const normalized = normalizeRepoPath(repoPath);
  assertAllowedRepoPath(normalized);
  const canonical = await resolveCanonicalPath(normalized);
  assertAllowedRepoPath(canonical);
  const state = await readRepositoryState();
  const recent = state.recent.filter((entry) => entry.repoPath !== canonical);
  const active = state.active?.repoPath === canonical ? null : (state.active ?? null);
  const nextState = { active, recent };
  await writeRepositoryState(nextState);
  return nextState;
}

function refreshAllowedRoots() {
  ALLOWED_ROOTS = computeAllowedRoots();
}

module.exports = {
  validateRepo,
  persistActiveRepo,
  clearPersistedRepo,
  readPersistedRepo,
  removeRepo,
  RepoPathError,
  APP_DATA_ROOT,
  ALLOWED_ROOTS,
  REPO_STATE_PATH,
  refreshAllowedRoots,
};
