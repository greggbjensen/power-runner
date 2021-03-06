import { app, BrowserWindow, ipcMain } from 'electron';
import * as unhandled from 'electron-unhandled';
import * as path from 'path';
import * as url from 'url';
import {
  NodeAppService,
  NodeBrowseDialogService,
  NodeProfileService,
  NodeScriptCacheService,
  NodeScriptService,
  NodeSettingsService
} from './services';
import { Updater } from './updater';

unhandled();

const isDev = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase().trim() === 'dev';
if (isDev) {
  const electronReload = require('electron-reload');
  electronReload(path.resolve(__dirname, '../../src'), {
    electron: path.resolve(__dirname, '../../node_modules/.bin/electron')
  });
}

// SourceRef: https://angularfirebase.com/lessons/desktop-apps-with-electron-and-angular/
// SourceRef: https://developer.okta.com/blog/2019/03/20/build-desktop-app-with-angular-electron
// SourceRef: https://medium.com/@midsever/getting-started-with-angular-in-electron-296d13f59e5e

let browserWindow: BrowserWindow;
let updater: Updater;

function createWindow(): void {

  browserWindow = new BrowserWindow({
      width: 1280,
      height: 924,
      darkTheme: true,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        webSecurity: true
      }
    });

  const appRoot = isDev ? 'dist' : 'app';
  browserWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/../../${appRoot}/powerrunner/index.html`),
      protocol: 'file:',
      slashes: true
    })
  );

  browserWindow.on('closed', () => {
    browserWindow = null;
  });

  browserWindow.webContents.on('devtools-opened', () => {
    setImmediate(() => browserWindow.focus());
  });

  const scriptCache = new NodeScriptCacheService();

  bindService(new NodeAppService(browserWindow, isDev));
  bindService(new NodeSettingsService());
  bindService(new NodeScriptService(app, browserWindow, scriptCache));
  bindService(new NodeProfileService());
  bindService(new NodeBrowseDialogService(browserWindow));

  if (isDev) {
    // Open the DevTools. No update call in dev !!!
    browserWindow.webContents.openDevTools();
    browserWindow.webContents.once('did-finish-load', () => {
      browserWindow.webContents.send('status:message', 'Ready');

      // REMOVE
      updater = new Updater(browserWindow);
      updater.init();
    });
  } else {

    // Handle squirrel event. Avoid calling for updates when install
    if (require('electron-squirrel-startup')) {
      app.quit();
      process.exit(0);
    }

    if (process.platform === 'win32') {
      const cmd = process.argv[1];
      if (cmd === '--squirrel-firstrun') {
        return;
      }
    }

    // Check for updates !!!!!
    browserWindow.webContents.once('did-finish-load', () => {
      updater = new Updater(browserWindow);
      updater.init();
    });
  }
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
      service[operation].call(service, ...args)
        .then(result => {
          if (browserWindow) {
            event.reply(`${serviceName}.${operation}:resolve`, result);
          }
        },
        error => {
          if (browserWindow) {
            const err = {
              message: error.message,
              stack: error.stack
            };
            event.reply(`${serviceName}.${operation}:reject`, err);
          }
        });
    });
  });
}

