import { ChildProcess, spawn } from 'child_process';
import * as globby from 'globby';
import * as path from 'path';
import { IScript, IScriptParams, IScriptRun } from '../../app/core/models';
import { ipcMain } from 'electron';

export class NodeScriptService {

  private static readonly FileExtensionRegex = /.ps1$/i;

  private _childProcesses = new Map<string, ChildProcess>();

  public async listAsync(fileGlobs: string[]): Promise<IScript[]> {

    const files = await globby(fileGlobs);
    const scripts = files.map<IScript>(s => {
      const directory = path.dirname(s);
      return {
        directory,
        module: path.basename(directory),
        name: path.basename(s)
      };
    });

    return scripts;
  }

  public runAsync(scriptRun: IScriptRun): Promise<string>  {

    return new Promise((resolve, reject) => {
      const child = spawn('PowerShell', [`.\\${scriptRun.script.name}`], {
        cwd: scriptRun.script.directory
      });

      const name = scriptRun.script.name.replace(NodeScriptService.FileExtensionRegex, '');
      const scriptChannel = `${scriptRun.script.module}_${name}`;
      this._childProcesses.set(scriptChannel, child);

      process.stdout.on('data', (data: string) => {
        ipcMain.emit(`${scriptChannel}:stdout`, data);
      });
      process.stderr.on('data', (data: string) => {
        ipcMain.emit(`${scriptChannel}:stderr`, data);
      });
      process.on('exit', (exitCode) => {
        ipcMain.emit(`${scriptChannel}:exit`, exitCode);
        this._childProcesses.delete(scriptChannel);
      });
      process.stdin.end();

      // Replay with a channel to listen on for stdout, stderr, and exit.
      resolve(scriptChannel);
    });
  }
}
