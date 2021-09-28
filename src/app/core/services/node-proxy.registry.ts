import { Injectable, InjectionToken, Injector, ProviderToken } from '@angular/core';
import _ from 'underscore';
import { ScriptRef, IScript, IProxyApi, NodeProxy, IResolvable } from '../models';
import { ProxyNodeService } from './proxy-node-service';
const proxyApi: IProxyApi = (window as any).proxyApi;

export const PROXY_SERVICE = new InjectionToken<ProxyNodeService[]>('NodeProxy');

@Injectable({
  providedIn: 'root'
})
export class NodeProxyRegistry {

  private _nodeProxies = new Map<string, NodeProxy>();

  constructor(
    private _injector: Injector
  ) {
  }

  public initialize(... proxyServices: any[]): void {
    proxyServices.forEach(proxyService => {
      const proxy = new NodeProxy();

      // Loop through all prototype
      const names = [];
      NodeProxyRegistry.listFunctionNames(proxyService, names);
      console.log(names);
      names.forEach(name => {
        proxy.add(name, this.createCall(proxyService.name, name));
      });

      this._nodeProxies.set(proxyService.name, proxy);
      proxyService.initialize(proxy);
    });
  }

  public createScriptRef(script: IScript, scriptChannel: string): ScriptRef {
    return new ScriptRef(script, proxyApi, scriptChannel);
  }

  public createCall(serviceName: string, functionName: string): (...args: any[]) => Promise<any> {
    const resolveable = { } as IResolvable;
    proxyApi.receive(`${serviceName}.${functionName}:resolve`, (result) => {
      resolveable.resolve(result);
    });

    proxyApi.receive(`${serviceName}.${functionName}:reject`, (error) => {
      const err = new Error(error.message);
      err.stack = error.stack;
      resolveable.reject(err);
    });

    return (...args: any[]) => {

      proxyApi.send(`${serviceName}.${functionName}`, ...args);

      return new Promise((resolve, reject) => {
        resolveable.resolve = resolve;
        resolveable.reject = reject;
      });
    }
  }

  private static listFunctionNames(instance: any, names: string[]): void {

    // SourceRef: https://stackoverflow.com/questions/31054910/get-functions-methods-of-a-class/31055217
    if (!instance) {
      return;
    }

    const entries = Object.getOwnPropertyNames(instance);
    entries.forEach(entry => {
      const field = instance[entry];
      if (typeof field === 'function' && !entry.startsWith('_') && entry !== 'constructor' && entry !== 'initialize') {
        names.push(entry)
      }
    });

    const proto = Object.getPrototypeOf(instance);
    if (proto !== Object.prototype) {
      this.listFunctionNames(proto, names);
    }
  }
}
