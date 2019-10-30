import { Component, EventEmitter, HostBinding, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ISettings } from 'src/app/core/models';
import { SettingsService } from 'src/app/core/services';

@Component({
  selector: 'pru-settings-pane',
  templateUrl: './settings-pane.component.html',
  styleUrls: ['./settings-pane.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SettingsPaneComponent implements OnInit {
  @HostBinding('class.settings-pane') public className = true;
  public form: FormGroup = new FormGroup({
    basePath: new FormControl('', Validators.required),
    searchPaths: new FormControl('', Validators.required)
  });

  @Output() public closed = new EventEmitter<any>();
  @Input() public set settings(value: ISettings) {
    if (value) {
      this.form.patchValue({
        basePath: value.basePath,
        searchPaths: value.searchPaths.join('\n')
      });
    } else {
      this.form.reset();
    }
  }

  constructor(
    private _settingsService: SettingsService
  ) { }

  public ngOnInit(): void {
  }

  public cancel(): void {
    this.closed.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.value;
    const settings: ISettings = {
      basePath: value.basePath,
      searchPaths: value.searchPaths.split('\n').map(s => s.trim())
    };

    this._settingsService.saveAsync(settings)
      .then(() => this.closed.emit());
  }
}
