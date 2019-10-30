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
}
