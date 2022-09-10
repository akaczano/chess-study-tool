const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const url = require('url')
const path = require('path')
const fs = require('fs')

const DirectoryManager = require('./directory')
const EngineManager = require('./engine')

const defaultPath = './engines'

const dirManager = new DirectoryManager()
const engineManager = new EngineManager(defaultPath)

function createWindow() {
    const win = new BrowserWindow({
        title: "Chess Study Tool",
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')            
        }        
    })

    win.loadURL(process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '../index.html'),
        protocol: 'file:',
        slashes: true,
    }));

    engineManager.setUpdateHandler((pid, state) => {
        win.webContents.send('engine-update', pid, state)
    })
}


const init = async () => {
    await app.whenReady()
    const text = fs.readFileSync(process.env.CONFIG || 'config.json')
    const settings = JSON.parse(text)
    if (settings.path) {
        engineManager.setPath(settings.path)
    }
    const ret = await dirManager.init(settings.connection)    
    if (ret != 0) {
        throw 'Failed to initialize database'
    }
}


init().then(() => {
    ipcMain.handle('directory:listFiles', async (_, parent) => await dirManager.listFiles(parent))
    ipcMain.handle('directory:postDirectory', async (_, dir) => await dirManager.postDirectory(dir))
    ipcMain.handle('directory:deleteDirectory', async (_, id) => await dirManager.deleteDirectory(id))
    ipcMain.handle('directory:moveDirectory', async (_, id, parent_id) => await dirManager.moveDirectory(id, parent_id))
    ipcMain.handle('directory:moveGame', async (_, id, parent_id) => await dirManager.moveGame(id, parent_id))
    ipcMain.handle('directory:getGame', async (_, id) => await dirManager.getGame(id))
    ipcMain.handle('directory:postGame', async (_, game) => await dirManager.postGame(game))
    ipcMain.handle('directory:deleteGame', async (_, id) => await dirManager.deleteGame(id))
    ipcMain.handle('directory:downloadGames', async (_, ids) => await dirManager.downloadGames(ids))    
    ipcMain.handle('template:create', async (_, description, files) => await dirManager.createTemplate(description, files))
    ipcMain.handle('template:list', async () => await dirManager.listTemplates())
    ipcMain.handle('template:delete', async(_, id) => await dirManager.deleteTemplate(id))
    ipcMain.handle('template:get', async (_, id) => await dirManager.getTemplate(id))
    ipcMain.handle('session:create', async (_, description, template, vars) => await dirManager.createSession(description, template, vars))
    ipcMain.handle('session:list', async () => await dirManager.listSessions())
    ipcMain.handle('session:delete', async (_, id) => await dirManager.deleteSession(id))
    ipcMain.handle('session:nextVariation', async (_, session_id) => await dirManager.nextVariation(session_id))
    ipcMain.handle('session:loadVariation', async (_, session_id) => await dirManager.loadVariation(session_id))
    ipcMain.handle('session:updateVariation', async (_, variation) => await dirManager.updateVariation(variation))
    ipcMain.handle('engine:getList', async () => await engineManager.getList())
    ipcMain.handle('engine:loadEngine', async (_, name) => await engineManager.loadEngine(name))
    ipcMain.handle('engine:startEngine', async (_, pid, position, options) => await engineManager.startEngine(pid, position, options))
    ipcMain.on('engine:stopEngine', (_, pid) => engineManager.stopEngine(pid))
    ipcMain.on('engine:restartEngine', (_, pid, position, options) => engineManager.restartEngine(pid, position, options))
    ipcMain.on('engine:closeEngine', (_, pid) => engineManager.closeEngine(pid))
    createWindow()
})
.catch(err => {
    console.log(err)
})