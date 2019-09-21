import { Component, Input, OnInit } from '@angular/core';
import { IScript } from 'src/app/core/models';

@Component({
  selector: 'pru-script-form',
  templateUrl: './script-form.component.html',
  styleUrls: ['./script-form.component.scss']
})
export class ScriptFormComponent implements OnInit {

  @Input() public script: IScript;

  constructor() { }

  ngOnInit() {
  }

}
