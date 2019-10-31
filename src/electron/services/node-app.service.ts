import { Injectable } from '@angular/core';
import { app, BrowserWindow } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class NodeAppService {

  constructor(
    private _browserWindow: BrowserWindow
  ) { }

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
}
