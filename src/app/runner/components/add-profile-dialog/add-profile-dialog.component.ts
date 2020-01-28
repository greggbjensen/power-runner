import { Component, HostBinding, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { SaveAsType } from 'src/app/core/models';
import { IAddProfileData } from './iadd-profile-data';

@Component({
  selector: 'pru-add-profile-dialog',
  templateUrl: './add-profile-dialog.component.html',
  styleUrls: ['./add-profile-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddProfileDialogComponent implements OnInit, OnDestroy {
  @HostBinding('class.add-profile-dialog') public className = true;

  public hasExistingName = false;

  public form = new FormGroup({
    title: new FormControl(''),
    name: new FormControl('', Validators.required),
    saveAsType: new FormControl('', Validators.required),
  });

  constructor(
    public dialogRef: MatDialogRef<AddProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IAddProfileData
  ) { }

  public ngOnInit(): void {
    this.form.patchValue(this.data.profile);
    this.form.get('name').valueChanges
      .pipe(untilComponentDestroyed(this))
      .subscribe(name => this.updateHasExistingName(name, this.form.value.saveAsType));

    this.form.get('saveAsType').valueChanges
      .pipe(untilComponentDestroyed(this))
      .subscribe(saveAsType => this.updateHasExistingName(this.form.value.name, saveAsType));
  }

  public ngOnDestroy(): void {
  }

  public add(): void {
    if (this.form.valid && !this.hasExistingName) {
      this.dialogRef.close(this.form.value);
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  private updateHasExistingName(name: string, saveAsType: SaveAsType): void {
    this.hasExistingName = !!this.data.existingProfiles
      .find(p => p.saveAsType === saveAsType && p.name.toLowerCase() === name.toLowerCase());
  }
}
