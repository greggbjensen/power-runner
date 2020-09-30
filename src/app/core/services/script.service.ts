import { Injectable } from '@angular/core';
import { IScript, IScriptFile, NodeProxy, ScriptRef, ScriptStatus } from '../models';
import { NodeProxyFactory } from './node-proxy.factory';
import { ProxyNodeService } from './proxy-node-service';
import { StatusService } from './status.service';

@Injectable({
  providedIn: 'root'
})
export class ScriptService extends ProxyNodeService {

  constructor(
    proxyFactory: NodeProxyFactory,
    private _statusService: StatusService
  ) {
    super('NodeScriptService', proxyFactory);
  }

  public async listAsync(fileGlobs: string[]): Promise<IScriptFile[]> {
    return this.proxy.invoke('listAsync', fileGlobs);
  }

  public async runAsync(script: IScript, runExternal: boolean = false): Promise<string> {
    this._statusService.setStatus(`${script.module.toUpperCase()}/${script.name} running...`);
    return this.proxy.invoke('runAsync', script, runExternal);
  }

  public async stopAsync(script: IScriptFile): Promise<string> {
    this._statusService.setStatus(`${script.module.toUpperCase()}/${script.name} stopping...`);
    return this.proxy.invoke('stopAsync', script);
  }

  public async editAsync(script: IScriptFile): Promise<IScript[]> {
    return this.proxy.invoke('editAsync', script);
  }

  public async parseAsync(file: IScriptFile): Promise<IScript> {
    return this.proxy.invoke('parseAsync', file);
  }
}
