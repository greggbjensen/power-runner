import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu'
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTreeModule } from '@angular/material/tree';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularSplitModule } from 'angular-split';
import { AutoSizeInputModule } from 'ngx-autosize-input';
import { AddDialogComponent, BrowseDirectoryFieldComponent } from './components';

@NgModule({
  declarations: [
    BrowseDirectoryFieldComponent,
    AddDialogComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTreeModule,
    MatIconModule,
    MatSidenavModule,
    MatDialogModule,
    MatMenuModule,
    MatToolbarModule,
    MatTabsModule,
    ReactiveFormsModule,
    AngularSplitModule.forChild(),
    AutoSizeInputModule
  ],
  entryComponents: [
    AddDialogComponent
  ],
  exports: [
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTreeModule,
    MatIconModule,
    MatSidenavModule,
    MatDialogModule,
    MatMenuModule,
    MatToolbarModule,
    MatTabsModule,
    AutoSizeInputModule,
    BrowseDirectoryFieldComponent
  ]
})
export class SharedModule { }
