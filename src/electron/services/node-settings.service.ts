import { Injectable } from '@angular/core';
import fs from 'fs-extra';
import yaml from 'node-yaml';
import os from 'os';
import path from 'path';
import { ISettings } from '../../app/core/models';

@Injectable({
  providedIn: 'root'
})
export class NodeSettingsService {
  private _settingsFile: string;

  constructor() {
    this._settingsFile = path.join(os.homedir(), '.powerrunner', 'settings.yaml');
  }

  public async saveAsync(settings: ISettings): Promise<void> {
    const settingsDirectory = path.dirname(this._settingsFile);
    await fs.ensureDir(settingsDirectory);
    await yaml.write(this._settingsFile, settings);
  }

  public async readAsync(): Promise<ISettings> {
    let settings: ISettings = null;
    const hasSettings = await fs.pathExists(this._settingsFile);
    if (hasSettings) {
      settings = await yaml.read(this._settingsFile);
    }

    return settings;
  }
}
