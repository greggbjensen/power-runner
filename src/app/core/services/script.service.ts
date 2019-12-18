import { Injectable } from '@angular/core';
import { IScript, NodeProxy } from '../models';
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

  public async listAsync(fileGlobs: string[]): Promise<IScript[]> {
    return this.proxy.invoke('listAsync', fileGlobs);
  }

  public async runAsync(script: IScript): Promise<string> {
    this._statusService.setStatus(`${script.module.toUpperCase()}/${script.name} running...`);
    return this.proxy.invoke('runAsync', script);
  }

  public async editAsync(script: IScript): Promise<IScript[]> {
    return this.proxy.invoke('editAsync', script);
  }
}
