import { ChildProcess, spawn } from 'child_process';
import { BrowserWindow } from 'electron';
import * as globby from 'globby';
import { IScript } from '../../app/core/models';
import { ScriptParser } from './script.parser';

export class NodeScriptService {

  private static readonly FileExtensionRegex = /.ps1$/i;

  private _childProcesses = new Map<string, ChildProcess>();

  constructor(
    private _browserWindow: BrowserWindow,
    private _scriptParser: ScriptParser
  ) { }

  public async listAsync(fileGlobs: string[]): Promise<IScript[]> {

    const files = await globby(fileGlobs);
    const scripts = await Promise.all(files.map(f => this._scriptParser.parseScript(f)));

    return scripts;
  }

  public runAsync(script: IScript): Promise<string>  {

    return new Promise((resolve, reject) => {

      try {
        const paramList = script.params.map(p => `-${p.name} '${p.value}'`).join(' ');
        const command = `.\\${script.name} ${paramList}`;
        const child = spawn('PowerShell', [command], {
          cwd: script.directory
        });

        const name = script.name.replace(NodeScriptService.FileExtensionRegex, '');
        const scriptChannel = `${script.module}_${name}`;
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

        setTimeout(() => {
          this._browserWindow.webContents.send(`${scriptChannel}:stdout`, command);
        }, 1);

        // Reply with a channel to listen on for stdout, stderr, and exit.
        resolve(scriptChannel);
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }
}
