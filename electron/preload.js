const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  writeFile: (filePath, base64Data) =>
    ipcRenderer.invoke('write-file', filePath, base64Data),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),

  // Project persistence handlers
  showSaveProjectDialog: (options) =>
    ipcRenderer.invoke('show-save-project-dialog', options),
  writeProjectFile: (filePath, content) =>
    ipcRenderer.invoke('write-project-file', filePath, content),
  showOpenProjectDialog: () =>
    ipcRenderer.invoke('show-open-project-dialog'),
  readProjectFile: (filePath) =>
    ipcRenderer.invoke('read-project-file', filePath),
});
