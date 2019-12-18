import { Component, EventEmitter, HostBinding, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { IScript, IScriptParam, IScriptProfile, ParamType } from 'src/app/core/models';


@Component({
  selector: 'pru-script-form',
  templateUrl: './script-form.component.html',
  styleUrls: ['./script-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ScriptFormComponent implements OnInit {
  @HostBinding('class.script-form') public className = true;
  // tslint:disable-next-line: naming-convention
  public ParamType = ParamType;
  public form: FormGroup;
  public selectedProfile: string;
  public profiles: IScriptProfile[] = [
    {
      name: 'Default',
      params: {
        name: 'Test'
      },
    },
    {
      name: 'Last Run',
      params: {
        name: 'Test'
      }
    }
  ];

  @Input() public set script(value: IScript) {

    // Create a copy to modify.
    if (value) {
      this._script = Object.assign({ }, value);
      this._script.params = value.params.map(p => Object.assign({ }, p));
      this.form = this.createFormGroup(this._script.params);
    } else {
      this._script = null;
      this.form = null;
    }
  }

  public get script(): IScript {
    return this._script;
  }

  @Output() public run = new EventEmitter<IScript>();
  @Output() public edit = new EventEmitter<IScript>();

  private _script: IScript;

  constructor(
  ) {
    this.selectedProfile = this.profiles[0].name;
  }

  public ngOnInit(): void {
  }

  public startRun(): void {
    this.script.params.forEach(p => {
      p.value = this.form.value[p.name];
    });
    this.run.emit(this.script);
  }

  public startEdit(): void {
    this.edit.emit(this.script);
  }

  private createFormGroup(params: IScriptParam[]): FormGroup {
    const fields = { };
    params.forEach(p => {
      fields[p.name] = new FormControl(p.value);
    });

    return new FormGroup(fields);
  }
}
