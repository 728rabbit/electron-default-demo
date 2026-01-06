const { contextBridge, ipcRenderer } = require('electron');

// Create a secure bridge that exposes only the necessary APIs to the webpage.
contextBridge.exposeInMainWorld('electronAPI', {
    startEvent: (action_index, args) => {
        // window.electronAPI.startEvent(...);
        return ipcRenderer.send(action_index, args);
    }
});