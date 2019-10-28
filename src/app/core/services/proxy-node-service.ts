import { NodeProxy } from '../models';
import { NodeProxyFactory } from './node-proxy.factory';

export abstract class ProxyNodeService {
  private _proxy: NodeProxy;
  private _initialized = false;

  protected get proxy(): NodeProxy {

    if (!this._initialized) {
      this._initialized = true;
      this._proxy = this._proxyFactory.create(this._serviceProxyName, this);
    }

    return this._proxy;
  }

  constructor(
    private _serviceProxyName: string,
    private _proxyFactory: NodeProxyFactory
  ) {
  }
}
