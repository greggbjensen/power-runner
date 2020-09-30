import { spawn } from 'child_process';
import { BrowserWindow, clipboard, ipcMain } from 'electron';
import * as globby from 'globby';
import * as pty from 'node-pty';
import * as os from 'os';
import * as path from 'path';
import { IScript, IScriptExit, IScriptFile } from '../../app/core/models';
import { ScriptFormatter } from '../../app/core/utils/script-formatter';
import { ScriptParser } from './script.parser';

// Initialize node-pty with an appropriate shell
const shell = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL'];

export class NodeScriptService {

  private static readonly Pause = '\x13';   // XOFF
  private static readonly Resume = '\x11';  // XON
  private static readonly FileExtensionRegex = /.ps1$/i;

  // TODO GBJ: Make compatible with Linux.
  private static readonly PowerShellPath = `${process.env.SYSTEMROOT}\\system32\\WindowsPowerShell\\v1.0\\powershell.exe`;
  private static readonly CommandPath = `${process.env.SYSTEMROOT}\\system32\\cmd.exe`;

  private _childProcesses = new Map<string, pty.IPty>();

  constructor(
    private _browserWindow: BrowserWindow,
    private _scriptParser: ScriptParser
  ) {
    ipcMain.on('script:data-ack', (event: any, scriptId: string) => {
      const child = this._childProcesses.get(scriptId);
      if (child) {
        child.write(NodeScriptService.Resume);
      }
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

        const child = pty.spawn(NodeScriptService.PowerShellPath, [command], {
          name: 'xterm-color',
          cols: 120,
          rows: 30,
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

  public parseAsync(file: IScriptFile): Promise<IScript> {
    return this._scriptParser.parseAsync(file);
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
