import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ScriptTreeComponent } from './components/script-tree/script-tree.component';

@NgModule({
  declarations: [ScriptTreeComponent],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    ScriptTreeComponent
  ]
})
export class RunnerModule { }
