import { Component, HostBinding, OnInit, ViewEncapsulation, NgZone, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { AppService, StatusService } from 'src/app/core/services';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

@Component({
  selector: 'pru-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StatusBarComponent implements OnInit, OnDestroy {
  @HostBinding('class.status-bar') public className = true;
  public version: string = '';
  public status: string;

  constructor(
    private _appService: AppService,
    private _statusService: StatusService,
    private _ngZone: NgZone
  ) {
  }

  public ngOnInit(): void {
    this._appService.getVersionAsync().then(version => this.version = version);
    this._statusService.status$
      .pipe(untilComponentDestroyed(this))
      .subscribe(s => this._ngZone.run(() => {
        this.status = s;
      }));
  }

  public ngOnDestroy(): void {
  }
}
