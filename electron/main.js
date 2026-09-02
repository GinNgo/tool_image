const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 900,
    minHeight: 700,
    title: 'Công cụ tạo ảnh tuyên truyền',
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
    show: false,
  });

  // Load Angular build output
  const indexPath = path.join(__dirname, '../dist/tool-image/browser/index.html');

  if (fs.existsSync(indexPath)) {
    mainWindow.loadFile(indexPath);
  } else {
    // Dev mode: load from Angular dev server
    mainWindow.loadURL('http://localhost:4200');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// === IPC Handlers ===

// Show save dialog
ipcMain.handle('show-save-dialog', async (_event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: options.defaultPath || 'anh-xuat.png',
    filters: options.filters || [{ name: 'Ảnh PNG', extensions: ['png'] }],
  });

  if (result.canceled) return null;
  return result.filePath;
});

// Write file (base64 data)
ipcMain.handle('write-file', async (_event, filePath, base64Data) => {
  const buffer = Buffer.from(base64Data, 'base64');
  await fs.promises.writeFile(filePath, buffer);
  return true;
});

// Show open dialog (for image selection)
ipcMain.handle('show-open-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Chọn ảnh nền',
    filters: [
      {
        name: 'Ảnh',
        extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp'],
      },
    ],
    properties: ['openFile'],
  });

  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

// Read file as base64
ipcMain.handle('read-file', async (_event, filePath) => {
  const buffer = await fs.promises.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeMap = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
  };
  const mime = mimeMap[ext] || 'image/png';
  return `data:${mime};base64,${buffer.toString('base64')}`;
});

// === App lifecycle ===
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
