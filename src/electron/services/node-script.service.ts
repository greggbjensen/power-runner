import { ChildProcess, spawn } from 'child_process';
import { BrowserWindow } from 'electron';
import * as fs from 'fs';
import * as globby from 'globby';
import * as path from 'path';
import { IScript, IScriptRun } from '../../app/core/models';

export class NodeScriptService {

  private static readonly FileExtensionRegex = /.ps1$/i;
  private static readonly ScriptParamRegex = /^\s*param\s*\((.*[^\]])\)/is;

  private _childProcesses = new Map<string, ChildProcess>();

  constructor(
    private _browserWindow: BrowserWindow
  ) { }

  private static readFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  public async listAsync(fileGlobs: string[]): Promise<IScript[]> {

    const files = await globby(fileGlobs);
    const scripts = await Promise.all(files.map(f => this.parseScript(f)));

    return scripts;
  }

  public runAsync(scriptRun: IScriptRun): Promise<string>  {

    return new Promise((resolve, reject) => {

      try {
        const child = spawn('PowerShell', [`.\\${scriptRun.script.name}`], {
          cwd: scriptRun.script.directory
        });

        const name = scriptRun.script.name.replace(NodeScriptService.FileExtensionRegex, '');
        const scriptChannel = `${scriptRun.script.module}_${name}`;
        this._childProcesses.set(scriptChannel, child);

        child.stdout.on('data', (data: string) => {
          this._browserWindow.webContents.send(`${scriptChannel}:stdout`, data);
        });
        child.stderr.on('data', (data: string) => {
          this._browserWindow.webContents.send(`${scriptChannel}:stderr`, data);
        });
        child.on('exit', (exitCode) => {
          this._browserWindow.webContents.send(`${scriptChannel}:exit`, exitCode);
          this._childProcesses.delete(scriptChannel);
        });
        child.stdin.end();

        // Replay with a channel to listen on for stdout, stderr, and exit.
        resolve(scriptChannel);
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  private async parseScript(filePath: string): Promise<IScript> {

    const content = await NodeScriptService.readFile(filePath);
    const match = NodeScriptService.ScriptParamRegex.exec(content);
    if (match) {
      console.log(match[1]);
    } else {
      console.log('No params');
    }

    const directory = path.dirname(filePath);
    const script: IScript = {
      directory,
      module: path.basename(directory),
      name: path.basename(filePath)
    };

    return script;
  }
}
