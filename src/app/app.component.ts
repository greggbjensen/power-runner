import { Component } from '@angular/core';
import { FileService } from './core/services';
import { Observable } from 'rxjs';

@Component({
  selector: 'pru-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'power-runner';

  files$: Observable<string[]>;

  constructor(
    private _fileService: FileService
  ) {
    this.files$ = _fileService.getFiles$();
  }
}
