import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ScriptService } from './services';
import { NodeProxyFactory } from './services/node-proxy.factory';

@NgModule({
  providers: [
    ScriptService,
    NodeProxyFactory
  ],
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class CoreModule { }
