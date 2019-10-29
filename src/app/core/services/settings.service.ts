import { Injectable } from '@angular/core';
import { ISettings } from '../models';
import { NodeProxyFactory } from './node-proxy.factory';
import { ProxyNodeService } from './proxy-node-service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService extends ProxyNodeService {

  constructor(
    proxyFactory: NodeProxyFactory
  ) {
    super('NodeSettingsService', proxyFactory);
  }

  public async saveAsync(settings: ISettings): Promise<void> {
    return this.proxy.invoke('saveAsync', settings);
  }

  public async readAsync(): Promise<ISettings> {
    return this.proxy.invoke('readAsync');
  }
}
