import { Injectable } from '@angular/core';
import { BrowserWindow } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class NodeSettingsService {

  constructor(
    private _browserWindow: BrowserWindow
  ) { }

  public openModal(): void {
    console.log('SEND MODAL');
    this._browserWindow.webContents.focus();
    this._browserWindow.webContents.send('settings:open', null);
  }
}
