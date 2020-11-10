import { Component, HostBinding, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { IScript, IScriptFile } from 'src/app/core/models';

@Component({
  selector: 'pru-script-tabs-container',
  templateUrl: './script-tabs-container.component.html',
  styleUrls: ['./script-tabs-container.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ScriptTabsContainerComponent implements OnInit {
  @HostBinding('class.script-tabs-container') public className = true;

  @Input() public files: IScriptFile[];
  @Input() public set selectedFile(value: IScriptFile) {
    this._selectedFile = value;
    this.selectedIndex = this.files.indexOf(this._selectedFile);
  }

  public selectedIndex = -1;

  private _selectedFile: IScriptFile;

  constructor() { }

  public ngOnInit(): void {
  }

  public closeTab(script: IScript): void {
    const index = this.files.findIndex(s => s.id === script.id);
    if (index !== -1) {
      this.files.splice(index, 1);
    }
  }

}
