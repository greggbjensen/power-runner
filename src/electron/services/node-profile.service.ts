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

    const defaultProfile: IScriptProfile = {
      name: 'Default',
      params: [ ]
    };
    return [defaultProfile].concat(sharedProfiles.concat(personalProfiles));
  }

  public async updateAsync(directory: string, scriptName: string, profile: IScriptProfile, saveAsType: SaveAsType = null)
  : Promise<void> {

    const profileMap = await this.getMergedMapAsync(directory);

    // If the save as type was not specified, it must be existing, so keep it the same.
    if (!saveAsType) {

      // If the key was not personal, default to shared.
      const personalKey = this.getScriptKey(directory, scriptName, SaveAsType.Personal);
      saveAsType = profileMap[personalKey]
        ? SaveAsType.Personal
        : SaveAsType.Shared;
    }

    const scriptKey = this.getScriptKey(directory, scriptName, saveAsType);

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
      await this.saveProfileMapAsync(directory, profileMap, saveAsType);
    }
  }

  public async deleteAsync(directory: string, scriptName: string, profileName: string): Promise<void> {
    const profileMap = await this.getMergedMapAsync(directory);

    await this.remove(profileMap, directory, scriptName, profileName, SaveAsType.Shared);
    await this.remove(profileMap, directory, scriptName, profileName, SaveAsType.Personal);
  }

  private async remove(
    profileMap: IScriptProfileMap, directory: string, scriptName: string, profileName: string,
    saveAsType: SaveAsType): Promise<boolean> {

    let wasDeleted = false;
    let foundIndex = 0;
    const scriptKey = this.getScriptKey(directory, scriptName, saveAsType);
    const profiles = profileMap[scriptKey];
    const lowerProfileName = profileName.toLowerCase();

    if (profiles) {

      foundIndex = profiles.findIndex(s => s.name.toLowerCase() === lowerProfileName);
      if (foundIndex !== -1) {
        profiles.splice(foundIndex, 1);
        if (profiles.length === 0) {
          delete profileMap[scriptKey];
        }

        await this.saveProfileMapAsync(directory, profileMap, saveAsType);
        wasDeleted = true;
      }
    }

    return wasDeleted;
  }

  private getProfileFileName(directory: string, saveAsType: SaveAsType): string {
    return saveAsType === SaveAsType.Personal
      ? this._personalProfileFile
      : path.join(directory, NodeProfileService.SharedFileName);
  }

  private getScriptKey(directory: string, scriptName: string, saveAsType: SaveAsType): string {
    return saveAsType === SaveAsType.Personal
    ? path.join(directory, scriptName)
    : scriptName;
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

  private async saveProfileMapAsync(directory: string, profileMap: IScriptProfileMap, saveAsType: SaveAsType): Promise<void> {

    const unmergedMap = this.getUnmergedMap(profileMap, saveAsType);
    const fileName = this.getProfileFileName(directory, saveAsType);

    const profileDirectory = path.dirname(fileName);
    await fs.ensureDir(profileDirectory);
    await yaml.write(fileName, unmergedMap);
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
