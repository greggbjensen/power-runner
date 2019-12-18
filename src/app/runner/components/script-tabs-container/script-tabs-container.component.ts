import { Component, HostBinding, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { IScript } from 'src/app/core/models';

@Component({
  selector: 'pru-script-tabs-container',
  templateUrl: './script-tabs-container.component.html',
  styleUrls: ['./script-tabs-container.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ScriptTabsContainerComponent implements OnInit {
  @HostBinding('class.script-tabs-container') public className = true;

  @Input() public scripts: IScript[];
  @Input() public set selectedScript(value: IScript) {
    this._selectedScript = value;
    this.selectedIndex = this.scripts.indexOf(this._selectedScript);
  }

  public selectedIndex = -1;

  private _selectedScript: IScript;

  constructor() { }

  public ngOnInit(): void {
  }

  public closeTab(script: IScript): void {
    const index = this.scripts.findIndex(s => s.id === script.id);
    if (index !== -1) {
      this.scripts.splice(index, 1);
    }
  }

}
