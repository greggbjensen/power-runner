import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IAddDialogData } from './iadd-dialog-data';

@Component({
  selector: 'pru-add-dialog',
  templateUrl: './add-dialog.component.html',
  styleUrls: ['./add-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddDialogComponent implements OnInit {

  public form = new FormGroup({
    name: new FormControl('', Validators.required)
  });

  constructor(
    public dialogRef: MatDialogRef<AddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IAddDialogData
  ) { }

  public ngOnInit(): void {
  }

  public add(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.name);
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}
