import { Component, EventEmitter, HostBinding, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'pru-settings-pane',
  templateUrl: './settings-pane.component.html',
  styleUrls: ['./settings-pane.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SettingsPaneComponent implements OnInit {
  @HostBinding('class.settings-pane') public className = true;
  public form: FormGroup = new FormGroup({
    basePath: new FormControl('', Validators.required),
    searchPaths: new FormControl('', Validators.required)
  });

  @Output() public closed = new EventEmitter<any>();

  constructor() { }

  public ngOnInit(): void {
  }

  public cancel(): void {
    this.closed.emit();
  }

  public save(): void {
    this.closed.emit();
  }
}
