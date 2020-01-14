import { Component, EventEmitter, HostBinding, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { IScript, IScriptParam, IScriptProfile, ParamType, SaveAsType } from 'src/app/core/models';
import { ProfileService, StatusService } from 'src/app/core/services';
import { AddProfileDialogComponent } from '../add-profile-dialog/add-profile-dialog.component';
import { IAddProfileData } from '../add-profile-dialog/iadd-profile-data';


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
  public selectedProfile: string = null;
  public profiles: IScriptProfile[] = [];

  @Input() public set script(value: IScript) {

    // Create a copy to modify.
    if (value) {
      this._script = Object.assign({ }, value);
      this._script.params = value.params.map(p => Object.assign({ }, p));
      this.form = this.createFormGroup(this._script.params);
      this._profileService.listAsync(this._script.directory, this._script.name)
        .then(profiles => this.updateProfiles(profiles));
    } else {
      this._script = null;
      this.form = null;
      this.updateProfiles([]);
    }
  }

  public get script(): IScript {
    return this._script;
  }

  @Output() public run = new EventEmitter<IScript>();
  @Output() public edit = new EventEmitter<IScript>();

  private _script: IScript;

  constructor(
    public dialog: MatDialog,
    private _profileService: ProfileService,
  ) {
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

  public addProfile(): void {
    const dialogRef = this.dialog.open(AddProfileDialogComponent, {
      width: '50rem',
      data: {
        title: 'Add Profile',
        name: '',
        saveAsType: SaveAsType.Shared
      }
    });

    dialogRef.afterClosed().subscribe((data: IAddProfileData) => {

      if (data.name) {
        const profile = this.gatherProfile(data.name);
        this._profileService.updateAsync(this._script.directory, this._script.name, data.saveAsType, profile);
      }
    });
  }

  public removeProfile(): void {

  }

  private createFormGroup(params: IScriptParam[]): FormGroup {
    const fields = { };
    params.forEach(p => {
      fields[p.name] = new FormControl(p.value);
    });

    return new FormGroup(fields);
  }

  private gatherProfile(name: string): IScriptProfile {
    const profile = {
      name,
      params: { }
    };

    this.script.params.forEach(p => {
      profile.params[p.name] = this.form.value[p.name];
    });

    return profile;
  }

  private updateProfiles(profiles: IScriptProfile[]): void {
    this.profiles = profiles;
    this.selectedProfile = this.profiles.length > 0
      ? this.profiles[0].name
      : null;
  }
}
