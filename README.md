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
