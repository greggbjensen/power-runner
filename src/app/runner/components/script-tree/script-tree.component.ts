import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, HostBinding, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { IScript, IScriptFile, IScriptNode } from 'src/app/core/models';
import { ScriptService } from 'src/app/core/services';

@Component({
  selector: 'pru-script-tree',
  templateUrl: './script-tree.component.html',
  styleUrls: ['./script-tree.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ScriptTreeComponent implements OnInit {
  @HostBinding('class.script-tree') public className = true;

  @Output() public scriptOpened = new EventEmitter<IScript>();

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

  constructor(
    private _scriptService: ScriptService
  ) { }

  public ngOnInit(): void {
  }

  public hasChild = (index: number, node: IScriptNode) => !!node.children && node.children.length > 0;

  public async openScriptAsync(file: IScriptFile): Promise<void> {
    const script: IScript = await this._scriptService.parseAsync(file);
    this.scriptOpened.emit(script);
  }
}
