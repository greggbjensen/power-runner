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

  public exit(): void {
    this._appService.exitAsync();
  }

  private async initialize(): Promise<void> {
    this.settings = await this._settingsService.readAsync();
    console.log('SETTINGS', this.settings);
    if (this.settings && this.settings.basePath && this.settings.searchPaths && this.settings.searchPaths.length > 0) {
      const fullPaths = this.settings.searchPaths.map(p => `${this.settings.basePath}/${p}`);
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
