import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import * as _ from 'underscore';
import { NodeProxy, ScriptRef, IScript } from '../models';
import { IResolvable } from '../models/iresolvable';
import { ProxyNodeService } from './proxy-node-service';
const electron = (window as any).require('electron');

@Injectable({
  providedIn: 'root'
})
export class NodeProxyFactory {

  private _ipcRenderer: IpcRenderer | undefined;

  constructor() {
    this._ipcRenderer = electron.ipcRenderer;
  }

  public create(serviceName: string, proxyService: ProxyNodeService): NodeProxy {
    const proxy = new NodeProxy();
    // tslint:disable-next-line: forin
    for (const key in proxyService) {
      const field = proxyService[key];
      if (typeof field === 'function' && !key.startsWith('_') && key !== 'constructor') {
        console.log(serviceName + '.' + key);
        proxy.add(key, this.createCall(serviceName, key));
      }
    }

    return proxy;
  }

  public createScriptRef(script: IScript, scriptChannel: string): ScriptRef {
    return new ScriptRef(script, this._ipcRenderer, scriptChannel);
  }

  public createCall(serviceName: string, functionName: string): (...args: any[]) => Promise<any> {
    const resolveable = { } as IResolvable;
    this._ipcRenderer.on(`${serviceName}.${functionName}:resolve`, (event, result) => {
      resolveable.resolve(result);
    });

    this._ipcRenderer.on(`${serviceName}.${functionName}:reject`, (event, error) => {
      resolveable.reject(error);
    });

    return (...args: any[]) => {

      this._ipcRenderer.send(`${serviceName}.${functionName}`, ...args);

      return new Promise((resolve, reject) => {
        resolveable.resolve = resolve;
        resolveable.reject = reject;
      });
    }
  }
}
