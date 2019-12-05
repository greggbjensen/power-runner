import { autoUpdater, BrowserWindow, dialog, MessageBoxReturnValue } from 'electron';

const autoUpdateUrl = 'https://github.com/greggbjensen/power-runner/releases/latest/download';

// SourceRef: https://medium.com/@Lola_Dam/how-to-update-your-electron-application-with-update-rocks-b253d85dbc4d

export class Updater {

  constructor(
    private _browserWindow: BrowserWindow
  ) {
  }

  public init(): void {
    if (process.platform === 'linux') {
      console.info('Auto updates not available on linux');
    } else {
      this.initDarwinWin32();
    }
  }

  private initDarwinWin32(): void {
    autoUpdater.on(
      'error',
      (err) => this.sendStatus(`Update error: ${err.message}`));

    autoUpdater.on(
      'checking-for-update',
      () => this.sendStatus('Checking for update'));

    autoUpdater.on(
      'update-available',
      () => this.sendStatus('Update available'));

    autoUpdater.on(
      'update-not-available',
      () => this.sendStatus('No update available'));

    // Ask the user if update is available
    autoUpdater.on(
      'update-downloaded',
      (event, releaseNotes, releaseName) => {
        this.sendStatus('Update downloaded');
        dialog.showMessageBox(this._browserWindow, {
          type: 'question',
          buttons: ['Update', 'Cancel'],
          defaultId: 0,
          message: `Version ${releaseName} is ready, do you want to restart to load it?`,
          title: 'Update available'
        }).then(result => {
          if (result.response === 0) {
            autoUpdater.quitAndInstall();
          }
        });
      }
    );

    autoUpdater.setFeedURL({
      url: autoUpdateUrl
    });
    autoUpdater.checkForUpdates();
  }

  private sendStatus(message: string): void {
    this._browserWindow.webContents.send('status:message', message);
  }
}
