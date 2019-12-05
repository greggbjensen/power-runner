import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { BehaviorSubject, Observable } from 'rxjs';
const electron = (window as any).require('electron');

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  public status$: Observable<string>;
  private _status = new BehaviorSubject('');
  private _ipcRenderer: IpcRenderer;

  constructor() {
    this.status$ = this._status.asObservable();
    this._ipcRenderer = electron.ipcRenderer;
    this._ipcRenderer.on(`status:message`, (event, message: string) => {
      this._status.next(message);
    });
  }

  public setStatus(message: string): void {
    this._status.next(message);
  }
}
