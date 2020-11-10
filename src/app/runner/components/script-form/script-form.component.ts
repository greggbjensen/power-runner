import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, HostBinding, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { IScript, IScriptFile, IScriptParam, IScriptProfile, IScriptRun, ParamType, SaveAsType, ScriptStatus } from 'src/app/core/models';
import { ProfileService, ScriptService, StatusService } from 'src/app/core/services';
import { ScriptFormatter } from 'src/app/core/utils';
import * as _ from 'underscore';
import { AddProfileDialogComponent } from '../add-profile-dialog/add-profile-dialog.component';


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
  public profileForm = new FormGroup({
    selectedProfileId: new FormControl('')
  });
  public profiles: IScriptProfile[] = [];
  public selectedProfile: IScriptProfile;
  public script: IScript;

  // tslint:disable-next-line:naming-convention
  public ScriptStatus = ScriptStatus;

  // tslint:disable-next-line:naming-convention
  public SaveAsType = SaveAsType;

  @Input() public set file(value: IScriptFile) {

    // Create a copy to modify.
    if (value) {
      this._file = value;
      this.refreshAsync();
    } else {
      this._file = null;
      this.script = null;
      this.form = null;
      this.selectedProfile = null;
      this.updateProfiles([]);
    }
  }

  public get file(): IScriptFile {
    return this._file;
  }

  @Output() public run = new EventEmitter<IScriptRun>();
  @Output() public stop = new EventEmitter<IScript>();
  @Output() public edit = new EventEmitter<IScript>();

  private _file: IScriptFile;

  constructor(
    public dialog: MatDialog,
    private _profileService: ProfileService,
    private _statusService: StatusService,
    private _scriptService: ScriptService,
    private _clipboard: Clipboard
  ) {
  }

  public ngOnInit(): void {
    this.profileForm.get('selectedProfileId').valueChanges.subscribe(value => {
      this.loadProfile(value);
    });
  }

  public getIcon(profile: IScriptProfile): string {
    return profile && profile.saveAsType === SaveAsType.Personal
      ? 'lock'
      : 'people';
  }

  public copyCommand(): void {

    this.updateParamValues();
    const paramList = this.script.params.map(p => ScriptFormatter.formatParam(p)).join(' ');
    const command = `${this._file.directory}\\${this._file.name} ${paramList}`;
    this._clipboard.copy(command);
  }

  public startRun(runExternal: boolean = false): void {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      const errors = [];
      Object.keys(this.form.controls).forEach(name => {
        const control = this.form.get(name);
        if (control.invalid) {
          Object.keys(control.errors).forEach(key => {
            switch (key) {
              case 'required':
                errors.push(`${name} is required!`);
                break;

              default:
                break;
            }
          });
        }
      });

      const firstError = errors[0];
      this._statusService.setStatus(firstError);
      return;
    }

    this.updateParamValues();
    this.run.emit({ script: this.script, runExternal});
  }

  public stopRun(): void {
    this.stop.emit(this.script);
  }

  public startEdit(): void {
    this.edit.emit(this.script);
  }

  public async refreshAsync(): Promise<void> {
    this.script = null;
    this.form = null;
    this.selectedProfile = null;
    this.updateProfiles([]);

    this.script = await this._scriptService.parseAsync(this._file);
    this.form = this.createFormGroup(this.script.params);
    this._profileService.listAsync(this._file.directory, this._file.name)
      .then(profiles => this.updateProfiles(profiles), err => console.error(err));
  }

  public addProfile(): void {
    const dialogRef = this.dialog.open(AddProfileDialogComponent, {
      width: '50rem',
      data: {
        title: 'Add Profile',
        profile: {
          name: '',
          saveAsType: SaveAsType.Shared
        },
        existingProfiles: this.profiles
      }
    });

    dialogRef.afterClosed().subscribe((profile: IScriptProfile) => {

      if (profile) {
        this.saveUpdatedProfileAsync(profile.name, profile.saveAsType);
      }
    });
  }

  public undoProfile(): void {
    this.loadProfile(this.selectedProfile.id);
  }

  public saveProfile(): void {
    this.saveUpdatedProfileAsync(this.selectedProfile.name, this.selectedProfile.saveAsType);
  }

  public removeProfile(): void {
    this._statusService.setStatus(`Removing ${this.selectedProfile.saveAsType} profile "${this.selectedProfile.name}"`);

    const profileSaveAsType = this.selectedProfile.saveAsType;
    const profileName = this.selectedProfile.name;
    this._profileService.deleteAsync(this._file.directory, this._file.name, this.selectedProfile.name, this.selectedProfile.saveAsType)
      .then(() => this._profileService.listAsync(this._file.directory, this._file.name))
      .then(profiles => {
        this.updateProfiles(profiles);
        this._statusService.setStatus(`${profileSaveAsType} profile "${profileName}" removed`);
      }, err => console.error(err));
  }

  private async saveUpdatedProfileAsync(profileName: string, saveAsType: SaveAsType): Promise<void> {
    this._statusService.setStatus(`Saving profile "${profileName}"`);

    const profile = this.gatherProfile(profileName, saveAsType);
    await this._profileService.updateAsync(this._file.directory, this._file.name, profile, saveAsType);
    const profiles = await this._profileService.listAsync(this._file.directory, this._file.name);
    this.updateProfiles(profiles, profile.id);

    this._statusService.setStatus(`Profile "${profileName}" saved`);
  }

  private createFormGroup(params: IScriptParam[]): FormGroup {
    const fields = { };
    params.forEach(p => {
      const validators: ValidatorFn[] = [];
      if (p.validation && p.validation.required) {
        validators.push(Validators.required);
      }

      fields[p.name] = new FormControl(p.value, validators);
    });

    return new FormGroup(fields);
  }

  private gatherProfile(name: string, saveAsType: SaveAsType): IScriptProfile {
    const profile = {
      id: `${saveAsType.toLowerCase()}_${name.toLowerCase()}`,
      name,
      params: { },
      saveAsType
    };

    this.script.params.forEach(p => {
      profile.params[p.name] = this.form.value[p.name];
    });

    return profile;
  }

  private updateProfiles(profiles: IScriptProfile[], selectedProfileId: string = null): void {
    this.profiles = profiles;
    if (selectedProfileId) {
      this.setSelectedProfile(selectedProfileId);
    } else {
      this.setSelectedProfile('default');
    }
  }

  private setSelectedProfile(profileId: string): void {
    const profile = this.getProfileOrDefault(profileId);
    this.profileForm.patchValue({
      selectedProfileId: profile ? profile.id : null
    });
    this.selectedProfile = profile;
  }

  private getProfileOrDefault(profileId: string): IScriptProfile {

    const searchId = (profileId ? profileId : 'default');
    let profile = this.profiles.find(p => p.id === searchId);
    if (!profile) {
      profile = this.profiles.find(p => p.id === 'default');
    }

    return profile;
  }

  private loadProfile(profileId: string): void {
    const profile = this.getProfileOrDefault(profileId);
    this.selectedProfile = profile;

    let applyParams: { [name: string]: any };
    if (profile.id === 'default') {
      applyParams = { };
      this.script.params.forEach(p => applyParams[p.name] = p.default);
    } else {
      applyParams = profile.params;
    }

    if (applyParams) {
      const params = { };
      Object.keys(applyParams).forEach(name => {
        params[name] = applyParams[name];
      });

      this.form.patchValue(params);
    }
  }

  private updateParamValues(): void {
    this.script.params.forEach(p => {
      p.value = this.form.value[p.name];
    });
  }
}
