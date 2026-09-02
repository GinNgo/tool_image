const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  writeFile: (filePath, base64Data) =>
    ipcRenderer.invoke('write-file', filePath, base64Data),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
});
