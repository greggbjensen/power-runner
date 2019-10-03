import { Component, EventEmitter, HostBinding, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { IScript, IScriptRun } from 'src/app/core/models';


@Component({
  selector: 'pru-script-form',
  templateUrl: './script-form.component.html',
  styleUrls: ['./script-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ScriptFormComponent implements OnInit {
  @HostBinding('class.script-form') public className = true;

  @Input() public script: IScript;

  @Output() public run = new EventEmitter<IScriptRun>();

  constructor(
  ) { }

  public ngOnInit(): void {
  }

  public startRun(): void {
    const scriptRun: IScriptRun = {
      script: this.script,
      params: { }
    };
    this.run.emit(scriptRun);
  }
}
