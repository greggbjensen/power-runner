import { Component, HostBinding, OnInit, ViewEncapsulation } from '@angular/core';
import { AppService } from 'src/app/core/services';

@Component({
  selector: 'pru-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StatusBarComponent implements OnInit {
  @HostBinding('class.status-bar') public className = true;
  public version: string = '';

  constructor(
    private _appService: AppService
  ) { }

  public ngOnInit(): void {
    this._appService.getVersionAsync().then(version => this.version = version);
  }

}
