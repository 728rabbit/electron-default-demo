const { app, ipcMain } = require('electron');
const AppViewer = new (require('./viewer.js'))();
const gotSingleInstanceLock = app.requestSingleInstanceLock();

require('electron-reload')(__dirname);

if (!gotSingleInstanceLock) {
    console.log('Another instance is running, quitting...');
    app.quit();
} 
else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        console.log('Second instance attempted to run');
        if (AppViewer.mainWindow) {
            if (AppViewer.mainWindow.isMinimized()) {
                AppViewer.mainWindow.restore();
            }
            AppViewer.mainWindow.focus();
        }
    });

    if (process.platform === 'win32') {
        app.setAppUserModelId(app.getName());
    }
    app.setName(app.getName()); 

    app.whenReady().then(() => {
        AppViewer.createSplash();
        setTimeout(() => {
            AppViewer.createMainWindow();
        }, 2000);
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        if (!AppViewer.mainWindow || AppViewer.mainWindow.isDestroyed()) {
            AppViewer.createMainWindow();
        } else {
            AppViewer.mainWindow.focus();
        }
    });
    app.on('before-quit', () => {
        console.log('Application is quitting...');
    });
}

// Listen for events
// 1. Event triggered: ipcRenderer.send(...)
// 2. Listener receives: ipcMain.on(...)
// 3. Callback function executed
ipcMain.on('open-child-window', (event, args) => {
    console.log('Event: open-child-window');
    AppViewer.createChildWindow(args);
});

ipcMain.on('show-notification-message', (event, args) => {
    console.log('Event: show-notification-message');
    AppViewer.showNotification(args);
});