# PowerRunner

PowerShell Script runnner that loads scripts from paths and parses commmand line parameters to present a tabbed form and output window.

## Features
- Set all command parameters using inputs, drop downs, and checkboxes that auto-size
- Keep track of many instances in a tabbed experience
- Scans requested directories to show heirarchical scripts in one place
- Double click a script to quickly edit and run
- Store and share saved command line parameters as a profile
- Run as administrator to execute elevated scripts
- Quickly stop and start runs with a button
- Search and browse console output
- Click Edit to go directly to source
- Automatically keeps itself up to date

## Example

``` PowerShell
param (
  [string]$name = 'MyApp',
  [string]$connectionString = 'Server=myServerAddress;Database=myDataBase;Trusted_Connection=True;',
  [string][ValidateSet("Dev", "Test", "Stage", "Prod")]$environment = "Dev",
  [bool]$configure = $true,
  [switch]$revert = $false
)

$ESC = [char]27
Write-Host "Deploying $name to $environment environment."
Write-Host "$ESC[32mConnection:$ESC[0m $connectionString"
Write-Host "Configure: $configure"
Write-Host "Revert: $revert" -ForegroundColor Blue
```

<br>

![Overview](assets/overview.png)

# Setup
1. Click `PowerRunnerSetup.exe` from [Releases](https://github.com/greggbjensen/power-runner/releases/) to install
2. Keep the download, and click to launch it
3. Click on `More info` on the blue Windows prompt, then `Run anyway`

    ![Overview](assets/windows-approve-dialog.png)

    ![Overview](assets/windows-approve-dialog-run-anyway.png)
    

2. When the application starts for the first time, the settings page will be shown
3. Click on the folder to browse to your root directory for searching for scripts
4. Enter a pattern for search for your PowerShell scripts
    
    Example:
    ```
    MyProject\**\*.ps1
    ```

# Contributing

1. Install `Node.js` LTS version from https://nodejs.org/en/
2. Install `Yarn` from https://classic.yarnpkg.com/en/docs/install/#windows-stable
3. Install `Visual Studio Code` from https://code.visualstudio.com/
3. Install `Windows Build Tools` by running the following from an elevated command prompt:
  ```bash
  npm install --global --production windows-build-tools
  ```
4. Clone the repository and create a new feature branch
5. Install project dependencies by running the following from the command line in the repository directory:

  ```bash
  yarn
  ```
6. Make any changes and submit a pull request