const { ipcMain } = require('electron')
const connectionManager = require('./db/ConnectionManager')

ipcMain.handle('db:connect', async (_, config) => {
    return connectionManager.connect(config)
})

ipcMain.handle('db:disconnect', async (_, id) => {
    return connectionManager.disconnect(id)
})

ipcMain.handle('db:test-connection', async (_, config) => {
    const connector = require(`./db/connectors/${config.type}`)
    return connector.testConnection(config)
})

ipcMain.handle('db:list-connections', async () => {
    return connectionManager.listConnections()
})