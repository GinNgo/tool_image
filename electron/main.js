const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 920,
    minWidth: 960,
    minHeight: 700,
    title: 'Công cụ tạo ảnh và tiêu đề tuyên truyền',
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
    show: false,
  });

  const indexPath = path.join(__dirname, '../dist/tool-image/browser/index.html');

  if (fs.existsSync(indexPath)) {
    mainWindow.loadFile(indexPath);
  } else {
    mainWindow.loadURL('http://localhost:4200');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// === IPC Handlers: Images & Export ===

ipcMain.handle('show-save-dialog', async (_event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: options.defaultPath || 'anh-xuat.png',
    filters: options.filters || [{ name: 'Ảnh PNG', extensions: ['png'] }],
  });

  if (result.canceled) return null;
  return result.filePath;
});

ipcMain.handle('write-file', async (_event, filePath, base64Data) => {
  const buffer = Buffer.from(base64Data, 'base64');
  await fs.promises.writeFile(filePath, buffer);
  return true;
});

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

// === IPC Handlers: Project Save & Load (.json) ===

ipcMain.handle('show-save-project-dialog', async (_event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Lưu dự án chỉnh sửa',
    defaultPath: options.defaultPath || 'du-an.json',
    filters: options.filters || [{ name: 'Dự án tạo ảnh', extensions: ['json'] }],
  });

  if (result.canceled) return null;
  return result.filePath;
});

ipcMain.handle('write-project-file', async (_event, filePath, content) => {
  await fs.promises.writeFile(filePath, content, 'utf8');
  return true;
});

ipcMain.handle('show-open-project-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Mở dự án cũ',
    filters: [
      {
        name: 'Dự án tạo ảnh',
        extensions: ['json'],
      },
    ],
    properties: ['openFile'],
  });

  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle('read-project-file', async (_event, filePath) => {
  const content = await fs.promises.readFile(filePath, 'utf8');
  return content;
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
