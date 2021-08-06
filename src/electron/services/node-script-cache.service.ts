import { Injectable } from '@angular/core';
import fs from 'fs';
import fsx from 'fs-extra';
import os from 'os';
import path from 'path';
import { Database } from 'sqlite3';
import { Md5 } from 'ts-md5/dist/md5';
import { IScript, IScriptFile } from '../../app/core/models';
import { IUncachedScriptFile } from '../models';

@Injectable({
  providedIn: 'root'
})
export class NodeScriptCacheService {

  private static readonly MetadataVersion = '1.0.0';
  private _cacheFile: string;
  private _db: Promise<Database>;

  constructor() {
    this._cacheFile = path.join(os.homedir(), '.powerrunner', 'script-cache.sqlite3');
    this._db = this.connectDbAsync();
  }

  private static readFileAsync(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  public async initializeAsync(): Promise<void> {
    const db = await this._db;
    await this.dbEnsureScriptTableAsync(db);
  }

  public async getAsync(module: string, name: string): Promise<IScript> {
    let script: IScript = null;

    const db = await this._db;
    if (await this.dbTableExistsAsync(db, 'script')) {

      const sql = `
        SELECT
            metadata
          , version
        FROM script
        WHERE module = ?
          AND name = ?
      `;

      const result = await this.dbGetAsync(db, sql, module, name);

      // Only use the cache record if the metadata version is correct.
      if (result && result.metadata && result.version === NodeScriptCacheService.MetadataVersion) {
        script = JSON.parse(result.metadata);
      }
    }

    return script;
  }

  public async setAsync(script: IScript): Promise<void> {
    const db = await this._db;
    await this.dbEnsureScriptTableAsync(db);

    if (await this.existsAsync(db, script.module, script.name)) {
      await this.updateAsync(db, script);
    } else {
      await this.addAsync(db, script);
    }
  }

  public async getFileHashAsync(file: IScriptFile): Promise<string> {

    const filePath = `${file.directory}\\${file.name}`;
    const fileContent = await NodeScriptCacheService.readFileAsync(filePath);
    const hash = Md5.hashStr(fileContent) as string;
    return hash;
  }

  public async listUncachedFilesAsync(files: IScriptFile[]): Promise<IUncachedScriptFile[]> {
    const db = await this._db;
    await this.dbEnsureScriptTableAsync(db);

    // List all cached items, filtering out versions that do not match current.
    const sql = `
      SELECT
          module
        , name
        , hash
      FROM script
      WHERE version = ?
    `;

    const rows = await this.dbListAsync(db, sql, NodeScriptCacheService.MetadataVersion);
    const lookup: { [key: string]: string } = { };
    rows.forEach(r => lookup[`${r.module}:${r.name}`] = r.hash);
    const uncachedFilesPromises = files.map(file => {
      const hash = lookup[`${file.module}:${file.name}`];
      return this.getUncachedFileAsync(file, hash);
    });

    const uncachedFiles = await Promise.all(uncachedFilesPromises);
    return uncachedFiles.filter(f => !!f);
  }

  public async disposeAsync(): Promise<void> {
    const db = await this._db;
    db.close();
  }

  private async existsAsync(db: Database, module: string, name: string): Promise<boolean> {
    const sql = `
      SELECT COUNT(*) as count
      FROM script
      WHERE module = ?
        AND name = ?
    `;

    const result = await this.dbGetAsync(db, sql, module, name);
    return result && result.count > 0;
  }

  private async addAsync(db: Database, script: IScript): Promise<void> {

    const sql = `
      INSERT INTO script(module, name, hash, metadata, modified, version)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const json = JSON.stringify(script);

    try {
      await this.dbRunAsync(db, sql, script.module, script.name, script.hash, json,
        new Date().toISOString(), NodeScriptCacheService.MetadataVersion);
    } catch (err) {
      console.warn(err);
    }
  }

  private async updateAsync(db: Database, script: IScript): Promise<void> {

    const sql = `
      UPDATE script
      SET
          hash = ?
        , metadata = ?
        , modified = ?
        , version = ?
      WHERE MODULE = ?
        AND NAME = ?
    `;

    const json = JSON.stringify(script);
    await this.dbRunAsync(db, sql, script.hash, json, new Date().toISOString(),
      NodeScriptCacheService.MetadataVersion,  script.module, script.name);
  }

  private async getUncachedFileAsync(file: IScriptFile, cachedHash: string): Promise<IUncachedScriptFile> {
    const hash = await this.getFileHashAsync(file);

    // Cache is already up to date.
    if (hash === cachedHash) {
      return null;
    }

    return { file, hash };
  }

  private async dbTableExistsAsync(db: Database, tableName: string): Promise<boolean> {

    const sql = `
      SELECT COUNT(*) as count
      FROM sqlite_master
      WHERE type='table'
        AND name= ?;`;
    const result = await this.dbGetAsync(db, sql, tableName);
    return result && result.count > 0;
  }

  private async dbEnsureScriptTableAsync(db: Database): Promise<void> {

    const sql = `
      CREATE table
      IF NOT EXISTS script(
        module TEXT NOT NULL,
        name TEXT NOT NULL,
        hash TEXT NOT NULL,
        metadata TEXT NOT NULL,
        modified TEXT NOT NULL,
        version TEXT NOT NULL,
        UNIQUE(module, name)
      );`;
    await this.dbRunAsync(db, sql);
  }

  private dbGetAsync(db: Database, sql: string, ...params: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          console.error(err.message);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  private dbListAsync(db: Database, sql: string, ...params: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, row) => {
        if (err) {
          console.error(err.message);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  private dbRunAsync(db: Database, sql: string, ...params: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(sql, params, (err) => {
        if (err) {
          console.error(err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private async connectDbAsync(): Promise<Database> {

    // Verify the directory exists or the Sqlite database will not be able to be created.
    const cacheDirectory = path.dirname(this._cacheFile);
    await fsx.ensureDir(cacheDirectory);

    return new Promise((resolve, reject) => {
      const database = new Database(this._cacheFile, (err) => {
        if (err) {
          console.error(err.message);
          reject(err);
        }

        resolve(database);
      });
    });
  }
}
