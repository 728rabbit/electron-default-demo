const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

let splash, mainWindow, childWindow;

function createSplash() {
    splash = new BrowserWindow({
        width: 300,
        height: 240,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
    });
    splash.loadFile(path.join(__dirname, 'view/splash.html'));
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        modal: true,
        width: 1024,
        height: 768,
        icon: path.join(__dirname, 'assets/image/app-icon.png'),
        webPreferences: {   
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js')  
        }
    });

    mainWindow.loadFile('view/index.html');

    mainWindow.once('ready-to-show', () => {
        if (splash) { splash.close(); }
        mainWindow.show()
    });

    createAppMenu();

    mainWindow.on('closed', () => (mainWindow = null));
}

function createChildWindow(view = null) {
    if(view && mainWindow) {
        childWindow = new BrowserWindow({
            parent: mainWindow,
            modal: true,
            width: 800,
            height: 600,
            icon: path.join(__dirname, 'assets/image/app-icon.png'),
            webPreferences: {   
                contextIsolation: true,
                nodeIntegration: false,
                preload: path.join(__dirname, 'preload.js')  
            }
        });
        
        childWindow.loadFile(path.join(__dirname, 'view/'+view+'.html'));

        childWindow.setMenu(null);

        childWindow.on('closed', () => (childWindow = null));
    }
}

function createAppMenu() {
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
    
    mainWindow.setMenu(null);
}

app.whenReady().then(() => {
    createSplash();
    setTimeout(() => createMainWindow(), 2000);
});

ipcMain.on('open-child-window', (event, viewName) => {
    createChildWindow(viewName);
});