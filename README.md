# electron-default-demo
electron application development structure


# 安裝 electron-builder

進入你的項目目錄
cd your-project-directory

安裝 electron-builder 為開發依賴
npm install electron-builder --save-dev

# 配置 package.json

    {
      "name": "your-app-name",
      "version": "1.0.0",
      "description": "Your app description",
      "main": "main.js",
      "scripts": {
        "start": "electron .",
        "pack": "electron-builder --dir",
        "dist": "electron-builder",
        "build:win": "electron-builder --win",
        "build:mac": "electron-builder --mac",
        "build:linux": "electron-builder --linux",
        "build:all": "electron-builder -wml"
      },
      "devDependencies": {
        "electron": "^25.0.0",
        "electron-builder": "^24.0.0"
      },
      "build": {
        "appId": "com.yourcompany.yourapp",
        "productName": "Your App Name",
        "directories": {
          "output": "dist"
        },
        "files": [
          "**/*",
          "!node_modules/**/*",
          "!**/*.log",
          "!**/*.map"
        ],
        "win": {
          "target": ["nsis", "portable"],
          "icon": "build/icon.ico"
        },
        "mac": {
          "target": "dmg",
          "icon": "build/icon.icns"
        },
        "linux": {
          "target": ["AppImage", "deb"],
          "icon": "build/icon.png"
        }
      }
    }

# 打包
** 使用admin user ** 
npm run build:win

## 详细流程

### 1. **Preload 脚本（使用 `ipcRenderer`）**

javascript

    // preload.js
    const { contextBridge, ipcRenderer } = require('electron')
    
    // 暴露安全的 API 给渲染进程
    contextBridge.exposeInMainWorld('electronAPI', {
      // 使用 ipcRenderer.invoke 调用主进程方法
      getData: () => ipcRenderer.invoke('get-data'),
      
      // 使用 ipcRenderer.send 发送消息
      sendMessage: (message) => ipcRenderer.send('send-message', message),
      
      // 监听主进程消息
      onUpdate: (callback) => 
        ipcRenderer.on('data-updated', (event, data) => callback(data)),
      
      // 移除监听器
      removeListener: () => ipcRenderer.removeAllListeners('data-updated')
    })

### 2. **Main 进程（使用 `ipcMain`）**

javascript

    // main.js
    const { app, BrowserWindow, ipcMain } = require('electron')
    
    // 处理来自渲染进程的请求
    ipcMain.handle('get-data', async (event) => {
      // 这里可以访问 Node.js API
      const fs = require('fs')
      const data = fs.readFileSync('data.json', 'utf-8')
      return JSON.parse(data)
    })
    
    // 监听消息
    ipcMain.on('send-message', (event, message) => {
      console.log('收到消息:', message)
      // 可以回复
      event.reply('message-received', { status: 'ok' })
    })
    
    // 主动发送消息给渲染进程
    function sendDataToRenderer(data) {
      const win = BrowserWindow.getFocusedWindow()
      if (win) {
        win.webContents.send('data-updated', data)
      }
    }

### 3. **渲染进程使用暴露的 API**

javascript

    // renderer.js (在网页中执行)
    
    // 使用预加载脚本暴露的 API
    window.electronAPI.getData()
      .then(data => {
        console.log('获取的数据:', data)
      })
    
    // 发送消息
    window.electronAPI.sendMessage('Hello from renderer!')
    
    // 监听更新
    window.electronAPI.onUpdate((data) => {
      console.log('数据更新:', data)
    })


## 完整通信流向
    ┌───────────────────────────────────────┐
    │           View Layer                  │
    │     (HTML/CSS/JavaScript UI)          │
    │                                       │
    │   → 调用 window.api.xxx()             │
    │   ← 接收 window.api.onXXX() 回调       │
    └───────────────────────────────────────┘
                        ↓
    ┌───────────────────────────────────────┐
    │           Preload Script              │
    │  (桥梁，有 Node.js 权限)               │
    │                                       │
    │   → 使用 ipcRenderer 转发请求          │
    │   ← 接收 ipcMain 响应并转发给 View      │
    └───────────────────────────────────────┘
                        ↓
    ┌───────────────────────────────────────┐
    │            Main Process               │
    │  (核心进程，完整的 Node.js 权限)        │
    │                                       │
    │   ← 通过 ipcMain.on/handle 接收请求     │
    │   → 通过 event.reply/sender.send 响应   │
    └───────────────────────────────────────┘
