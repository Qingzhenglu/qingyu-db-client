const { contextBridge, ipcRenderer } =  require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping')
})

console.log('Preload script loaded!') // 调试日志