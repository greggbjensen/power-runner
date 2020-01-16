import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';
import { MarkdownModule } from 'ngx-markdown';
import { AppService, BrowseDialogService, NodeProxyFactory, ScriptService, StatusService } from './services';

@NgModule({
  providers: [
    ScriptService,
    StatusService,
    NodeProxyFactory,
    BrowseDialogService,
    AppService,
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: { showDelay: 400, hideDelay: 400, touchendHideDelay: 1000 } },
  ],
  declarations: [],
  imports: [
    CommonModule,
    MarkdownModule.forRoot()
  ]
})
export class CoreModule { }
