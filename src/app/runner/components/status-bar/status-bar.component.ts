import { Component, HostBinding, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { AppService, StatusService } from 'src/app/core/services';

@Component({
  selector: 'pru-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StatusBarComponent implements OnInit {
  @HostBinding('class.status-bar') public className = true;
  public version: string = '';
  public status$: Observable<string>;

  constructor(
    private _appService: AppService,
    private _statusService: StatusService
  ) {
    this.status$ = this._statusService.status$;
  }

  public ngOnInit(): void {
    this._appService.getVersionAsync().then(version => this.version = version);
  }

}
