import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { NodeProxy } from '../models';
import { IResolvable } from '../models/iresolvable';
const electron = (window as any).require('electron');

@Injectable({
  providedIn: 'root'
})
export class NodeProxyFactory {

  private _ipcRenderer: IpcRenderer | undefined;

  constructor() {
    this._ipcRenderer = electron.ipcRenderer;
  }

  public create(serviceName: string, ...functionNames: string[]): NodeProxy {
    const proxy = new NodeProxy();
    functionNames.forEach(functionName => {
      proxy.add(functionName, this.createCall(serviceName, functionName));
    });

    return proxy;
  }

  public createCall(serviceName: string, functionName: string): (...args: any[]) => Promise<any> {
    const resolveable = { } as IResolvable;
    this._ipcRenderer.on(`${serviceName}.${functionName}:reply`, (event, result) => {
      resolveable.resolve(result);
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
