const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    listFiles: (parent) => ipcRenderer.invoke('directory:listFiles', parent),
    postDirectory: (dir) => ipcRenderer.invoke('directory:postDirectory', dir),
    deleteDirectory: (id) => ipcRenderer.invoke('directory:deleteDirectory', id),
    moveDirectory: (id, parent_id) => ipcRenderer.invoke('directory:moveDirectory', id, parent_id),
    moveGame: (id, parent_id) => ipcRenderer.invoke('directory:moveGame', id, parent_id),
    getGame: (id) => ipcRenderer.invoke('directory:getGame', id),
    postGame: (game) => ipcRenderer.invoke('directory:postGame', game),
    deleteGame: (id) => ipcRenderer.invoke('directory:deleteGame', id),
    downloadGames: (ids) => ipcRenderer.invoke('directory:downloadGames', ids),
    getEngineList: () => ipcRenderer.invoke('engine:getList'),
    loadEngine: (name) => ipcRenderer.invoke('engine:loadEngine', name),
    startEngine: (pid, position, options) => ipcRenderer.invoke('engine:startEngine', pid, position, options),
    stopEngine: (pid) => ipcRenderer.send('engine:stopEngine', pid),
    restartEngine: (pid, position, options) => ipcRenderer.send('engine:restartEngine', pid, position, options),
    closeEngine: (pid) => ipcRenderer.send('engine:closeEngine', pid),
    onEngineUpdate: (callback) => ipcRenderer.on('engine-update', callback)
})