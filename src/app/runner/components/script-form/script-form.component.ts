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
  public profileForm = new FormGroup({
    selectedProfile: new FormControl('')
  });
  public profiles: IScriptProfile[] = [];

  public get selectedProfile(): string {
    return this.profileForm.value.selectedProfile;
  }

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
    private _statusService: StatusService
  ) {
  }

  public ngOnInit(): void {
    this.profileForm.get('selectedProfile').valueChanges.subscribe(value => {
      this.loadProfile(value);
    });
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
        this.saveUpdatedProfileAsync(data.name, data.saveAsType);
      }
    });
  }

  public undoProfile(): void {
    this.loadProfile(this.selectedProfile);
  }

  public saveProfile(): void {
    this.saveUpdatedProfileAsync(this.selectedProfile);
  }

  public removeProfile(): void {
    this._statusService.setStatus(`Removing profile "${this.selectedProfile}"`);

    this._profileService.deleteAsync(this.script.directory, this.script.name, this.selectedProfile)
      .then(() => this._profileService.listAsync(this.script.directory, this.script.name))
      .then(profiles => {
        this.updateProfiles(profiles);
        this._statusService.setStatus(`Profile "${this.selectedProfile}" removed`);
      }, err => console.error(err));
  }

  private async saveUpdatedProfileAsync(profileName: string, saveAsType: SaveAsType = null): Promise<void> {
    this._statusService.setStatus(`Saving profile "${profileName}"`);

    const profile = this.gatherProfile(profileName);
    await this._profileService.updateAsync(this._script.directory, this._script.name, profile, saveAsType);
    const profiles = await this._profileService.listAsync(this.script.directory, this.script.name);
    this.updateProfiles(profiles, profile.name);

    this._statusService.setStatus(`Profile "${profileName}" saved`);
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

  private updateProfiles(profiles: IScriptProfile[], selectedProfile: string = null): void {
    this.profiles = profiles;

    if (this.profiles.length > 0) {
      if (selectedProfile) {
        const profile = this.profiles.find(p => p.name.toLowerCase() === selectedProfile.toLowerCase());
        this.profileForm.patchValue({
          selectedProfile: profile ? profile.name : null
        });
      }

      if (!this.selectedProfile) {
        this.profileForm.patchValue({
          selectedProfile: this.profiles[0].name
        });

      } else if (!this.profiles.find(p => p.name.toLowerCase() === this.selectedProfile.toLowerCase())) {
        this.profileForm.patchValue({
          selectedProfile: 'Default'
        });
      }
    } else {
      this.profileForm.patchValue({
        selectedProfile: 'Default'
      });
    }
  }

  private loadProfile(profileName: string): void {
    const lowerProfileName = profileName.toLowerCase();

    let applyParams: { [name: string]: any };
    if (lowerProfileName === 'default') {
      applyParams = { };
      this._script.params.forEach(p => applyParams[p.name] = p.default);
    } else {
      const profile = this.profiles.find(p => p.name.toLowerCase() === lowerProfileName);
      if (profile) {
        applyParams = profile.params;
      }
    }

    if (applyParams) {
      const params = { };
      Object.keys(applyParams).forEach(name => {
        params[name] = applyParams[name];
      });

      this.form.patchValue(params);
    }
  }
}
