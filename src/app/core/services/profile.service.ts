import { Injectable } from '@angular/core';
import { IScriptProfile, SaveAsType } from '../models';
import { NodeProxyFactory } from './node-proxy.factory';
import { ProxyNodeService } from './proxy-node-service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends ProxyNodeService {

  constructor(
    proxyFactory: NodeProxyFactory,
  ) {
    super('NodeProfileService', proxyFactory);
  }

  public listAsync(directory: string, scriptName: string): Promise<IScriptProfile[]> {
    return this.proxy.invoke('listAsync', directory, scriptName);
  }

  public updateAsync(directory: string, scriptName: string, saveAsType: SaveAsType, profile: IScriptProfile): Promise<void> {
    return this.proxy.invoke('updateAsync', directory, scriptName, saveAsType, profile);
  }

  public deleteAsync(directory: string, scriptName: string, profileName: string): Promise<void> {
    return this.proxy.invoke('deleteAsync', directory, scriptName, profileName);
  }
}
