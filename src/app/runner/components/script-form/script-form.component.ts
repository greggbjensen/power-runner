import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, HostBinding, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { IScript, IScriptParam, IScriptProfile, IScriptRun, ParamType, SaveAsType, ScriptStatus } from 'src/app/core/models';
import { ProfileService, StatusService } from 'src/app/core/services';
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

  // tslint:disable-next-line:naming-convention
  public ScriptStatus = ScriptStatus;

  // tslint:disable-next-line:naming-convention
  public SaveAsType = SaveAsType;

  @Input() public set script(value: IScript) {

    // Create a copy to modify.
    if (value) {
      this._script = Object.assign({ }, value);
      this._script.params = value.params.map(p => Object.assign({ }, p));
      this.form = this.createFormGroup(this._script.params);
      this._profileService.listAsync(this._script.directory, this._script.name)
        .then(profiles => this.updateProfiles(profiles), err => console.error(err));
    } else {
      this._script = null;
      this.form = null;
      this.selectedProfile = null;
      this.updateProfiles([]);
    }
  }

  public get script(): IScript {
    return this._script;
  }

  @Output() public run = new EventEmitter<IScriptRun>();
  @Output() public stop = new EventEmitter<IScript>();
  @Output() public edit = new EventEmitter<IScript>();

  private _script: IScript;

  constructor(
    public dialog: MatDialog,
    private _profileService: ProfileService,
    private _statusService: StatusService,
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
    const command = `${this.script.directory}\\${this._script.name} ${paramList}`;
    this._clipboard.copy(command);
  }

  public startRun(runExternal: boolean = false): void {
    this.updateParamValues();
    this.run.emit({ script: this.script, runExternal});
  }

  public stopRun(): void {
    this.stop.emit(this.script);
  }

  public startEdit(): void {
    this.edit.emit(this.script);
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
    this._profileService.deleteAsync(this.script.directory, this.script.name, this.selectedProfile.name, this.selectedProfile.saveAsType)
      .then(() => this._profileService.listAsync(this.script.directory, this.script.name))
      .then(profiles => {
        this.updateProfiles(profiles);
        this._statusService.setStatus(`${profileSaveAsType} profile "${profileName}" removed`);
      }, err => console.error(err));
  }

  private async saveUpdatedProfileAsync(profileName: string, saveAsType: SaveAsType): Promise<void> {
    this._statusService.setStatus(`Saving profile "${profileName}"`);

    const profile = this.gatherProfile(profileName, saveAsType);
    await this._profileService.updateAsync(this._script.directory, this._script.name, profile, saveAsType);
    const profiles = await this._profileService.listAsync(this.script.directory, this.script.name);
    this.updateProfiles(profiles, profile.id);

    this._statusService.setStatus(`Profile "${profileName}" saved`);
  }

  private createFormGroup(params: IScriptParam[]): FormGroup {
    const fields = { };
    params.forEach(p => {
      fields[p.name] = new FormControl(p.value);
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
      this._script.params.forEach(p => applyParams[p.name] = p.default);
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
