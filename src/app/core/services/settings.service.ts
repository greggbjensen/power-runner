import { Injectable } from '@angular/core';
import { NodeProxyFactory } from './node-proxy.factory';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(
    private _nodeProxyFactory: NodeProxyFactory,
  ) {
  }
}
