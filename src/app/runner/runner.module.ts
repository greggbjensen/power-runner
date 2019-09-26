import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ScriptFormComponent, ScriptLogComponent, ScriptTreeComponent } from './components';
import { ScriptLogWriterDirective } from './directives/script-log-writer.directive';

@NgModule({
  declarations: [
    ScriptTreeComponent,
    ScriptFormComponent,
    ScriptLogComponent,
    ScriptLogWriterDirective
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    ScriptTreeComponent,
    ScriptFormComponent,
    ScriptLogComponent
  ]
})
export class RunnerModule { }
