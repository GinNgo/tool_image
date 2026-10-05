const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'ToolImage Studio',
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
    defaultPath: options?.defaultPath || 'anh-xuat.png',
    filters: options?.filters || [
      { name: 'Ảnh PNG (*.png)', extensions: ['png'] },
      { name: 'Ảnh JPEG (*.jpg, *.jpeg)', extensions: ['jpg', 'jpeg'] },
      { name: 'Ảnh WebP (*.webp)', extensions: ['webp'] },
      { name: 'Tệp dự án ToolImage (*.tiproj)', extensions: ['tiproj', 'json'] },
      { name: 'Tất cả tệp (*.*)', extensions: ['*'] }
    ],
  });

  if (result.canceled) return null;
  return result.filePath;
});

ipcMain.handle('save-image', async (_event, { dataUrl, defaultName, format }) => {
  const ext = format === 'jpeg' ? 'jpg' : (format || 'png');
  const filePath = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName || `anh-xuat.${ext}`,
    filters: [
      { name: `Ảnh ${ext.toUpperCase()}`, extensions: [ext] },
      { name: 'Tất cả tệp', extensions: ['*'] }
    ]
  });

  if (filePath.canceled || !filePath.filePath) return null;

  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  await fs.promises.writeFile(filePath.filePath, buffer);
  return filePath.filePath;
});

ipcMain.handle('open-file-in-folder', async (_event, filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    shell.showItemInFolder(filePath);
    return true;
  }
  return false;
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

// === IPC Handlers: Project Save & Load (.tiproj / .json) ===

ipcMain.handle('show-save-project-dialog', async (_event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Lưu dự án chỉnh sửa',
    defaultPath: options?.defaultPath || 'du-an.tiproj',
    filters: [
      { name: 'Tệp dự án ToolImage (*.tiproj)', extensions: ['tiproj'] },
      { name: 'Dự án JSON (*.json)', extensions: ['json'] }
    ],
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
        name: 'Tệp dự án ToolImage (*.tiproj, *.json)',
        extensions: ['tiproj', 'json'],
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
