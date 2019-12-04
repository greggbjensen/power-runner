import { Injectable } from '@angular/core';
import { app, BrowserWindow } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class NodeAppService {

  private _version: string;

  constructor(
    private _browserWindow: BrowserWindow,
    isDev: boolean
  ) {
    const packageJsonPath = isDev
    ? '../../../package.json'
    : '../../package.json';
    this._version = require(packageJsonPath).version;
   }

  public reloadWindowAsync(): Promise<void> {
    this._browserWindow.reload();
    return Promise.resolve();
  }

  public exitAsync(): Promise<void> {
    app.quit();
    return Promise.resolve();
  }

  public minimizeAsync(): Promise<void> {
    this._browserWindow.minimize();
    return Promise.resolve();
  }

  public maximizeAsync(): Promise<void> {
    this._browserWindow.maximize();
    return Promise.resolve();
  }

  public restoreAsync(): Promise<void> {
    this._browserWindow.restore();
    return Promise.resolve();
  }

  public toggleDeveloperToolsAsync(): Promise<void> {
    this._browserWindow.webContents.openDevTools();
    return Promise.resolve();
  }

  public getVersionAsync(): Promise<string> {
    return Promise.resolve(this._version);
  }
}
