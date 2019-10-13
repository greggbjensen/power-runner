import { Component, HostBinding, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IpcRenderer } from 'electron';
import { BehaviorSubject, Observable } from 'rxjs';
import * as _ from 'underscore';
import { IScript, IScriptNode } from './core/models';
import { ScriptService, SettingsService } from './core/services';
const electron = (window as any).require('electron');


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
  public selectedScript: IScript;
  public showSettings = false;
  private _nodes = new BehaviorSubject<IScriptNode[]>([]);
  private _ipcRenderer: IpcRenderer | undefined;

  constructor(
    private _scriptService: ScriptService,
    private _dialog: MatDialog,
    private _settingsService: SettingsService // This must be injected to receive events.
  ) {
    this.nodes$ = this._nodes.asObservable();
    this._scriptService.listAsync(['D:/Dev/GitHub/power-runner/samples/**/*.ps1']).then((scripts) => {
      this._nodes.next(this.nodeTransform(scripts));
      if (scripts.length > 0) {
        this.selectedScript = scripts[0];
      }
    });

    this._ipcRenderer = electron.ipcRenderer;
  }

  public onSelectionChanged(script: IScript): void {
    this.selectedScript = script;
  }

  public settings(): void {
    console.log('OPEN');
    this.showSettings = true;
  }

  public exit(): void {
    this._ipcRenderer.send('file:exit');
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
