import { spawn } from 'child_process';
import { BrowserWindow } from 'electron';
import * as globby from 'globby';
import * as pty from 'node-pty';
import * as os from 'os';
import { IScript, IScriptExit, IScriptParam, ParamType } from '../../app/core/models';
import { ScriptParser } from './script.parser';

// Initialize node-pty with an appropriate shell
const shell = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL'];

export class NodeScriptService {

  private static readonly FileExtensionRegex = /.ps1$/i;

  private _childProcesses = new Map<string, pty.IPty>();

  constructor(
    private _browserWindow: BrowserWindow,
    private _scriptParser: ScriptParser
  ) { }

  public async listAsync(fileGlobs: string[]): Promise<IScript[]> {

    const files = await globby(fileGlobs);
    const scripts = await Promise.all(files.map(f => this._scriptParser.parseScript(f)));

    return scripts;
  }

  public editAsync(script: IScript): Promise<void>  {

    spawn('Code.exe', [`${script.directory}/${script.name}`], {
      cwd: `${process.env.LOCALAPPDATA}\\Programs\\Microsoft VS Code`, // TODO GBJ: Make compatible with Linux.
      stdio: 'ignore',
      detached: true
    });

    return Promise.resolve();
  }

  public runAsync(script: IScript): Promise<string>  {

    return new Promise((resolve, reject) => {

      try {
        const paramList = script.params.map(p => this.formatParam(p)).join(' ');
        const command = `.\\${script.name} ${paramList}`;
        const child = pty.spawn('PowerShell', [command], {
          name: 'xterm-color',
          cols: 80,
          rows: 30,
          cwd: script.directory,
          env: process.env
        });

        const name = script.name.replace(NodeScriptService.FileExtensionRegex, '');
        const scriptChannel = `${script.module}_${name}`;
        this._childProcesses.set(scriptChannel, child);

        child.on('data', (data: any) => {
          this._browserWindow.webContents.send(`${scriptChannel}:data`, data);
        });
        child.on('exit', (exitCode) => {
          this._browserWindow.webContents.send(`${scriptChannel}:exit`, { scriptName: script.name, exitCode } as IScriptExit);
          this._childProcesses.delete(scriptChannel);
        });

        // setTimeout(() => {
        //   this._browserWindow.webContents.send(`${scriptChannel}:stdout`, this._textEncoder.encode(command));
        // }, 1);

        // Reply with a channel to listen on for stdout, stderr, and exit.
        resolve(scriptChannel);
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  private formatParam(param: IScriptParam): string {
    let paramText = '';

    if (param.value !== '' && param.value !== param.default) {
      switch (param.type) {

        case ParamType.Switch:
          if (param.value) {
            paramText = `-${param.name}`;
          }
          break;

        case ParamType.Boolean:
          paramText = `-${param.name} $${param.value}`;
          break;

        case ParamType.Number:
          paramText = `-${param.name} ${param.value}`;
          break;

        case ParamType.SecureString:
          paramText = `-${param.name} (ConvertTo-SecureString ${param.value} -AsPlainText -Force)`;
          break;

        default: // ParamType.String, ParamType.File, ParamType.Directory
          paramText = `-${param.name} "${param.value}"`;
          break;
      }
    }

    return paramText;
  }
}
