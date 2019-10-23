import { Injectable } from '@angular/core';
import { NodeProxy } from '../models';
import { NodeProxyFactory } from './node-proxy.factory';

@Injectable({
  providedIn: 'root'
})
export class BrowseDialogService {

  private _proxy: NodeProxy;

  constructor(
    private _proxyFactory: NodeProxyFactory
  ) {
    this._proxy = this._proxyFactory.create('NodeBrowseDialogService', 'selectDirectoryAsync');
  }

  public async selectDirectoryAsync(): Promise<string> {
    return this._proxy.invoke('selectDirectoryAsync');
  }
}
