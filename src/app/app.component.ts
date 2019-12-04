import { Component, HostBinding, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as _ from 'underscore';
import { IScript, IScriptNode, ISettings } from './core/models';
import { AppService, ScriptService, SettingsService } from './core/services';


@Component({
  selector: 'pru-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  @HostBinding('class.pru') public className = true;
  public title = 'power-runner';
  public nodes$: Observable<IScriptNode[]>;
  public openScripts: IScript[] = [];
  public showSettings = false;
  public isMaximized = false;
  public settings: ISettings;
  private _nodes = new BehaviorSubject<IScriptNode[]>([]);

  constructor(
    private _scriptService: ScriptService,
    private _appService: AppService,
    private _settingsService: SettingsService
  ) {
    this.nodes$ = this._nodes.asObservable();
    this.initialize();
  }

  public scriptOpened(script: IScript): void {
    this.openScripts.push(script);
  }

  public toggleSettings(): void {
    this.showSettings = true;
  }

  public reloadWindow(): void {
    this._appService.reloadWindowAsync();
  }

  public exit(): void {
    this._appService.exitAsync();
  }

  public minimize(): void {
    this._appService.minimizeAsync();
  }

  public toggleMaximize(): void {
    this.isMaximized = !this.isMaximized;
    if (this.isMaximized) {
      this._appService.maximizeAsync();
    } else {
      this._appService.restoreAsync();
    }
  }

  public toggleDeveloperTools(): void {
    this._appService.toggleDeveloperToolsAsync();
  }

  public settingsClosed(result: string): void {
    this.showSettings = false;

    if (result === 'saved') {

      // Update loaded files.
      this.initialize();
    }
  }

  private async initialize(): Promise<void> {
    this.settings = await this._settingsService.readAsync();
    if (this.settings && this.settings.basePath && this.settings.searchPaths && this.settings.searchPaths.length > 0) {
      const fullPaths = this.settings.searchPaths.map(p => `${this.settings.basePath}/${p}`.replace(/\\/g, '/'));
      this._scriptService.listAsync(fullPaths).then((scripts) => {
        this._nodes.next(this.nodeTransform(scripts));
      });
    }
  }

  private nodeTransform(scripts: IScript[]): IScriptNode[] {
    const grouped = _.groupBy(scripts, s => s.module);
    return _.keys(grouped).map(key => ({
      name: key,
      children: grouped[key].map(s => ({
        name: s.name,
        script: s
      }))
    } as IScriptNode));
  }
}
