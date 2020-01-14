import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IAddProfileData } from './iadd-profile-data';

@Component({
  selector: 'pru-add-profile-dialog',
  templateUrl: './add-profile-dialog.component.html',
  styleUrls: ['./add-profile-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddProfileDialogComponent implements OnInit {


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
    this.form.patchValue(this.data);
  }

  public add(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}
