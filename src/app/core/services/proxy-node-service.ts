import { NodeProxy } from '../models';

export abstract class ProxyNodeService {
  private _proxy: NodeProxy;

  protected get proxy(): NodeProxy {
    return this._proxy;
  }

  public get name(): string {
    return this._serviceProxyName;
  }

  constructor(
    private _serviceProxyName: string
  ) {
  }

  public initialize(proxy: NodeProxy): void {
    this._proxy = proxy;
  }
}
