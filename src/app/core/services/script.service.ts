import { Injectable } from '@angular/core';
import { IScript, IScriptParams, NodeProxy } from '../models';
import { NodeProxyFactory } from './node-proxy.factory';

@Injectable({
  providedIn: 'root'
})
export class ScriptService {

  private _proxy: NodeProxy;

  constructor(
    private _proxyFactory: NodeProxyFactory
  ) {
    this._proxy = this._proxyFactory.create('NodeScriptService', 'listAsync', 'runAsync');
  }

  public async listAsync(fileGlobs: string[]): Promise<IScript[]> {
    return this._proxy.invoke('listAsync', fileGlobs);
  }

  public async runAsync(script: IScript, params: IScriptParams): Promise<number> {
    return this._proxy.invoke('runAsync', script, params);
  }
}
