import * as globby from 'globby';
import * as path from 'path';
import { IScript, IScriptParams } from '../../app/core/models';
import { spawn } from 'child_process';

export class NodeScriptService {

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

  public async runAsync(script: IScript, params: IScriptParams): Promise<number>  {

    return new Promise((resolve, reject) => {
      const child = spawn('PowerShell', [`.\\${script.name}`], {
        cwd: script.directory
      });
      child.stdout.on('data', (data) => {
          console.log('Powershell Data: ' + data);
      });
      child.stderr.on('data', (data) => {
          console.log('Powershell Errors: ' + data);
      });
      child.on('exit', (exitCode) => {
        if (exitCode === 0) {
          resolve(exitCode);
        }
        else {
          reject(exitCode);
        }
        console.log("Powershell Script finished");
      });
      child.stdin.end();
    });
  }
}
