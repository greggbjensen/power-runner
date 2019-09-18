import { Component, Input, OnInit } from '@angular/core';
import { IScriptNode } from 'src/app/core/models';

@Component({
  selector: 'pru-script-tree',
  templateUrl: './script-tree.component.html',
  styleUrls: ['./script-tree.component.scss']
})
export class ScriptTreeComponent implements OnInit {

  @Input() public nodes: IScriptNode[];

  constructor() { }

  public ngOnInit(): void {
  }

}
