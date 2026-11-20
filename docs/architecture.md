# Architecture

PowerRunner is built as an **Angular-in-Electron** desktop application with a two-process architecture. The renderer process (Angular UI) runs in a BrowserWindow with Node.js disabled, while the main process (Electron/Node.js) handles all native operations.

## Two-Process Model

```
+---------------- Electron Main Process -------------------+
|  Node.js with full file system / process access         |
|                                                         |
|  +-------------------+  +----------------------------+ |
|  | NodeScriptService |  | NodeSettingsService        | |
|  | - globby scanning |  | - YAML settings storage    | |
|  | - pty spawning    |  | - ~/.powerrunner/settings  | |
|  | - script parsing  |  +----------------------------+ |
|  +-------------------+  +----------------------------+ |
|                        | NodeProfileService           | |
|                        | - SQLite profile storage     | |
|                        +----------------------------+ |
|                        | NodeAppService               | |
|                        | - window management          | |
|                        +----------------------------+ |
|                        | NodeBrowseDialogService      | |
|                        | - native file dialogs        | |
|                        +----------------------------+ |
|                                                         |
|  ipcMain auto-registration (bindService)               |
+---------------------------------------------------------+
         IPC  ↑↓  contextBridge (preload.js)
+---------------------------------------------------------+
|  Angular Renderer Process (no Node.js access)           |
|                                                         |
|  +-------------------+  +----------------------------+ |
|  | ScriptService     |  | SettingsService            | |
|  | ProfileService    |  | AppService                 | |
|  | StatusService     |  | BrowseDialogService        | |
|  +-------------------+  +----------------------------+ |
|                                                         |
|  +---------------- Angular UI ---------------------+    |
|  | AppComponent (toolbar, layout)                  |    |
|  | RunnerModule (ScriptTree, ScriptPage, ScriptForm)|    |
|  +-------------------------------------------------+    |
+---------------------------------------------------------+
```

### Renderer (Angular)

Located in `src/app/`. Runs in a BrowserWindow with:
- `nodeIntegration: false` — no direct Node.js access
- `contextIsolation: true` — isolated JavaScript context
- `preload` script via `src/electron/preload.js`

### Main (Electron)

Located in `src/electron/`. Runs in the Electron main process with:
- Full access to `fs`, `child_process`, `os`, and native modules
- Direct PowerShell execution via `node-pty`
- SQLite storage for profiles
- File system operations (settings, script discovery)

## IPC Bridge

The IPC bridge connects Angular services to Electron services without manual IPC mapping.

### How It Works

1. **Main process registration** (`src/electron/main.ts`):
   - Service instances are created and passed to `bindService()`
   - `bindService()` reflects over the prototype to find all public methods
   - Each method is registered as an IPC handler on `ipcMain`: `{ServiceName}.{methodName}`

2. **Renderer proxy** (`src/app/core/services/node-proxy.registry.ts`):
   - `NodeProxyRegistry` receives Angular service constructors (injected via `PROXY_SERVICE`)
   - It scans each service's prototype for public methods
   - For each method, it creates a proxy function that:
     - Sends an IPC message via `proxyApi.send()`
     - Returns a Promise that resolves/rejects via `proxyApi.receive()`
   - The proxy is injected into the service via `proxyService.initialize(proxy)`

3. **Bridge** (`src/electron/preload.js`):
   - Exposes `proxyApi` through `contextBridge` with `send` and `receive` methods
   - This is the only communication channel between processes

### Example Flow

```
User clicks "Run" in UI
  → ScriptFormComponent.startRun()
  → ScriptFormComponent.run.emit(scriptRun)
  → ScriptPageComponent.startRun(scriptRun)
  → ScriptService.runAsync(script, false)        [Angular service]
  → proxy.invoke('runAsync', script, false)      [NodeProxy]
  → proxyApi.send('NodeScriptService.runAsync', script, false)  [IPC send]
  → ipcMain handler fires in main process        [Electron main]
  → NodeScriptService.runAsync(script, false)    [Native execution]
  → pty.spawn(PowerShell, command)               [Starts script]
  → resolve(scriptChannel)                       [Returns channel name]
  → event.reply('NodeScriptService.runAsync:resolve', channel)  [IPC reply]
  → proxy receives via proxyApi.receive          [Renderer receives]
  → Promise resolves with scriptChannel           [Back to Angular]
```

### Key Classes

| Class | Location | Purpose |
|---|---|---|
| `ProxyNodeService` | `src/app/core/services/` | Base class for all IPC-wrapped services. Holds a `NodeProxy` reference. |
| `NodeProxyRegistry` | `src/app/core/services/` | Creates and manages `NodeProxy` instances for each service. |
| `NodeProxy` | `src/app/core/models/` | Method registry + IPC invoker. |
| `ScriptRef` | `src/app/core/models/` | Script callback handler for terminal data streams. |

## Module Layout

### AppModule (`src/app/app.module.ts`)

Root module. Imports `CoreModule`, `RunnerModule`, `SharedModule`, `ReactiveFormsModule`, `AngularSplitModule`. Bootstraps `AppComponent`.

### CoreModule (`src/app/core/core.module.ts`)

Provides all singleton services via Angular dependency injection. Services extend `ProxyNodeService` and delegate to main-process services.

### RunnerModule (`src/app/runner/runner.module.ts`)

Feature module containing all UI components. Uses `AngularSplitModule` for the resizable form/log layout, `ReactiveFormsModule` for form handling, and `MarkdownModule` for script descriptions.

### SharedModule (`src/app/shared/shared.module.ts`)

Aggregation layer for Angular Material modules. Re-exports commonly used Material components (`MatButtonModule`, `MatInputModule`, `MatTreeModule`, etc.) to avoid duplicating imports across feature modules.

## Key Components

| Component | Selector | Role |
|---|---|---|
| `AppComponent` | `pru-root` | Root layout: toolbar, script tree drawer, tabs container, settings drawer |
| `ScriptTreeComponent` | `pru-script-tree` | Hierarchical tree of discovered scripts |
| `ScriptTabsContainerComponent` | `pru-script-tabs-container` | Tab bar + vertical split layout |
| `ScriptPageComponent` | `pru-script-page` | Individual script view (form + log) |
| `ScriptFormComponent` | `pru-script-form` | Auto-generated parameter inputs + controls |
| `ScriptLogComponent` | `pru-script-log` | xterm.js terminal output display |
| `SettingsPaneComponent` | `pru-settings-pane` | Settings form (base path, search paths) |

## Script Execution Flow

```
1. User clicks script in tree
   → ScriptTreeComponent.fileOpened(scriptFile)

2. Angular opens a tab for the script
   → ScriptTabsContainerComponent adds tab

3. ScriptPageComponent loads for the tab
   → ScriptFormComponent receives the IScriptFile

4. ScriptFormComponent.refreshAsync() calls:
   → ScriptService.parseAsync(file)
   → NodeScriptService.parseAsync(file) in main process
   → exec(GetCommandMetadata.ps1, filePath)
   → Parses JSON output → returns IScript

5. ScriptFormComponent builds FormGroup from IScript.params
   → Generates appropriate inputs per ParamType

6. User fills params and clicks Run
   → ScriptService.runAsync(script, false)
   → NodeScriptService.runAsync(script) in main process
   → pty.spawn(PowerShell, `.\<script> <params>`)
   → child.onData → browserWindow.send(`${channel}:data`, data)
   → ScriptLogComponent renders output in xterm
```

## Data Models

All models are defined as TypeScript interfaces in `src/app/core/models/` and shared between renderer and main process.

| Interface | Fields | Purpose |
|---|---|---|
| `IScriptFile` | `id`, `directory`, `module`, `name` | File metadata only |
| `IScript` | extends `IScriptFile`, `description`, `hash`, `params`, `status` | Full parsed script |
| `IScriptParam` | `name`, `type`, `validation`, `attributes` | Single parameter |
| `IScriptRun` | `script` (IScript), `runExternal` (bool) | Run invocation |
| `IScriptProfile` | `id`, `name`, `params`, `saveAsType` | Saved parameter set |
| `ISettings` | `basePath`, `searchPaths` | User configuration |
| `IScriptNode` | `name`, `children` (IScriptNode[]) | Tree hierarchy |
| `IScriptExit` | `scriptName`, `exitCode` | Script termination event |

## Settings Storage

Settings are persisted in `~/.powerrunner/settings.yaml`:

```yaml
basePath: "C:/Users/brian/Projects"
searchPaths:
  - "MyProject/**\/*.ps1"
  - "Deploy/**\/*.ps1"
```

Managed by `NodeSettingsService` in the main process using `fs-extra` and `node-yaml`.

## Profile Storage

Profiles are stored in SQLite databases, organized by script directory and name. Shared profiles are stored in the script's directory alongside the `.ps1` file; personal profiles are stored in the user's local app data.

## Self-Update

The `Updater` class in `src/electron/updater.ts` handles automatic updates. It checks GitHub releases for new versions and prompts the user to install. Updates are communicated via the `update:available` channel on `proxyApi`.

## Dependencies

| Package | Purpose |
|---|---|
| `@angular/*` | UI framework (v12) |
| `@angular/material` | Material Design components |
| `electron` | Desktop framework (v13) |
| `node-pty` | PTY terminal spawning for PowerShell |
| `xterm` | Terminal rendering in the UI |
| `globby` | File glob matching for script discovery |
| `sqlite3` | Profile database storage |
| `js-yaml` / `node-yaml` | Settings file parsing |
| `angular-split` | Resizable panel layout |
| `ngx-markdown` | Markdown rendering for script descriptions |
