import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppService, BrowseDialogService, NodeProxyFactory, ScriptService, StatusService } from './services';

@NgModule({
  providers: [
    ScriptService,
    StatusService,
    NodeProxyFactory,
    BrowseDialogService,
    AppService
  ],
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class CoreModule { }
