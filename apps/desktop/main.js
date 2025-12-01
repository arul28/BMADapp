const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const { DEFAULT_URL, browserWindowOptions, BUILD_DIR } = require('./config');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow(browserWindowOptions);
  mainWindow.setMenuBarVisibility(false);

  const targetUrl = DEFAULT_URL;
  if (targetUrl.startsWith('file://')) {
    const filePath = path.join(BUILD_DIR, 'index.html');
    mainWindow.loadFile(filePath);
  } else {
    mainWindow.loadURL(targetUrl);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.whenReady().then(() => {
  ipcMain.handle('bmad:choose-repo', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    if (result.canceled || !result.filePaths?.length) return null;
    return result.filePaths[0];
  });
});
