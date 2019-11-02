import { Component, HostBinding, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'pru-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StatusBarComponent implements OnInit {
  @HostBinding('class.status-bar') public className = true;

  constructor() { }

  ngOnInit() {
  }

}
