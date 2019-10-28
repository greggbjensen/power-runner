import { Injectable } from '@angular/core';
import { NodeProxyFactory } from './node-proxy.factory';
import { ProxyNodeService } from './proxy-node-service';

@Injectable({
  providedIn: 'root'
})
export class AppService extends ProxyNodeService {

  constructor(
    proxyFactory: NodeProxyFactory
  ) {
    super('NodeAppService', proxyFactory);
  }

  public exitAsync(): Promise<void> {
    return this.proxy.invoke('exitAsync');
  }
}
