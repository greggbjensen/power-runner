import { Injectable } from '@angular/core';
import * as fs from 'fs-extra';
import * as yaml from 'node-yaml';
import * as os from 'os';
import * as path from 'path';
import * as _ from 'underscore';
import { IScriptProfile, IScriptProfileMap, SaveAsType } from '../../app/core/models';

@Injectable({
  providedIn: 'root'
})
export class NodeProfileService {
  private static readonly SharedFileName = '.powerrunner-profiles';
  private _personalProfileFile: string;

  constructor() {
    this._personalProfileFile = path.join(os.homedir(), '.powerrunner', 'profiles.yaml');
  }

  public async listAsync(directory: string, scriptName: string): Promise<IScriptProfile[]> {

    const profileMap = await this.getMergedMapAsync(directory);
    const sharedProfiles = profileMap[scriptName] || [];

    const fullScriptName = path.join(directory, scriptName);
    const personalProfiles = profileMap[fullScriptName] || [];

    return sharedProfiles.concat(personalProfiles);
  }

  public async updateAsync(directory: string, scriptName: string, saveAsType: SaveAsType, profile: IScriptProfile)
  : Promise<void> {

    const profileMap = await this.getMergedMapAsync(directory);
    const scriptKey = saveAsType === SaveAsType.Personal
      ? path.join(directory, scriptName)
      : scriptName;

    let profiles = profileMap[scriptKey];
    if (!profiles) {
      profiles = [];
      profileMap[scriptKey] = profiles;
    }

    // Verify there is a change before updating.
    const profileIndex = profiles.findIndex(p => p.name === scriptKey);
    let hasUpdate = false;
    if (profileIndex === -1) {
      profiles.push(profile);
      hasUpdate = true;

    } else if (JSON.stringify(profiles[profileIndex]) !== JSON.stringify(profile)) {
      profiles[profileIndex] = profile;
      hasUpdate = true;
    }

    if (hasUpdate) {
      const updatedMap = this.getUnmergedMap(profileMap, saveAsType);
      const fileName = saveAsType === SaveAsType.Personal
        ? this._personalProfileFile
        : path.join(directory, NodeProfileService.SharedFileName);
      console.log('HERE', fileName, updatedMap);

      await this.saveProfileMapAsync(fileName, updatedMap);
    }
  }

  private getSaveAsType(scriptKey: string): SaveAsType {
    return (/[\\\/]/).test(scriptKey)
      ? SaveAsType.Personal // Personal will always have a path separator.
      : SaveAsType.Shared;
  }

  private async readProfileMapAsync(fileName: string, saveAsType: SaveAsType): Promise<IScriptProfileMap> {
    if (!await fs.pathExists(fileName)) {
      return { } as IScriptProfileMap;
    }

    const profiles: IScriptProfileMap = await yaml.read(fileName) || { };
    return profiles;
  }

  private async saveProfileMapAsync(fileName: string, profileMap: IScriptProfileMap): Promise<void> {
    const profileDirectory = path.dirname(fileName);
    await fs.ensureDir(profileDirectory);
    await yaml.write(fileName, profileMap);
  }

  private mergeMaps(...maps: IScriptProfileMap[]): IScriptProfileMap {
    const mergedMap = { } as IScriptProfileMap;
    maps.forEach(map => {
      Object.keys(map).sort().forEach(scriptName => {
        mergedMap[scriptName] = map[scriptName];
      });
    });

    return mergedMap;
  }

  private getUnmergedMap(map: IScriptProfileMap, saveAsType: SaveAsType): IScriptProfileMap {
    const unmergedMap = { } as IScriptProfileMap;
    Object.keys(map)
      .filter(scriptKey => this.getSaveAsType(scriptKey) === saveAsType)
      .sort()
      .forEach(scriptKey => {
        unmergedMap[scriptKey] = map[scriptKey];
      });

    return unmergedMap;
  }

  private async getMergedMapAsync(directory: string): Promise<IScriptProfileMap> {
    const personalMap = await this.readProfileMapAsync(this._personalProfileFile, SaveAsType.Personal);

    const sharedProfileFile = path.join(directory, NodeProfileService.SharedFileName);
    const sharedMap = await this.readProfileMapAsync(sharedProfileFile, SaveAsType.Shared);

    const mergedMap = this.mergeMaps(sharedMap, personalMap);
    return mergedMap;
  }
}
