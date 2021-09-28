const {
  contextBridge,
  ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "proxyApi", {
      send: (channel, data) => {
          // TODO: whitelist send channels
          ipcRenderer.send(channel, data);
      },
      receive: (channel, func) => {
          // TODO: whitelist recieve channels
          // Deliberately strip event as it includes `sender`
          ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
  }
);