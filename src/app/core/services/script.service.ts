import { Injectable } from '@angular/core';
import { IScript, NodeProxy } from '../models';
import { NodeProxyFactory } from './node-proxy.factory';
import { ProxyNodeService } from './proxy-node-service';

@Injectable({
  providedIn: 'root'
})
export class ScriptService extends ProxyNodeService {

  constructor(
    proxyFactory: NodeProxyFactory
  ) {
    super('NodeScriptService', proxyFactory);
  }

  public async listAsync(fileGlobs: string[]): Promise<IScript[]> {
    return this.proxy.invoke('listAsync', fileGlobs);
  }

  public async runAsync(script: IScript): Promise<string> {
    return this.proxy.invoke('runAsync', script);
  }
}
