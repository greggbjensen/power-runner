import { Injectable } from '@angular/core';
import _ from 'underscore';
import { NodeProxy, ScriptRef, IScript, IProxyApi } from '../models';
import { IResolvable } from '../models/iresolvable';
import { ProxyNodeService } from './proxy-node-service';
const proxyApi: IProxyApi = (window as any).proxyApi;

@Injectable({
  providedIn: 'root'
})
export class NodeProxyFactory {

  constructor() {
  }

  public create(serviceName: string, proxyService: ProxyNodeService): NodeProxy {
    const proxy = new NodeProxy();
    // tslint:disable-next-line: forin
    for (const key in proxyService) {
      const field = proxyService[key];
      if (typeof field === 'function' && !key.startsWith('_') && key !== 'constructor') {
        proxy.add(key, this.createCall(serviceName, key));
      }
    }

    return proxy;
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
}
