import { Injectable } from '@angular/core';
import { IScript, IScriptFile } from '../models';
import { NodeProxyRegistry } from './node-proxy.registry';
import { ProxyNodeService } from './proxy-node-service';
import { StatusService } from './status.service';

@Injectable({
  providedIn: 'root'
})
export class ScriptService extends ProxyNodeService {

  constructor(
    private _statusService: StatusService
  ) {
    super('NodeScriptService');
  }

  public async listAsync(fileGlobs: string[]): Promise<IScriptFile[]> {
    return this.proxy.invoke('listAsync', fileGlobs);
  }

  public async runAsync(script: IScript, runExternal: boolean = false): Promise<string> {
    this._statusService.setStatus(`${script.module.toUpperCase()}/${script.name} running...`);
    return this.proxy.invoke('runAsync', script, runExternal);
  }

  public async stopAsync(script: IScriptFile): Promise<string> {
    this._statusService.setStatus(`${script.module.toUpperCase()}/${script.name} stopping...`);
    return this.proxy.invoke('stopAsync', script);
  }

  public async editAsync(script: IScriptFile): Promise<IScript[]> {
    return this.proxy.invoke('editAsync', script);
  }

  public async parseAsync(file: IScriptFile): Promise<IScript> {
    this._statusService.setStatus(`Loading ${file.module.toUpperCase()}/${file.name}...`);
    return this.proxy.invoke('parseAsync', file);
  }

  public async preCacheAsync(files: IScriptFile[]): Promise<void> {
    await this.proxy.invoke('preCacheAsync', files);
  }

  public async disposeAsync(): Promise<void> {
    return this.proxy.invoke('diposeAsync');
  }
}
