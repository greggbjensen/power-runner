import { Injectable } from '@angular/core';
import { NodeProxy } from '../models';
import { NodeProxyFactory } from './node-proxy.factory';
import { ProxyNodeService } from './proxy-node-service';

@Injectable({
  providedIn: 'root'
})
export class BrowseDialogService extends ProxyNodeService {

  constructor(
    proxyFactory: NodeProxyFactory
  ) {
    super('NodeBrowseDialogService', proxyFactory);
  }

  public async selectDirectoryAsync(): Promise<string> {
    return this.proxy.invoke('selectDirectoryAsync');
  }
}
