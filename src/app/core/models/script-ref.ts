import { EventEmitter } from '@angular/core';
import { IpcRenderer } from 'electron';
import { IScript } from './iscript';
import { IScriptExit } from './iscript-exit';

export class ScriptRef {
  public stdout = new EventEmitter<string>();
  public stderr = new EventEmitter<string>();
  public exit = new EventEmitter<IScriptExit>();
  public tail = true;

  constructor(
    public script: IScript,
    private _ipcRenderer: IpcRenderer,
    private _scriptChannel: string
  ) {

    this._ipcRenderer.on(`${this._scriptChannel}:stdout`, (event, data: string) => {
      this.stdout.emit(data);
    });

    this._ipcRenderer.on(`${this._scriptChannel}:stderr`, (event, data: string) => {
      this.stdout.emit(data);
    });

    this._ipcRenderer.on(`${this._scriptChannel}:exit`, (event, scriptExit: IScriptExit) => {
      this.exit.emit(scriptExit);
    });
  }
}
