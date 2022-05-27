require = require("esm")(module);

import { exec, spawn } from 'child_process';
import { App, BrowserWindow, clipboard, ipcMain } from 'electron';
import { globby } from 'globby';
import { IPty, spawn as ptySpawn } from 'node-pty';
import os from 'os';
import path from 'path';
import { IScript, IScriptExit, IScriptFile, ScriptStatus } from '../../app/core/models';
import { ScriptFormatter } from '../../app/core/utils/script-formatter';
import { RunSettings } from '../../app/run-settings';
import { NodeScriptCacheService } from './node-script-cache.service';

// Initialize node-pty with an appropriate shell
const shell = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL'];

export class NodeScriptService {

  private static readonly Pause = '\x13';   // XOFF
  private static readonly Resume = '\x11';  // XON
  private static readonly FileExtensionRegex = /.ps1$/i;
  private static readonly NodeModulesRegex = /node_modules/i;

  // TODO GBJ: Make compatible with Linux.
  private static readonly PowerShellPath = `${process.env.SYSTEMROOT}\\system32\\WindowsPowerShell\\v1.0\\powershell.exe`;
  private static readonly CommandPath = `${process.env.SYSTEMROOT}\\system32\\cmd.exe`;

  private _childProcesses = new Map<string, IPty>();
  private _outputColumns = 120;
  private _outputRows = 30;

  constructor(
    private _app: App,
    private _browserWindow: BrowserWindow,
    private _cache: NodeScriptCacheService
  ) {
    ipcMain.on('script:data-ack', (event: any, scriptId: string) => {
      const child = this._childProcesses.get(scriptId);
      if (child) {
        child.write(NodeScriptService.Resume);
      }
    });
    ipcMain.on('output:resize', (event: any, columns: number, rows: number) => {
      this._outputColumns = columns;
      this._outputRows = rows;
      this._childProcesses.forEach(p => p.resize(columns, rows));
    });
  }

  public async listAsync(fileGlobs: string[]): Promise<IScriptFile[]> {

    const files = await globby(fileGlobs);
    const scripts = await Promise.all(files.map(f => this.getScriptFile(f)));

    return scripts;
  }

  public editAsync(script: IScriptFile): Promise<void>  {

    spawn('Code.exe', [`${script.directory}/${script.name}`], {
      cwd: `${process.env.LOCALAPPDATA}\\Programs\\Microsoft VS Code`, // TODO GBJ: Make compatible with Linux.
      stdio: 'ignore',
      detached: true
    });

    return Promise.resolve();
  }

  public runAsync(script: IScript, runExternal: boolean = false): Promise<string>  {

    return new Promise((resolve, reject) => {

      try {
        const paramList = script.params.map(p => ScriptFormatter.formatParam(p)).join(' ');
        const command = !runExternal
          ? `.\\${script.name} ${paramList}`
          // tslint:disable-next-line: max-line-length
          : `Invoke-Command { cmd /c start ${NodeScriptService.PowerShellPath} -NoExit .\\${script.name} ${paramList} }`;

        // Set clipboard for use in external window.
        if (runExternal) {
          clipboard.writeText(`.\\${script.name} ${paramList}`);
        }

        const child = ptySpawn(NodeScriptService.PowerShellPath, [command], {
          name: 'xterm-color',
          cols: this._outputColumns,
          rows: this._outputRows,
          cwd: script.directory,
          env: process.env,
          handleFlowControl: true
        });

        const name = script.name.replace(NodeScriptService.FileExtensionRegex, '');
        const scriptChannel = `${script.module}_${name}`;
        this._childProcesses.set(script.id, child);

        child.onData((data: string) => {
          child.write(NodeScriptService.Pause);
          this._browserWindow.webContents.send(`${scriptChannel}:data`, data);
        });
        child.onExit(({ exitCode }) => {
          this._browserWindow.webContents.send(`${scriptChannel}:exit`, { scriptName: script.name, exitCode } as IScriptExit);
          this._childProcesses.delete(script.id);
        });

        ipcMain.on('terminal.key', (event, key) => {
          child.write(key);
        });

        setTimeout(() => {
          this._browserWindow.webContents.send(`${scriptChannel}:data`, command);
        }, 1);

        // Reply with a channel to listen on for stdout, stderr, and exit.
        resolve(scriptChannel);
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  public async stopAsync(script: IScriptFile): Promise<void> {
    const child = this._childProcesses.get(script.id);
    if (child) {
      try {
        child.write(NodeScriptService.Pause);
        child.kill();
      } catch {
        // Do nothing.
      }
    }
  }

  public async parseAsync(file: IScriptFile): Promise<IScript> {

    let script: IScript;
    if (!RunSettings.Cache) {
      script = await this.internalParseAsync(file);
      return script;
    }

    const hash = await this._cache.getFileHashAsync(file);
    script = await this._cache.getAsync(file.module, file.name);
    if (!script || script.hash !== hash) {
      script = await this.internalParseAsync(file);
      script.hash = hash;
      await this._cache.setAsync(script);
    }

    script.status = ScriptStatus.Stopped;

    return script;
  }

  public async preCacheAsync(files: IScriptFile[]): Promise<void> {

    const uncachedFiles = await this._cache.listUncachedFilesAsync(files);

    for (const entry of uncachedFiles) {
      const script = await this.internalParseAsync(entry.file);
      script.hash = entry.hash;
      await this._cache.setAsync(script);
    }
  }

  public async disposeAsync(): Promise<void> {
    await this._cache.disposeAsync();
  }

  private internalParseAsync(file: IScriptFile): Promise<IScript> {

    return new Promise((resolve, reject) => {

      const filePath = `${file.directory}\\${file.name}`;
      const resourcesPath = !NodeScriptService.NodeModulesRegex.test(process.resourcesPath)
        ? `${process.resourcesPath}\\app`
        : path.dirname(this._app.getAppPath());
      const workingDirectory = `${resourcesPath}\\electron\\powershell`;
      const command = `"${NodeScriptService.PowerShellPath}" "${workingDirectory}\\GetCommandMetadata.ps1" "${filePath}"`;
      exec(command, { cwd: workingDirectory }, (error, stdout, stderr) => {

        if (error) {
          console.error(error);
          reject(error);
        } else if (stdout) {

          try {
            // Ensure result is always an array.
            const metadata = JSON.parse(stdout);
            const script = Object.assign({ }, file, metadata) as IScript;
            resolve(script);
          } catch (err) {
            console.error(err, stdout);
            reject(err);
          }
        } else if (stderr) {
          console.error(stderr);
          reject(stderr);
        } else {
          // No parameters available.
          const script = Object.assign({ }, file) as IScript;
          script.params = [];
          resolve(script);
        }
      });
    });
  }

  private getScriptFile(filePath: string): IScriptFile {

    let directory = path.dirname(filePath);
    if (os.platform() === 'win32') {
      directory = directory.replace(/\//g, '\\');
    }

    const name = path.basename(filePath);
    const id = `${directory.replace(/\//g, '_')}_${name}`;
    const file: IScriptFile = {
      id,
      directory,
      module: path.basename(directory),
      name
    };

    return file;
  }
}
