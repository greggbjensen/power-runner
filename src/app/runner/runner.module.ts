import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';
import { SharedModule } from '../shared/shared.module';
import {
  AddProfileDialogComponent,
  ScriptFormComponent,
  ScriptLogComponent,
  ScriptPageComponent,
  ScriptTabsContainerComponent,
  ScriptTreeComponent,
  SettingsPaneComponent,
  StatusBarComponent
} from './components';
import { ScriptLogWriterDirective } from './directives/script-log-writer.directive';

@NgModule({
  declarations: [
    ScriptTreeComponent,
    ScriptFormComponent,
    ScriptLogComponent,
    ScriptLogWriterDirective,
    ScriptPageComponent,
    SettingsPaneComponent,
    ScriptTabsContainerComponent,
    StatusBarComponent,
    AddProfileDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    AngularSplitModule.forChild()
  ],
  entryComponents: [
    AddProfileDialogComponent
  ],
  exports: [
    ScriptTreeComponent,
    ScriptFormComponent,
    ScriptLogComponent,
    ScriptPageComponent,
    SettingsPaneComponent,
    ScriptTabsContainerComponent,
    StatusBarComponent
  ]
})
export class RunnerModule { }
