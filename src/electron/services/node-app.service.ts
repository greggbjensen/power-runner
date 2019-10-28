import { Injectable } from '@angular/core';
import { app } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class NodeAppService {

  constructor() { }

  public exitAsync(): Promise<void> {
    app.quit();
    return Promise.resolve();
  }
}
