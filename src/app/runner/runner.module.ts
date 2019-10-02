import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularSplitModule } from 'angular-split';
import { SharedModule } from '../shared/shared.module';
import { ScriptFormComponent, ScriptLogComponent, ScriptPageComponent, ScriptTreeComponent } from './components';
import { ScriptLogWriterDirective } from './directives/script-log-writer.directive';

@NgModule({
  declarations: [
    ScriptTreeComponent,
    ScriptFormComponent,
    ScriptLogComponent,
    ScriptLogWriterDirective,
    ScriptPageComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
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
