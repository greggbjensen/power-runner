import { CommonModule } from '@angular/common';
import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';
import { MarkdownModule } from 'ngx-markdown';
import { AppService, BrowseDialogService, NodeProxyRegistry, ProfileService, ScriptService, SettingsService, StatusService } from './services';

@NgModule({
  providers: [
    ScriptService,
    StatusService,
    NodeProxyRegistry,
    BrowseDialogService,
    ProfileService,
    AppService,
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: { showDelay: 400, hideDelay: 400, touchendHideDelay: 1000 } },
    {
      provide: APP_INITIALIZER,
      useFactory: (registry: NodeProxyRegistry, injector: Injector) => () => {

        registry.initialize(
          injector.get(AppService),
          injector.get(ScriptService),
          injector.get(BrowseDialogService),
          injector.get(ProfileService),
          injector.get(SettingsService));
      },
      deps: [NodeProxyRegistry, Injector],
      multi: true
    }
  ],
  declarations: [],
  imports: [
    CommonModule,
    MarkdownModule.forRoot()
  ]
})
export class CoreModule { }
