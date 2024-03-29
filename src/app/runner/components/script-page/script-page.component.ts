import { Component, HostBinding, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { IScript, IScriptFile, IScriptRun, ScriptRef } from 'src/app/core/models';
import { NodeProxyRegistry, ScriptService } from 'src/app/core/services';
import { ScriptLogComponent } from '../script-log/script-log.component';

@Component({
  selector: 'pru-script-page',
  templateUrl: './script-page.component.html',
  styleUrls: ['./script-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ScriptPageComponent implements OnInit {
  @HostBinding('class.script-page') public className = true;
  @Input() public file: IScriptFile;
  @ViewChild(ScriptLogComponent) public scriptLog: ScriptLogComponent;
  public scriptRef: ScriptRef;

  constructor(
    private _scriptService: ScriptService,
    private _nodeProxyRegistry: NodeProxyRegistry
  ) { }

  public ngOnInit(): void {
  }

  public startRun(scriptRun: IScriptRun): void {
    this._scriptService.runAsync(scriptRun.script, scriptRun.runExternal).then((scriptChannel: string) => {
      this.scriptRef = this._nodeProxyRegistry.createScriptRef(scriptRun.script, scriptChannel);
    });
  }

  public stopRun(script: IScript): void {
    this._scriptService.stopAsync(script);
  }

  public startEdit(script: IScript): void {
    this._scriptService.editAsync(script);
  }
}
