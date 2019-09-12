import { Component } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IScript } from './core/models';
import { ScriptService } from './core/services';

@Component({
  selector: 'pru-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public title = 'power-runner';
  public scripts$: Observable<IScript[]>;
  private _scripts = new BehaviorSubject<IScript[]>([]);

  constructor(
    private _scriptService: ScriptService
  ) {
    this.scripts$ = this._scripts.asObservable();
    this._scriptService.listAsync(['D:\\Dev\\GitHub\\power-runner\\samples']).then((scripts) => {
      this._scripts.next(scripts);
    });
  }
}
