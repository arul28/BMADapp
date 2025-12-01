const path = require('node:path');

const PRELOAD_PATH = path.join(__dirname, 'preload.js');
const BUILD_INDEX = path.join(__dirname, '..', 'ui', 'out', 'index.html');
const BUILD_DIR = path.join(__dirname, '..', 'ui', 'out');

const browserWindowOptions = {
  width: 1280,
  height: 800,
  webPreferences: {
    preload: PRELOAD_PATH,
    contextIsolation: true,
    nodeIntegration: false,
    // Preload needs Node/Electron APIs to expose the desktop bridge; sandbox mode disables them.
    sandbox: false,
  },
};

const DEFAULT_URL = process.env.BMAD_DESKTOP_URL || `file://${BUILD_INDEX}`;

module.exports = {
  PRELOAD_PATH,
  BUILD_INDEX,
  BUILD_DIR,
  DEFAULT_URL,
  browserWindowOptions,
  IPC_ALLOWLIST: ['bmad:repo-health', 'bmad:read-status', 'bmad:read-doc'],
};
