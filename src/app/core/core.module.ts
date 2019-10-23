import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowseDialogService, NodeProxyFactory, ScriptService } from './services';

@NgModule({
  providers: [
    ScriptService,
    NodeProxyFactory,
    BrowseDialogService
  ],
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class CoreModule { }
