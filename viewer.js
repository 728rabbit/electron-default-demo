const { app, BrowserWindow, Menu, Notification, dialog } = require('electron');
const path = require('path');

class AppViewer {
    constructor() {
        this.splash = null;
        this.mainWindow = null;
        this.childWindow = null;
        this.activeNotification = null;
    }

    createSplash() {
        if (this.splash && !this.splash.isDestroyed()) {
            this.splash.focus();
            return;
        }

        this.splash = new BrowserWindow({
            width: 240,
            height: 240,
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            resizable: false,
            show: false,
            webPreferences: {   
                contextIsolation: true,
                nodeIntegration: false
            }
        });

        this.splash.loadFile(path.join(__dirname, 'view/splash.html'))
        .catch(err => {
            console.error('Failed to load splash screen:', err);
            this.splash.destroy();
            this.splash = null;
            app.quit();
        });

        this.splash.once('ready-to-show', () => {
            this.splash.show();
            this.splash.focus();
        });

        this.splash.on('closed', () => {
            this.splash = null;
        });
    }

    createMainWindow() {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.focus();
            return;
        }

        this.mainWindow = new BrowserWindow({
            width: 1280,
            height: 800,
            show: false,
            icon: path.join(__dirname, 'assets/image/iweby-logo.png'),
            webPreferences: {   
                contextIsolation: true,
                nodeIntegration: false,
                preload: path.join(__dirname, 'preload.js')  
            }
        });

        this.mainWindow.loadFile(path.join(__dirname, 'view/index.html'))
        .catch(err => {
            console.error('Failed to load main window:', err);
            dialog.showErrorBox(
                'System Error',
                'Unable to load application window. Please restart the application.'
            );
            this.mainWindow.destroy();
            this.mainWindow = null;
            app.quit();
        });

        this.mainWindow.once('ready-to-show', () => {
            if (this.splash && !this.splash.isDestroyed()) {
                this.splash.close();
            }
            
            this.mainWindow.show();
            this.mainWindow.focus();

            // debug mode
            this.mainWindow.webContents.openDevTools({ mode: 'detach' });
        });

        this.mainWindow.on('closed', () => {
            if (this.childWindow && !this.childWindow.isDestroyed()) {
                this.childWindow.close();
                this.childWindow = null;
            }
            this.mainWindow = null;
            app.quit();
        });

        this.createAppMenu();
    }

    createChildWindow(childViewName = null) {
        if (!childViewName || !this.mainWindow || this.mainWindow.isDestroyed()) {
            return;
        }

        if (this.childWindow && !this.childWindow.isDestroyed()) {
            this.childWindow.focus();
            return;
        }

        this.childWindow = new BrowserWindow({
            parent: this.mainWindow,
            modal: true,
            width: 800,
            height: 600,
            show: false,
            icon: path.join(__dirname, 'assets/image/iweby-logo.png'),
            webPreferences: {   
                contextIsolation: true,
                nodeIntegration: false,
                preload: path.join(__dirname, 'preload.js')  
            }
        });
    
        this.childWindow.loadFile(path.join(__dirname, 'view/'+(childViewName.replace(/[^a-zA-Z0-9_-]/g, ''))+'.html'))
        .catch(err => {
            console.error('Failed to load child window:', err);
            dialog.showErrorBox(
                'System Error',
                'Unable to load child window, please try again.'
            );
            this.childWindow.destroy();
            this.childWindow = null;
        });

        this.childWindow.once('ready-to-show', () => {
            this.childWindow.setMenu(null);
            this.childWindow.removeMenu(); 

            this.childWindow.show();
            this.childWindow.focus();
        });

        this.childWindow.on('closed', () => {
            this.childWindow = null;
        });
    }

    createAppMenu() {
        const template = [
        {
            label: 'File',
            submenu: [
            { type: 'separator' },
            {
                label: 'Quit',
                click: () => {
                    app.quit();
                }
            }]
        }];

        const menu = Menu.buildFromTemplate(template);
        
        this.mainWindow.setMenu(null);
    }

    showNotification (name, content) {
        if (!name || !content) { return };
        
        if (Notification.isSupported()) {
            if (this.activeNotification) {
                try
                {
                    if (this.activeNotification.close) {
                        this.activeNotification.close();
                    } 
                    else if (this.activeNotification.destroy) {
                        this.activeNotification.destroy();
                    }
                } 
                catch (error) {
                    console.warn('An error occurred while turning off notifications:', error);
                } 
                finally {
                    this.activeNotification = null;
                }
            }

            this.activeNotification = new Notification({ 
                title: name, 
                body: content,
                icon: path.join(__dirname, 'assets/image/iweby-logo.png')
            }).show();
        } 
        else {
            console.warn('Notifications not supported on this platform');
        }
    }
}

module.exports = AppViewer;