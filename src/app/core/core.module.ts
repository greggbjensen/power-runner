import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppService, BrowseDialogService, NodeProxyFactory, ScriptService } from './services';

@NgModule({
  providers: [
    ScriptService,
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
