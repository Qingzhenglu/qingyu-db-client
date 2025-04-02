const { contextBridge, ipcRenderer } =  require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),
  connect: (config) => ipcRenderer.invoke('db:connect', config),
  disconnect: (id) => ipcRenderer.invoke('db:disconnect', id),
  testConnection: (config) => ipcRenderer.invoke('db:test-connection', config),
  listConnections: () => ipcRenderer.invoke('db:list-connections')
})

console.log('Preload script loaded!') // 调试日志