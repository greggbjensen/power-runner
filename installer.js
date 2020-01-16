const electronInstaller = require('electron-winstaller');

// SourceRef: https://blog.theodo.com/2017/05/set-up-continuous-deployment-on-electron-using-squirrel/
electronInstaller.createWindowsInstaller({
  appDirectory: 'release/PowerRunner-win32-x64',
  outputDirectory: 'release/installers/PowerRunner-win32-x64',
  authors: 'Gregg B. Jensen',
  description: 'PowerShell Script runnner that loads scripts from paths and parses commmand line parameters to present a tabbed form and output window.',
  exe: 'PowerRunner.exe',
  noMsi: true
}).then(()=> {
  console.log('Installer build complete.');
}, err => {
  console.log(`Error creating installer: ${err.message}`);
});