import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { NodeAppService, NodeBrowseDialogService, NodeScriptService, NodeSettingsService, ScriptParser } from './services';

const isProduction = process.execPath.search('electron-prebuilt') === -1;

if (!isProduction) {
  const electronReload = require('electron-reload');
  electronReload(path.resolve(__dirname, '../../src'), {
    electron: path.resolve(__dirname, '../../node_modules/.bin/electron')
  });
}

// SourceRef: https://angularfirebase.com/lessons/desktop-apps-with-electron-and-angular/
// SourceRef: https://developer.okta.com/blog/2019/03/20/build-desktop-app-with-angular-electron
// SourceRef: https://medium.com/@midsever/getting-started-with-angular-in-electron-296d13f59e5e

let browserWindow: BrowserWindow;

function createWindow(): void {
  browserWindow = new BrowserWindow({
      width: 1024,
      height: 768,
      darkTheme: true,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        webSecurity: true
      }
    });

  const appRoot = !isProduction ? 'dist' : 'app';
  browserWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/../../${appRoot}/power-runner/index.html`),
      protocol: 'file:',
      slashes: true
    })
  );

  if (!isProduction) {
    browserWindow.webContents.openDevTools();
  }

  browserWindow.on('closed', () => {
    browserWindow = null;
  });

  browserWindow.webContents.on('devtools-opened', () => {
    setImmediate(() => browserWindow.focus());
  });

  const scriptParser = new ScriptParser();

  bindService(new NodeAppService(browserWindow));
  bindService(new NodeSettingsService());
  bindService(new NodeScriptService(browserWindow, scriptParser));
  bindService(new NodeBrowseDialogService(browserWindow));
}

app.on('ready', createWindow);

app.on('activate', () => {
  if (browserWindow === null) {
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

const services = new Map<string, object>();

function bindService(service: object): void {
  const servicePrototype = Object.getPrototypeOf(service);
  const serviceName = service.constructor.name;
  services.set(serviceName, service);

  const operations = Object.getOwnPropertyNames(servicePrototype)
    .filter(key => typeof service[key] === 'function' && key !== 'constructor');
  operations.forEach(operation => {
    ipcMain.on(`${serviceName}.${operation}`, (event, ...args) => {
      service[operation].call(service, ...args).then(result =>
        event.reply(`${serviceName}.${operation}:resolve`, result)
      , error => {
        event.reply(`${serviceName}.${operation}:reject`, error);
      });
    });
  });
}
