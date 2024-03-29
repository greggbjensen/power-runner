import { Injectable } from '@angular/core';
import fs from 'fs-extra';
import yaml from 'node-yaml';
import os from 'os';
import path from 'path';
import _ from 'underscore';
import { IScriptProfile, IScriptProfileMap, SaveAsType } from '../../app/core/models';

@Injectable({
  providedIn: 'root'
})
export class NodeProfileService {
  private static readonly SharedFileName = '.powerrunnerrc';
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
      id: 'default',
      name: 'Default',
      params: [ ],
      saveAsType: SaveAsType.Shared
    };
    return [defaultProfile].concat(sharedProfiles.concat(personalProfiles));
  }

  public async updateAsync(directory: string, scriptName: string, profile: IScriptProfile, saveAsType: SaveAsType)
  : Promise<void> {

    const profileMap = await this.getMergedMapAsync(directory);
    const scriptKey = this.getScriptKey(directory, scriptName, saveAsType);

    let profiles = profileMap[scriptKey];
    if (!profiles) {
      profiles = [];
      profileMap[scriptKey] = profiles;
    }

    // Verify there is a change before updating.
    const lowerProfileName = profile.name.toLowerCase();
    const profileIndex = profiles.findIndex(p => p.name.toLowerCase() === lowerProfileName);
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

  public async deleteAsync(directory: string, scriptName: string, profileName: string, saveAsType: SaveAsType): Promise<void> {
    const profileMap = await this.getMergedMapAsync(directory);

    await this.remove(profileMap, directory, scriptName, profileName, saveAsType);
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

    const profileMap: IScriptProfileMap = await yaml.read(fileName) || { };
    Object.keys(profileMap).forEach(key => profileMap[key].forEach(p => {
      p.id = `${saveAsType.toLowerCase()}_${p.name.toLowerCase()}`;
      p.saveAsType = saveAsType;
    }));

    return profileMap;
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
        unmergedMap[scriptKey] = map[scriptKey].map(profile => {
          const clone = Object.assign({ }, profile) as IScriptProfile;

          // Take out save as type and id, since they do not need to be persisted to file.
          delete clone.saveAsType;
          delete clone.id;
          return clone;
        });
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
