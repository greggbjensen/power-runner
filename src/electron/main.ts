import { app, BrowserWindow, ipcMain } from 'electron';
import * as electronReload from 'electron-reload';
import * as path from 'path';
import * as url from 'url';
import { NodeScriptService, NodeSettingsService, ScriptParser, NodeBrowseDialogService } from './services';

electronReload(path.resolve(__dirname, '../../src'), {
  electron: path.resolve(__dirname, '../../node_modules/.bin/electron')
});

// SourceRef: https://angularfirebase.com/lessons/desktop-apps-with-electron-and-angular/
// SourceRef: https://developer.okta.com/blog/2019/03/20/build-desktop-app-with-angular-electron
// SourceRef: https://medium.com/@midsever/getting-started-with-angular-in-electron-296d13f59e5e

let browserWindow: BrowserWindow;
let settingsService: NodeSettingsService;

function createWindow(): void {
  browserWindow = new BrowserWindow({
      width: 1024,
      height: 768,
      darkTheme: true,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: true
      }
    });

  browserWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/../../dist/power-runner/index.html`),
      protocol: 'file:',
      slashes: true
    })
  );

  browserWindow.webContents.openDevTools();

  browserWindow.on('closed', () => {
    browserWindow = null;
  });

  browserWindow.webContents.on('devtools-opened', () => {
    setImmediate(() => browserWindow.focus());
  });

  const scriptParser = new ScriptParser();
  settingsService = new NodeSettingsService(browserWindow);
  bindService(settingsService);
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

ipcMain.on('file:exit', () => app.quit());

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
