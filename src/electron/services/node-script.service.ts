import { exec, spawn } from 'child_process';
import { App, BrowserWindow, clipboard, ipcMain } from 'electron';
import * as fs from 'fs';
import * as globby from 'globby';
import * as pty from 'node-pty';
import * as os from 'os';
import * as path from 'path';
import { Md5 } from 'ts-md5/dist/md5';
import { IPowerShellParam, IScript, IScriptExit, IScriptFile, IScriptParam, ParamType } from '../../app/core/models';
import { ScriptFormatter } from '../../app/core/utils/script-formatter';
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

  private _childProcesses = new Map<string, pty.IPty>();

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
  }

  private static readFileAsync(filePath: string): Promise<string> {
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

  public async parseAsync(file: IScriptFile): Promise<IScript> {

    const hash = await this.getFileHashAsync(file);
    let script = await this._cache.getAsync(file.module, file.name);
    const isCached = !!script;
    if (!isCached || script.hash !== hash) {
      script = await this.internalParseAsync(file);
      script.hash = hash;

      if (!isCached) {
        await this._cache.addAsync(file.module, file.name, script);
      } else {
        await this._cache.updateAsync(file.module, file.name, script);
      }

    }

    return script;
  }

  private async getFileHashAsync(file: IScriptFile): Promise<string> {

    const filePath = `${file.directory}\\${file.name}`;
    const fileContent = await NodeScriptService.readFileAsync(filePath);
    const hash = Md5.hashStr(fileContent) as string;
    return hash;
  }

  private internalParseAsync(file: IScriptFile): Promise<IScript> {

    return new Promise((resolve, reject) => {

      const filePath = `${file.directory}\\${file.name}`;
      const resourcesPath = !NodeScriptService.NodeModulesRegex.test(process.resourcesPath)
        ? process.resourcesPath
        : path.dirname(this._app.getAppPath());
      const workingDirectory = `${resourcesPath}\\electron\\powershell`;
      const command = `"${NodeScriptService.PowerShellPath}" "${workingDirectory}\\GetCommandMetadata.ps1" "${filePath}"`;
      exec(command, { cwd: workingDirectory }, (error, stdout, stderr) => {

        if (error) {
          console.error(error);
          reject(error);
        } else if (stdout) {

          // Ensure result is always an array.
          let parameters = JSON.parse(stdout);
          if (!Array.isArray(parameters)) {
            parameters = [parameters];
          }

          const script = Object.assign({ }, file) as IScript;
          script.params = parameters.map(p => this.projectParameter(p));
          resolve(script);
        } else {
          reject(stderr);
        }
      });
    });
  }

  private projectParameter(parameter: IPowerShellParam): IScriptParam {
    const param = {
      name: parameter.name,
      default: parameter.default,
      validation: { }
    } as IScriptParam;

    // Process defaults.
    if (param.default) {
      switch (param.default.toLowerCase()) {
        case '$true':
          param.default = true;
          break;

        case '$false':
          param.default = false;
          break;

        default:
          break;
      }
    }

    // Process attributes.
    if (parameter.attributes) {
      parameter.attributes.forEach(attribute => {
        switch (attribute.type.toLowerCase()) {
          case 'parameter':
            if (attribute.required) {
              param.validation.required = true;
            }
            break;

          case 'validateset':
            param.type = ParamType.Set;
            param.validation.set = attribute.values;
            break;

          default:
            break;
        }
      });
    }

    // Process type.
    if (!param.type) {
      switch (parameter.type.toLowerCase()) {
        case 'switch':
          param.type = ParamType.Switch;
          break;

        case 'boolean':
          param.type = ParamType.Boolean;
          break;

        case 'string':
          param.type = ParamType.String;
          break;

        case 'securescript':
          param.type = ParamType.SecureString;
          break;

        default:
          param.type = ParamType.Number;
          console.error(`Type not mapped: ${parameter.type}`);
          break;
      }
    }

    return param;
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
