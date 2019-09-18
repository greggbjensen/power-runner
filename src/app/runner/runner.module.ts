import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ScriptTreeComponent } from './components/script-tree/script-tree.component';

@NgModule({
  declarations: [ScriptTreeComponent],
  imports: [
    CommonModule
  ],
  exports: [
    ScriptTreeComponent
  ]
})
export class RunnerModule { }
