import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor() { }

  public getFiles$(): Observable<string[]> {
    return of(['Test.ps1', 'Hello.ps1']);
  }
}
