import { Injectable } from '@angular/core';
import { BrowserWindow } from 'electron';
const electron = require('electron');
const dialog = electron.dialog;

@Injectable({
  providedIn: 'root'
})
export class NodeBrowseDialogService {

  constructor(
    private _browserWindow: BrowserWindow
  ) { }

  public selectDirectoryAsync(): Promise<string> {

    return new Promise<string>((resolve, reject) => {
      dialog.showOpenDialog(this._browserWindow, {
        properties: ['openDirectory']
      }).then(result => {
        if (!result.canceled) {
          resolve(result.filePaths[0]);
        } else {
          resolve();
        }
      }, err => {
        reject(err);
      });
    });
  }
}
