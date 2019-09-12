import { Injectable } from '@angular/core';
import { IScript, NodeProxy } from '../models';
import { NodeProxyFactory } from './node-proxy.factory';

@Injectable({
  providedIn: 'root'
})
export class ScriptService {

  private _proxy: NodeProxy;

  constructor(
    private _proxyFactory: NodeProxyFactory
  ) {
    this._proxy = this._proxyFactory.create('NodeScriptService', 'listAsync');
  }

  public async listAsync(fileGlobs: string[]): Promise<IScript[]> {
    return this._proxy.invoke('listAsync', fileGlobs);
  }
}
