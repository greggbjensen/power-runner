import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ControlContainer, FormGroup } from '@angular/forms';
import { BrowseDialogService } from 'src/app/core/services';
const electron = (window as any).require('electron');

@Component({
  selector: 'pru-browse-directory-field',
  templateUrl: './browse-directory-field.component.html',
  styleUrls: ['./browse-directory-field.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BrowseDirectoryFieldComponent implements OnInit {

  @Input() public label: string;
  @Input() public placeholder: string;
  @Input() public controlName: string;

  public get form(): FormGroup {
    return this._controlContainer.control as FormGroup;
  }

  constructor(
    private _controlContainer: ControlContainer,
    private _browseDialogService: BrowseDialogService
  ) {
  }

  public ngOnInit(): void {
  }

  public browseBasePath(): void {
    this._browseDialogService.selectDirectoryAsync()
      .then(d => this.form.patchValue({
        [this.controlName]: d
      }), err => console.error(err));
  }
}
