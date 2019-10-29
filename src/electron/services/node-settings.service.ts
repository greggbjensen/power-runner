import { Injectable } from '@angular/core';
import * as fs from 'fs-extra';
import * as yaml from 'node-yaml';
import * as os from 'os';
import * as path from 'path';
import { ISettings } from 'src/app/core/models';

@Injectable({
  providedIn: 'root'
})
export class NodeSettingsService {
  private _settingsFile: string;

  constructor() {
    this._settingsFile = path.join(os.homedir(), '.power-runner', 'settings.yaml');
  }

  public async saveAsync(settings: ISettings): Promise<void> {
    const settingsDirectory = path.dirname(this._settingsFile);
    await fs.ensureDir(settingsDirectory);
    return await yaml.write(this._settingsFile, settings);
  }
}
