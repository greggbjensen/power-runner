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

  public reloadWindowAsync(): Promise<void> {
    return this.proxy.invoke('reloadWindowAsync');
  }

  public exitAsync(): Promise<void> {
    return this.proxy.invoke('exitAsync');
  }

  public minimizeAsync(): Promise<void> {
    return this.proxy.invoke('minimizeAsync');
  }

  public maximizeAsync(): Promise<void> {
    return this.proxy.invoke('maximizeAsync');
  }

  public restoreAsync(): Promise<void> {
    return this.proxy.invoke('restoreAsync');
  }

  public getVersionAsync(): Promise<string> {
    return this.proxy.invoke('getVersionAsync');
  }

  public getElevatedStatusAsync(): Promise<string> {
    return this.proxy.invoke('getElevatedStatusAsync');
  }

  public toggleDeveloperToolsAsync(): Promise<void> {
    return this.proxy.invoke('toggleDeveloperToolsAsync');
  }
}
