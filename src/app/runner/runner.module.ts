import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ScriptFormComponent, ScriptTreeComponent } from './components';

@NgModule({
  declarations: [
    ScriptTreeComponent,
    ScriptFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    ScriptTreeComponent,
    ScriptFormComponent
  ]
})
export class RunnerModule { }
