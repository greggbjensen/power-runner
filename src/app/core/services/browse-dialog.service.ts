import { Injectable } from '@angular/core';
import { ProxyNodeService } from './proxy-node-service';

@Injectable({
  providedIn: 'root'
})
export class BrowseDialogService extends ProxyNodeService {

  constructor(
  ) {
    super('NodeBrowseDialogService');
  }

  public async selectDirectoryAsync(): Promise<string> {
    return this.proxy.invoke('selectDirectoryAsync');
  }
}
