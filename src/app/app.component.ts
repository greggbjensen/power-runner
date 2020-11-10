import { Component, HostBinding, ViewEncapsulation, NgZone } from '@angular/core';
import { IpcRenderer } from 'electron';
import { BehaviorSubject, Observable } from 'rxjs';
import * as _ from 'underscore';
const electron = (window as any).require('electron');
import { IScript, IScriptNode, ISettings, IAppUpdate, IScriptFile } from './core/models';
import { AppService, ScriptService, SettingsService } from './core/services';
import { MatDialog } from '@angular/material/dialog';
import { AppUpdateDialogComponent } from './runner/components';


@Component({
  selector: 'pru-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  private static readonly ExcludeRegex = /^\!/;

  @HostBinding('class.pru') public className = true;
  public title = 'powerrunner';
  public nodes$: Observable<IScriptNode[]>;
  public openFiles: IScriptFile[] = [];
  public selectedFile: IScriptFile;
  public showSettings = false;
  public isMaximized = false;
  public settings: ISettings;
  public elevatedStatus: string;
  private _ipcRenderer: IpcRenderer;
  private _nodes = new BehaviorSubject<IScriptNode[]>([]);

  constructor(
    private _scriptService: ScriptService,
    private _appService: AppService,
    private _settingsService: SettingsService,
    private _dialog: MatDialog,
    private _ngZone: NgZone
  ) {
    this._ipcRenderer = electron.ipcRenderer;
    this._ipcRenderer.on(`update:available`, (event, update: IAppUpdate) => {
      this.promptForAppUpdate(update);
    });

    this.nodes$ = this._nodes.asObservable();
    this.initialize();

    this._appService.getElevatedStatusAsync()
      .then(status => this.elevatedStatus = status, err => console.error(err));
  }

  public fileOpened(file: IScriptFile): void {

    const alreadyOpenScript = this.openFiles.find(s => s.id === file.id);
    if (!alreadyOpenScript) {
      this.selectedFile = file;
      this.openFiles.push(file);
    } else {
      this.selectedFile = alreadyOpenScript;
    }
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

  private promptForAppUpdate(update: IAppUpdate): void {

    // ngZone is a fix for duplicate dialogs on initial launch.
    // SourceRef: https://stackoverflow.com/questions/51810372/mat-dialog-that-is-used-in-fullcalendar-opens-twice
    this._ngZone.run(() => {
      const dialogRef = this._dialog.open(AppUpdateDialogComponent, {
        width: '50rem',
        data: update
      });

      dialogRef.afterClosed().subscribe((result: string) => {
        this._ipcRenderer.send('update:confirmation', result);
      });
    });
  }

  private async initialize(): Promise<void> {
    this.settings = await this._settingsService.readAsync();
    if (this.settings && this.settings.basePath && this.settings.searchPaths && this.settings.searchPaths.length > 0) {
      const fullPaths = this.settings.searchPaths.map(p => this.getFullPath(p));
      this._scriptService.listAsync(fullPaths).then((scripts) => {
        this._nodes.next(this.nodeTransform(scripts));
      }, err => console.error(err));

    } else {
      // Show settings so they can be setup for the first time.
      this.showSettings = true;
    }
  }

  private getFullPath(path: string): string {

    let updatedPath = path;
    const isExclude = AppComponent.ExcludeRegex.test(path);
    if (isExclude) {
      updatedPath = path.replace(AppComponent.ExcludeRegex, '');
    }

    updatedPath = isExclude
      ? `!${this.settings.basePath}/${updatedPath}`
      : `${this.settings.basePath}/${updatedPath}`;

    updatedPath = updatedPath.replace(/\\/g, '/');
    return updatedPath;
  }

  private nodeTransform(scripts: IScriptFile[]): IScriptNode[] {
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
