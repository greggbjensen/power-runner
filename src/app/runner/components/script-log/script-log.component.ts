import { Component, HostBinding, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ScriptRef } from 'src/app/core/models';

@Component({
  selector: 'pru-script-log',
  templateUrl: './script-log.component.html',
  styleUrls: ['./script-log.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ScriptLogComponent implements OnInit {

  @HostBinding('class.script-log') public className = true;

  @Input() public scriptRef: ScriptRef;

  constructor() { }

  public ngOnInit(): void {
  }

}
