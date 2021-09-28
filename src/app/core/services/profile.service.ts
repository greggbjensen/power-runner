import { Injectable } from '@angular/core';
import { IScriptProfile, SaveAsType } from '../models';
import { ProxyNodeService } from './proxy-node-service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends ProxyNodeService {

  constructor(
  ) {
    super('NodeProfileService');
  }

  public listAsync(directory: string, scriptName: string): Promise<IScriptProfile[]> {
    return this.proxy.invoke('listAsync', directory, scriptName);
  }

  public updateAsync(directory: string, scriptName: string, profile: IScriptProfile, saveAsType: SaveAsType): Promise<void> {
    return this.proxy.invoke('updateAsync', directory, scriptName, profile, saveAsType);
  }

  public deleteAsync(directory: string, scriptName: string, profileName: string, saveAsType: SaveAsType): Promise<void> {
    return this.proxy.invoke('deleteAsync', directory, scriptName, profileName, saveAsType);
  }
}
