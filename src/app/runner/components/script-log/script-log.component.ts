import { Component, HostBinding, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ScriptRef } from 'src/app/core/models';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'pru-script-log',
  templateUrl: './script-log.component.html',
  styleUrls: ['./script-log.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ScriptLogComponent implements OnInit {

  @HostBinding('class.script-log') public className = true;

  @Input() public scriptRef: ScriptRef;

  public formGroup = new FormGroup(
    {
      tail: new FormControl(true)
    }
  );

  constructor() { }

  public ngOnInit(): void {
  }

  public toggleTail(): void {
    if (this.scriptRef) {
      this.scriptRef.tail = this.formGroup.value.tail;
    }
  }

}
