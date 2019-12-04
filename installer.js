const electronInstaller = require('electron-winstaller');

// SourceRef: https://blog.theodo.com/2017/05/set-up-continuous-deployment-on-electron-using-squirrel/
electronInstaller.createWindowsInstaller({
  appDirectory: './',
  outputDirectory: 'build/power-runner',
  authors: 'Gregg B. Jensen',
  exe: 'power-runner.exe'
}).then(()=> {
  console.log('Installer build complete.');
}, err => {
  console.log(`Error creating installer: ${err.message}`);
});