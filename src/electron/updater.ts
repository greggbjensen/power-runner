import { autoUpdater, BrowserWindow, dialog, ipcMain } from 'electron';
import fetch from 'node-fetch';
import { IAppUpdate } from '../app/core/models';

const autoUpdateUrl = 'https://github.com/greggbjensen/power-runner/releases/latest/download';
const releaseRestUrl = 'https://api.github.com/repos/greggbjensen/power-runner/releases/tags';

// SourceRef: https://medium.com/@Lola_Dam/how-to-update-your-electron-application-with-update-rocks-b253d85dbc4d

export class Updater {

  private static readonly UpdateCheckDelay = 3600000; // 4 hours.

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

    ipcMain.on('update:confirmation', (event, result) => {
      if (result === 'Update') {
        autoUpdater.quitAndInstall();
      }
    });
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
        this.promptForUpdateAsync(releaseName);
      }
    );

    autoUpdater.setFeedURL({
      url: autoUpdateUrl
    });

    // Check for updates on startup and on a delay.
    autoUpdater.checkForUpdates();
    setInterval(() => autoUpdater.checkForUpdates(), Updater.UpdateCheckDelay);
  }

  private async promptForUpdateAsync(releaseName: string): Promise<void> {
    const releaseNotes = await this.getReleaseNotesAsync(releaseName);
    const update: IAppUpdate = {
      releaseNotes,
      releaseName
    };
    this._browserWindow.webContents.send('update:available', update);
  }

  private async getReleaseNotesAsync(releaseName: string): Promise<string> {
    let releaseNotes = '';
    try {
      const url = `${releaseRestUrl}/${releaseName}`;
      const response = await fetch(url);
      const data = await response.json() as any;
      releaseNotes = data.body;
    } catch (err) {
      console.error(err);
    }

    return releaseNotes;
  }

  private sendStatus(message: string): void {
    this._browserWindow.webContents.send('status:message', message);
  }
}
