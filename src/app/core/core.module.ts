import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService } from './services';

@NgModule({
  providers: [
    FileService
  ],
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class CoreModule { }
