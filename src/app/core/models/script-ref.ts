import { EventEmitter } from '@angular/core';
import { IProxyApi } from './iproxy-api';
import { IScript } from './iscript';
import { IScriptExit } from './iscript-exit';
import { ScriptStatus } from './script-status.enum';

export class ScriptRef {
  public data = new EventEmitter<any>();
  public exit = new EventEmitter<IScriptExit>();
  public tail = true;

  constructor(
    public script: IScript,
    private _proxyApi: IProxyApi,
    private _scriptChannel: string
  ) {

    this._proxyApi.receive(`${this._scriptChannel}:data`, (data: string) => {
      this.script.status = ScriptStatus.Running;
      this.data.emit(data);
    });

    this._proxyApi.receive(`${this._scriptChannel}:exit`, (scriptExit: IScriptExit) => {
      this.script.status = ScriptStatus.Stopped;
      this.exit.emit(scriptExit);
    });
  }
}
