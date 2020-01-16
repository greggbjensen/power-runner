import { EventEmitter } from '@angular/core';
import { IpcRenderer } from 'electron';
import { IScript } from './iscript';
import { IScriptExit } from './iscript-exit';
import { ScriptStatus } from './script-status.enum';

export class ScriptRef {
  public data = new EventEmitter<any>();
  public exit = new EventEmitter<IScriptExit>();
  public tail = true;

  constructor(
    public script: IScript,
    private _ipcRenderer: IpcRenderer,
    private _scriptChannel: string
  ) {

    this._ipcRenderer.on(`${this._scriptChannel}:data`, (event, data: string) => {
      this.script.status = ScriptStatus.Running;
      this.data.emit(data);
    });

    this._ipcRenderer.on(`${this._scriptChannel}:exit`, (event, scriptExit: IScriptExit) => {
      this.script.status = ScriptStatus.Stopped;
      this.exit.emit(scriptExit);
    });
  }
}
