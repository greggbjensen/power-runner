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
      (err) => console.error(`Update error: ${err.message}`));

    autoUpdater.on(
      'checking-for-update',
      () => console.info('Checking for update'));

    autoUpdater.on(
      'update-available',
      () => console.info('Update available'));

    autoUpdater.on(
      'update-not-available',
      () => console.info('No update available'));

    // Ask the user if update is available
    autoUpdater.on(
      'update-downloaded',
      (event, releaseNotes, releaseName) => {
        console.info('Update downloaded');
        dialog.showMessageBox(this._browserWindow, {
          type: 'question',
          buttons: ['Update', 'Cancel'],
          defaultId: 0,
          message: `Version ${releaseName} is available, do you want to install it now?`,
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
}
