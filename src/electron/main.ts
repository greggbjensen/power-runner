import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { NodeScriptService } from './services';

// SourceRef: https://angularfirebase.com/lessons/desktop-apps-with-electron-and-angular/
// SourceRef: https://developer.okta.com/blog/2019/03/20/build-desktop-app-with-angular-electron
// SourceRef: https://medium.com/@midsever/getting-started-with-angular-in-electron-296d13f59e5e

let win: BrowserWindow;

function createWindow(): void {
  win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: true
      }
    });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `/../../dist/power-runner/index.html`),
      protocol: 'file:',
      slashes: true
    })
  );

  win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function bindService(service: object): void {
  const serviceName = service.constructor.name;
  const operations = Object.keys(service).filter(key => typeof service[key] === 'function');
  operations.forEach(operation => {
    ipcMain.on(`${serviceName}.${operation}`, (event, ...args) => {
      const result = service[operation].call(service, args);
      event.reply(result);
    });
  });
}

bindService(new NodeScriptService());
