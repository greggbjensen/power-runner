import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
const electron = (window as any).require('electron');

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private _ipcRenderer: IpcRenderer | undefined;

  constructor() {
    this._ipcRenderer = electron.ipcRenderer;
    this._ipcRenderer.on('settings:open', (event) => this.openModal());
  }

  public openModal(): void {
    console.log('OPEN MODAL');
  }
}
