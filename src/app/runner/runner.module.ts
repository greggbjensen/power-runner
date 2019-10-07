import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';
import { SharedModule } from '../shared/shared.module';
import { ScriptFormComponent, ScriptLogComponent, ScriptPageComponent, ScriptTreeComponent } from './components';
import { ScriptLogWriterDirective } from './directives/script-log-writer.directive';
import { SettingsDialogComponent } from './components/settings-dialog/settings-dialog.component';

@NgModule({
  declarations: [
    ScriptTreeComponent,
    ScriptFormComponent,
    ScriptLogComponent,
    ScriptLogWriterDirective,
    ScriptPageComponent,
    SettingsDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    AngularSplitModule.forChild()
  ],
  exports: [
    ScriptTreeComponent,
    ScriptFormComponent,
    ScriptLogComponent,
    ScriptPageComponent
  ]
})
export class RunnerModule { }
