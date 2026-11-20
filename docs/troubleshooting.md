# Troubleshooting

## Edit Button: "spawn Code.exe ENOENT"

Clicking the **Edit** button on a script fails with:

```
Unhandled Error: Error: spawn Code.exe ENOENT
```

### Cause

PowerRunner tries to launch Visual Studio Code via `spawn('Code.exe', ...)`, which searches the system PATH. If VS Code is not in your PATH (typical on Windows), the spawn fails.

### Workarounds

**Option 1: Add VS Code to PATH**

Add VS Code to your system PATH so it can be launched from any process:

1. Open Settings → Search for "Environment Variables"
2. Under **System variables**, find `Path` → Edit
3. Add: `C:\Users\<your-username>\AppData\Local\Programs\Microsoft VS Code\bin`
4. Click OK, restart PowerRunner

**Option 2: Add the Code.exe directory to PATH**

1. Open Settings → Search for "Environment Variables"
2. Under **System variables**, find `Path` → Edit
3. Add: `C:\Users\<your-username>\AppData\Local\Programs\Microsoft VS Code\`
4. Click OK, restart PowerRunner

**Option 3: Link the `code` command**

If you have the VS Code CLI installed:

1. In VS Code, press `Ctrl+Shift+P`
2. Type "Shell Command: Install 'code' command in PATH"
3. Click it and confirm
4. Restart PowerRunner

### Permanent Fix

A permanent fix is tracked and will be implemented in a future release to use known installation paths instead of relying on PATH.

## Scripts Not Appearing in the Tree

### Check Search Patterns

1. Open Settings (**File > Settings**)
2. Verify the **Base Path** points to the correct root directory
3. Check the **Search Paths** patterns are correct

Common patterns:

| Pattern | Matches |
|---|---|
| `**\/*.ps1` | All .ps1 files under the base path |
| `MyProject\**\/*.ps1` | All .ps1 files under MyProject/ |
| `Deploy\deploy*.ps1` | Scripts matching deploy*.ps1 in Deploy/ |

### Check Exclude Patterns

Patterns starting with `!` are excluded. If scripts aren't showing, check for accidental exclusions:

```
!NodeModules\**\/*.ps1   ← This excludes all scripts in NodeModules
```

### Verify PowerShell Availability

PowerRunner requires PowerShell to parse scripts. Check that PowerShell is available:

```powershell
# In any terminal
$PSVersionTable.PSVersion
```

## Script Parsing Fails

### Error in Terminal

If a script shows a parsing error instead of its form:

1. Ensure the script is valid PowerShell syntax
2. Check that the script uses `param()` blocks for parameters
3. Verify the `.ps1` file has no encoding issues (use UTF-8)

### GetCommandMetadata

Script parsing uses PowerShell's `Get-CommandMetadata` via `src/electron/powershell/GetCommandMetadata.ps1`. If parsing consistently fails:

1. Check that PowerShell 5.1+ is installed (PowerShell Core / 7+ may have differences)
2. Verify the script file is readable (no file lock, no permissions issues)
3. Try opening the script in PowerShell manually:
   ```powershell
   Get-Command .\path\to\script.ps1
   ```

## Scripts Not Appearing in Hierarchy

### Module Grouping

PowerRunner groups scripts by the **immediate parent directory** of each `.ps1` file. For example:

```
MyProject/
  ModuleA/
    Script1.ps1    ← Grouped under "ModuleA"
    Script2.ps1    ← Grouped under "ModuleA"
  ModuleB/
    Script3.ps1    ← Grouped under "ModuleB"
```

If you want a different grouping, reorganize your directory structure or adjust search paths.

## Performance with Many Scripts

### Problem

Scanning a directory with thousands of files can be slow.

### Solutions

1. **Narrow search paths** — Instead of `**\/*.ps1`, use specific subdirectories:
   ```
   Deploy\**\/*.ps1
   CI\**\/*.ps1
   ```

2. **Exclude noisy directories** — Use `!` patterns:
   ```
   !**\node_modules\**\/*.ps1
   !**\packages\**\/*.ps1
   ```

3. **Disable pre-cache** — If the application feels slow on startup, pre-caching may be contributing. This is controlled by `RunSettings.PreCache` in `src/app/run-settings.ts`.

## Elevated Mode Issues

### Running as Administrator

PowerRunner can run scripts with elevated (administrator) privileges. The elevated status is shown in the toolbar:

```
PowerRunner: Administrator
```

### Issues

- If scripts fail when running elevated, verify the working directory is correct
- Some scripts may not behave correctly when run with elevated privileges
- The elevation check happens at startup; changing elevation requires restarting PowerRunner

## Profile Issues

### Profiles Not Saving

1. Check that you have write permissions to the script directory (for shared profiles)
2. For personal profiles, check `~/AppData/Local/power-runner/` or equivalent
3. Verify the SQLite database file is not locked by another process

### Profiles Not Loading

1. Verify the script file hasn't moved (profiles are keyed by directory + filename)
2. Check that the script parameters haven't changed (new parameters won't have saved values)

## Terminal Not Showing Output

### XTerm Rendering

If the terminal panel is blank during script execution:

1. Check that `node-pty` is properly installed (may need `npm run electron-rebuild`)
2. Verify the script is actually producing output (try `Write-Host "test"`)
3. Resize the window — the PTY may need a resize event to start producing output

## Self-Update Fails

### Update Not Appearing

1. Check your internet connection
2. Verify the GitHub release exists and has assets
3. The updater checks the GitHub Releases API; ensure your repo is public or the token (if configured) is valid

### Installation Stuck

1. Close PowerRunner completely
2. Check for lingering processes in Task Manager (`PowerRunner.exe`)
3. Re-launch the application

## Known Limitations

- **Windows only** — The application targets Windows. PowerShell paths and VS Code integration are Windows-specific.
- **VS Code required for Edit** — The Edit feature requires Visual Studio Code to be installed and accessible.
- **PowerShell 5.1+ required** — Script parsing relies on PowerShell cmdlets available in 5.1+.
- **No macOS/Linux support** — Electron main process hardcodes Windows paths (`%SYSTEMROOT%`, `%LOCALAPPDATA%`, `%PROGRAMFILES%`).
