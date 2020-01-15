import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { BehaviorSubject, Observable } from 'rxjs';
const electron = (window as any).require('electron');

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private static readonly ClearStatusDelay = 2000;

  public status$: Observable<string>;
  private _status = new BehaviorSubject('');
  private _ipcRenderer: IpcRenderer;
  private _clearStatusTimeout: any;

  constructor() {
    this.status$ = this._status.asObservable();
    this._ipcRenderer = electron.ipcRenderer;
    this._ipcRenderer.on(`status:message`, (event, message: string) => {
      this._status.next(message);
    });
  }

  public setStatus(message: string): void {
    if (this._clearStatusTimeout) {
      clearTimeout(this._clearStatusTimeout);
    }

    this._status.next(message);

    // Only let status set for so long.
    if (message) {
      this._clearStatusTimeout = setTimeout(() => {
        this._status.next('');
      }, StatusService.ClearStatusDelay);
    }
  }
}
