import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IProxyApi } from '../models';
const proxyApi: IProxyApi = (window as any).proxyApi;

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private static readonly ClearStatusDelay = 2000;

  public status$: Observable<string>;
  private _status = new BehaviorSubject('');
  private _clearStatusTimeout: any;

  constructor() {
    this.status$ = this._status.asObservable();
    proxyApi.receive(`status:message`, (message: string) => {
      this._status.next(message);
    });
  }

  public setStatus(message: string): void {
    if (this._clearStatusTimeout) {
      clearTimeout(this._clearStatusTimeout);
    }

    this._status.next(message);

    // Only let status set for so long.
    if (message) {
      this._clearStatusTimeout = setTimeout(() => {
        this._status.next('');
      }, StatusService.ClearStatusDelay);
    }
  }
}
