import { Component, EventEmitter, HostBinding, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { IScript, IScriptParam } from 'src/app/core/models';


@Component({
  selector: 'pru-script-form',
  templateUrl: './script-form.component.html',
  styleUrls: ['./script-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ScriptFormComponent implements OnInit {
  @HostBinding('class.script-form') public className = true;
  public form: FormGroup;

  @Input() public set script(value: IScript) {

    // Create a copy to modify.
    this._script = Object.assign({ }, value);
    this._script.params = value.params.map(p => Object.assign({ }, p));
    this.form = this.createFormGroup(this._script.params);
  }

  public get script(): IScript {
    return this._script;
  }

  @Output() public run = new EventEmitter<IScript>();

  private _script: IScript;

  constructor(
  ) { }

  public ngOnInit(): void {
  }

  public startRun(): void {
    this.script.params.forEach(p => {
      p.value = this.form.value[p.name];
    });
    this.run.emit(this.script);
  }

  private createFormGroup(params: IScriptParam[]): FormGroup {
    const fields = { };
    params.forEach(p => {
      fields[p.name] = new FormControl(p.value);
    });

    return new FormGroup(fields);
  }
}
