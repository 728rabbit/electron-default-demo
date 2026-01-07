
const { contextBridge, ipcRenderer } = require('electron');

// Create a secure bridge that exposes only the necessary APIs to the webpage.
contextBridge.exposeInMainWorld('electronAPI', {
    // Asynchronous sending: ipcRenderer.send(channel, ...args)
    // Send and wait for a response: ipcRenderer.invoke(channel, ...args)
    startEvent: (action_index, args) => {
        // window.electronAPI.startEvent(...);
        return ipcRenderer.send(action_index, args);
    }
});