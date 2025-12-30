const { contextBridge, ipcRenderer } = require('electron');

// Create a secure bridge that exposes only the necessary APIs to the webpage.
contextBridge.exposeInMainWorld('electronAPI', {
    openChildWindow: (viewName) => {
        // window.electronAPI.openChildWindow(...);
        return ipcRenderer.send('open-child-window', viewName);
    },

    showNotification: (name, content) => {
        // window.electronAPI.showNotification(...);
        return ipcRenderer.send('show-notification-message', {title: name, body: content});
    }
});