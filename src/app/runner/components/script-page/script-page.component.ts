import { Component, HostBinding, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { IScript, IScriptRun, ScriptRef } from 'src/app/core/models';
import { NodeProxyFactory, ScriptService } from 'src/app/core/services';

@Component({
  selector: 'pru-script-page',
  templateUrl: './script-page.component.html',
  styleUrls: ['./script-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ScriptPageComponent implements OnInit {
  @HostBinding('class.script-page') public className = true;
  @Input() public script: IScript;
  public scriptRef: ScriptRef;

  constructor(
    private _scriptService: ScriptService,
    private _nodeProxyFactory: NodeProxyFactory
  ) { }

  public ngOnInit(): void {
  }

  public startRun(scriptRun: IScriptRun): void {
    this._scriptService.runAsync(scriptRun).then((scriptChannel: string) => {
      this.scriptRef = this._nodeProxyFactory.createScriptRef(scriptChannel);
    });
  }
}
