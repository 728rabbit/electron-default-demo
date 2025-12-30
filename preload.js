const { contextBridge, ipcRenderer } = require('electron');

// Create a secure bridge that exposes only the necessary APIs to the webpage.
contextBridge.exposeInMainWorld('electronAPI', {
    openChildWindow: (viewName) => {
        // window.electronAPI.openChildWindow('child');
        return ipcRenderer.send('open-child-window', viewName);
    }
});