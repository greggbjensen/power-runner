import { EventEmitter } from '@angular/core';
import { IpcRenderer } from 'electron';

export class ScriptRef {
  public stdout = new EventEmitter<string>();
  public stderr = new EventEmitter<string>();
  public exit = new EventEmitter<number>();

  constructor(
    private _ipcRenderer: IpcRenderer,
    private _scriptChannel: string
  ) {

    this._ipcRenderer.on(`${this._scriptChannel}:stdout`, (event, data: string) => {
      this.stdout.emit(data);
    });

    this._ipcRenderer.on(`${this._scriptChannel}:stderr`, (event, data: string) => {
      this.stdout.emit(data);
    });

    this._ipcRenderer.on(`${this._scriptChannel}:stderr`, (event, exitCode: number) => {
      this.exit.emit(exitCode);
    });
  }
}