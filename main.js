const { app, Menu, BrowserWindow, shell } = require('electron');
const { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = require('electron-devtools-installer');
const path = require("path")

let win

function createWindow() {
    installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS])
        .then(name => console.log(`Added Extension:  ${name}`))
        .catch(err => console.log('An error occurred: ', err));
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
        icon: __dirname + '/resource/cbt-icon.png'
    })
    win.loadFile('index.html')
    if (process.argv.find((arg) => arg === '--debug')) {
        win.webContents.openDevTools()
    }
    initWindowMenu()
    win.on('closed', () => {
        win = null
    })
}

function initWindowMenu() {
    const menuTemplate = [
        {
            label: "Menu",
            submenu: [
                { role: "reload" },
                { role: "forceReload" },
                { type: "separator" },
                {
                    label: "Open Config File",
                    click () {
                        const configPath = path.join(app.getPath("userData"), "config.toml")
                        shell.openExternal(`file:///${configPath}`)
                    },
                },
                { type: "separator" },
                { role: "toggleDevTools" },
                { type: "separator" },
                { role: "quit" },
            ]
        }
    ]

    const menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
});
