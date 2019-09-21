import { Component, Input, OnInit, HostBinding } from '@angular/core';
import { IScript } from 'src/app/core/models';

@Component({
  selector: 'pru-script-form',
  templateUrl: './script-form.component.html',
  styleUrls: ['./script-form.component.scss']
})
export class ScriptFormComponent implements OnInit {
  @HostBinding('class.script-form') public className = true;

  @Input() public script: IScript;

  constructor() { }

  ngOnInit() {
  }

}
