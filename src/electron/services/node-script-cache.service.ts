import { Injectable } from '@angular/core';
import * as crypto from 'crypto';
import * as os from 'os';
import * as path from 'path';
import { Database } from 'sqlite3';
import { IScript } from '../../app/core/models';

@Injectable({
  providedIn: 'root'
})
export class NodeScriptCacheService {

  private _cacheFile: string;

  constructor() {
    this._cacheFile = path.join(os.homedir(), '.powerrunner', 'script-cache.sqlite3');
  }

  public async getAsync(module: string, name: string): Promise<IScript> {
    let script: IScript = null;

    const db = await this.connectDbAsync();
    if (await this.dbTableExistsAsync(db, 'script')) {

      const sql = `
        SELECT metadata
        FROM script
        WHERE module = ?
          AND name = ?
      `;

      const result = await this.dbGetAsync<string>(db, sql, module, name) as any;
      db.close();

      if (result && result.metadata) {
        script = JSON.parse(result.metadata);
      }
    }

    return script;
  }

  public async addAsync(module: string, name: string, script: IScript): Promise<void> {

    const db = await this.connectDbAsync();
    await this.dbEnsureScriptTableAsync(db);

    const sql = `
      INSERT INTO script(module, name, hash, metadata, modified)
      VALUES (?, ?, ?, ?, ?)
    `;

    const json = JSON.stringify(script);
    await this.dbRunAsync(db, sql, module, name, script.hash, json, new Date().toISOString());
    db.close();
  }

  public async updateAsync(module: string, name: string, script: IScript): Promise<void> {
    const db = await this.connectDbAsync();
    await this.dbEnsureScriptTableAsync(db);

    const sql = `
      UPDATE script
      SET
          hash = ?
        , metadata = ?
        , modified = ?
      WHERE MODULE = ?
        AND NAME = ?
    `;

    const json = JSON.stringify(script);
    await this.dbRunAsync(db, sql, module, name, script.hash, json, new Date().toISOString());
    db.close();
  }

  private async dbTableExistsAsync(db: Database, tableName: string): Promise<boolean> {

    const sql = `
      SELECT COUNT(*) as count
      FROM sqlite_master
      WHERE type='table'
        AND name= ?;`;
    const result = await this.dbGetAsync<number>(db, sql, tableName) as any;
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
        UNIQUE(module, name)
      );`;
    await this.dbRunAsync(db, sql);
  }

  private dbGetAsync<T>(db: Database, sql: string, ...params: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          console.error(err.message);
          reject(err);
        } else {
          resolve(row as T);
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

  private connectDbAsync(): Promise<Database> {
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
