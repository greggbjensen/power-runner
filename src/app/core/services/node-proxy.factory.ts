import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { NodeProxy } from '../models';
import { IResolvable } from '../models/iresolvable';

@Injectable({
  providedIn: 'root'
})
export class NodeProxyFactory {

  private _ipcRenderer: IpcRenderer | undefined;

  constructor() {

    // SourceRef: https://dev.to/michaeljota/integrating-an-angular-cli-application-with-electron---the-ipc-4m18
    const windowAccessor = window as any;
    if (windowAccessor.require) {
      try {
        this._ipcRenderer = windowAccessor.require('electron').ipcRenderer;
      } catch (e) {
        throw e;
      }
    } else {
      console.warn('Electron\'s IPC was not loaded');
    }
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
