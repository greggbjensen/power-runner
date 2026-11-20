# User Guide

## Installation

### From Release

1. Download `PowerRunnerSetup.exe` from the [GitHub Releases](https://github.com/greggbjensen/power-runner/releases/) page
2. Launch the installer
3. If Windows SmartScreen shows a blue warning prompt:
   - Click **More info**
   - Click **Run anyway**

### From Source

See the [Developer Guide](developer-guide.md) for building from source.

## First Run

When PowerRunner starts for the first time, the settings panel opens automatically.

### Configuring Script Paths

1. **Base Path** — The root directory where PowerRunner searches for PowerShell scripts. This is the top-level folder containing your script projects.

2. **Search Paths** — Patterns relative to the base path that tell PowerRunner where to find `.ps1` files. Each pattern is a path glob.

   Examples:
   ```
   MyProject\**\*.ps1          # All scripts under MyProject
   Deploy\**\*.ps1             # Only scripts in the Deploy folder
   **\*.ps1                    # All scripts anywhere (deep search)
   !NodeModules\**\*.ps1       # Exclude NodeModules directory
   ```

   - Use `**` to match any number of subdirectories
   - Prefix a pattern with `!` to exclude it from the search
   - Path separators can be forward slashes (`/`) or backslashes (`\`)

### Saving Settings

After configuring your paths, close the settings panel. Your settings are saved to `~/.powerrunner/settings.yaml`.

## Understanding the UI

### Main Layout

PowerRunner uses a three-panel layout:

```
+------------------------------------------------------------------+
| [Toolbar: File | Help]         PowerRunner [minimize][maximize][x]|
+------------------------------------------------------------------+
|       |                                                          |
|       |   Tab Bar: [Script1 | Script2 | Script3]                 |
|       |                                                          |
| Script|   +----------------------------------------------------+ |
|  Tree |   |  Form: [Param1 Input] [Param2 Dropdown] [Run] [Stop]| |
|       |   +----------------------------------------------------+ |
|       |   +----------------------------------------------------+ |
|       |   | Terminal Output                                     | |
|       |   | $ ./deploy.ps1 -name MyApp -environment Prod        | |
|       |   | Deploying MyApp to Prod environment.                | |
|       |   | Connection: Server=...                              | |
|       |   +----------------------------------------------------+ |
|       |                                                          |
+-------+----------------------------------------------------------+
| Status: Ready                                                    |
+------------------------------------------------------------------+
```

- **Script Tree** (left sidebar) — Hierarchical view of discovered scripts, grouped by parent directory
- **Script Tabs** (center) — One tab per open script
- **Script Form** (top half of tab) — Auto-generated inputs for script parameters
- **Script Log** (bottom half) — Live terminal output from the running script
- **Status Bar** (bottom) — Current status messages
- **Settings Drawer** (right overlay) — Configurable via File menu

### Toolbar

| Menu | Options |
|---|---|
| **File** | Settings, Reload Window, Exit |
| **Help** | Toggle Developer Tools |

Window controls: minimize, maximize/restore, close.

## Running Scripts

### Opening a Script

Click any script in the tree sidebar to open it in a tab. The script is parsed automatically, and its parameters are displayed as form inputs.

### Parameter Types

PowerRunner auto-detects parameter types from PowerShell metadata and creates appropriate inputs:

| PowerShell Type | UI Input |
|---|---|
| `string` | Text input |
| `int`, `float`, `double` | Number input |
| `bool`, `switch` | Checkbox |
| `[ValidateSet(...)]` | Dropdown (select one option) |
| `[SecureString]` | Password input (masked) |
| Array parameters | Text input (comma-separated) |
| Date parameters | Date picker |

### Running a Script

1. Fill in the parameter values
2. Click **Run** to execute the script in the integrated terminal
3. The terminal output appears in the bottom panel in real-time
4. While running, the button changes to **Stop** — click it to terminate the script

### Running Options

The Run button has a dropdown menu with three options:

| Option | Behavior |
|---|---|
| **Run** | Executes the script in the integrated xterm terminal |
| **Run external** | Opens a new PowerShell window with the script command (command is copied to clipboard) |
| **Copy command** | Copies the full command line to clipboard for pasting elsewhere |

## Managing Profiles

Profiles save your parameter values for a script so you can reuse them across sessions or share them with others.

### Creating a Profile

1. Open a script
2. Fill in the parameter values
3. Click the **Add profile** icon (circle with `+`) in the profile selector bar
4. Enter a name and choose the profile type:
   - **Personal** (lock icon) — stored per-machine, not shared
   - **Shared** (people icon) — stored in the script's directory, shared with anyone who has access to the scripts

### Loading a Profile

Select a profile from the dropdown menu. The form fields update with the saved values.

### Editing a Profile

1. Load the profile you want to edit
2. Modify any parameter values
3. Click the **Save profile** icon (disk)
4. Click **Undo** to revert to the previously saved values

### Removing a Profile

1. Select the profile
2. Click the **Remove profile** icon (circle with slash)

### Editing Scripts

Click the **Edit** button to open the script source file in Visual Studio Code.

## Settings

Access settings via **File > Settings**.

| Setting | Description |
|---|---|
| Base Path | Root directory for script discovery |
| Search Paths | Path patterns (one per line) relative to base path |

To reload settings after changing them, use **File > Reload Window** or restart the application.
