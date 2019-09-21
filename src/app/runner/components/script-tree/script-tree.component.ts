import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Input, OnInit, Output, HostBinding } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { IScript, IScriptNode } from 'src/app/core/models';

@Component({
  selector: 'pru-script-tree',
  templateUrl: './script-tree.component.html',
  styleUrls: ['./script-tree.component.scss']
})
export class ScriptTreeComponent implements OnInit {
  @HostBinding('class.script-tree') public className = true;

  @Output() public selectionChanged = new EventEmitter<IScript>();

  public get nodes(): IScriptNode[] {
    return this.dataSource.data;
  }

  @Input() public set nodes(value: IScriptNode[]) {
    this.dataSource.data = value;
    if (value) {
      value.forEach(v => this.treeControl.expand(v));
    }
  }

  public treeControl = new NestedTreeControl<IScriptNode>(node => node.children);
  public dataSource = new MatTreeNestedDataSource<IScriptNode>();

  constructor() { }

  public ngOnInit(): void {
  }

  public hasChild = (index: number, node: IScriptNode) => !!node.children && node.children.length > 0;
}
