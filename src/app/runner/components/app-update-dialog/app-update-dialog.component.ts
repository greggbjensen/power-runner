import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IAppUpdate } from 'src/app/core/models';

@Component({
  selector: 'pru-app-update-dialog',
  templateUrl: './app-update-dialog.component.html',
  styleUrls: ['./app-update-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppUpdateDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AppUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IAppUpdate
  ) { }

  public ngOnInit(): void {
  }

  public update(): void {
    this.dialogRef.close('Update');
  }

  public cancel(): void {
    this.dialogRef.close('Cancel');
  }
}
