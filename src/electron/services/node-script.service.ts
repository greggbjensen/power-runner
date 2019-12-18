import { ChildProcess, spawn } from 'child_process';
import { BrowserWindow, shell } from 'electron';
import * as globby from 'globby';
import { IScript, IScriptExit, IScriptParam, ParamType } from '../../app/core/models';
import { ScriptParser } from './script.parser';

export class NodeScriptService {

  private static readonly FileExtensionRegex = /.ps1$/i;

  private _childProcesses = new Map<string, ChildProcess>();
  private _textEncoder = new TextEncoder();

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
          this._browserWindow.webContents.send(`${scriptChannel}:exit`, { scriptName: script.name, exitCode } as IScriptExit);
          this._childProcesses.delete(scriptChannel);
        });
        child.stdin.end();

        setTimeout(() => {
          this._browserWindow.webContents.send(`${scriptChannel}:stdout`, this._textEncoder.encode(command));
        }, 1);

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
