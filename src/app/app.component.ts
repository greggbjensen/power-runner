import { Component, HostBinding, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as _ from 'underscore';
import { IScript, IScriptNode, IScriptRun, ScriptRef } from './core/models';
import { NodeProxyFactory, ScriptService } from './core/services';


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
  private _nodes = new BehaviorSubject<IScriptNode[]>([]);

  constructor(
    private _scriptService: ScriptService
  ) {
    this.nodes$ = this._nodes.asObservable();
    this._scriptService.listAsync(['D:/Dev/GitHub/power-runner/samples/**/*.ps1']).then((scripts) => {
      this._nodes.next(this.nodeTransform(scripts));
      if (scripts.length > 0) {
        this.selectedScript = scripts[0];
      }
    });
  }

  public onSelectionChanged(script: IScript): void {
    this.selectedScript = script;
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
