import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { IScript, IScriptParams } from 'src/app/core/models';
import { ScriptService } from 'src/app/core/services';

@Component({
  selector: 'pru-script-form',
  templateUrl: './script-form.component.html',
  styleUrls: ['./script-form.component.scss']
})
export class ScriptFormComponent implements OnInit {
  @HostBinding('class.script-form') public className = true;

  @Input() public script: IScript;

  constructor(
    private _scriptService: ScriptService
  ) { }

  public ngOnInit(): void {
  }

  public run(): void {
    const params: IScriptParams = { };
    this._scriptService.runAsync(this.script, params);
  }
}
