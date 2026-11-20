# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PowerRunner is a desktop application built with Angular 12 + Electron for running and managing PowerShell scripts. It scans directories for `.ps1` files, parses their parameters using PowerShell's `Get-CommandMetadata`, and presents auto-generated form inputs in a tabbed UI with a live terminal output window.

## Key Commands

```bash
yarn                    # Install dependencies
ng serve                # Start Angular dev server (web only, no Electron)
npm start               # Full dev mode: builds Electron + Angular, runs Electron app
npm run build           # Build Electron JS + Angular (dev output to dist/)
npm run build-prod      # Production build
npm run test            # Run unit tests (Karma/Jasmine)
npm run lint            # Lint (TSLint)
npm run e2e             # Run e2e tests (Protractor)
npm run package         # Package Electron app for distribution (outputs to ./release)
npm run package-installer # Package + create Windows installer
```

## Architecture

### Two-Process Model

The app follows a standard Angular-in-Electron pattern with **two separate processes**:

1. **Renderer process** (`src/app/`): Angular UI that runs in a BrowserWindow with `nodeIntegration: false` and `contextIsolation: true`.
2. **Main process** (`src/electron/`): Node.js code that handles file system access, PowerShell execution, and native OS operations.

### IPC Bridge (NodeProxy Registry)

Renderer and main process communicate via a custom IPC proxy system:

- `src/electron/main.ts`: Creates Electron main-process service instances and **auto-registers** all their public methods via `ipcMain`. Method names follow the pattern `{ServiceName}.{operation}`.
- `src/app/core/services/node-proxy.registry.ts`: On the renderer side, `NodeProxyRegistry` scans Angular service classes for public methods (via prototype reflection), creates proxy functions that wrap them in IPC calls, and injects them. Services extend `ProxyNodeService` which holds a reference to the proxy.
- `src/electron/preload.js`: Uses `contextBridge` to expose `proxyApi` (with `send`/`receive`) to the renderer — the only bridge between processes.

This means every Angular service (e.g. `ScriptService`, `SettingsService`, `AppService`) is a thin wrapper that delegates to the corresponding main-process service (e.g. `NodeScriptService`, `NodeSettingsService`, `NodeAppService`).

### Module Structure

- **`src/app/app.module.ts`**: Root module. Bootstraps `AppComponent`.
- **`src/app/core/`**: Shared models, services (all IPC-wrapped), and utilities. Models are plain interfaces shared between renderer and main process.
- **`src/app/runner/`**: Feature module for the core runner UI. Declares all components, directives, and pipes for script browsing, running, and settings.
- **`src/app/shared/`**: Reusable UI module aggregating Angular Material modules and shared components (e.g. `BrowseDirectoryFieldComponent`).
- **`src/electron/`**: Electron main process code. Services here run in Node.js with direct file system and process access.

### Key Models (all in `src/app/core/models/`)

| Interface | Purpose |
|---|---|
| `IScript` | Full parsed script with description, params, hash, status |
| `IScriptFile` | File metadata: id, directory, module, name |
| `IScriptParam` | A single script parameter (name, type, attributes) |
| `IScriptRun` | A run invocation: script + parameter values |
| `IScriptProfile` / `IScriptProfileMap` | Saved parameter sets (profiles) |
| `ISettings` | User settings: basePath + searchPaths |
| `IScriptNode` | Hierarchical tree node (name + children) |
| `ScriptRef` | Reference to a running script, used for terminal data callbacks |
| `NodeProxy` | IPC method registry used by the proxy system |

### Key Components

| Component | Role |
|---|---|
| `AppComponent` | Root layout: toolbar, script tree sidebar (mat-drawer), script tabs area, settings drawer |
| `ScriptTreeComponent` | Hierarchical tree of discovered scripts (grouped by parent directory/module) |
| `ScriptTabsContainerComponent` | Tab bar for open scripts + angular-split layout |
| `ScriptPageComponent` | Individual script view: form inputs + terminal log |
| `ScriptFormComponent` | Auto-generates form inputs from parsed script parameters |
| `ScriptLogComponent` | xterm.js terminal display for live script output |
| `SettingsPaneComponent` | Settings form (base path, search paths) |

### Script Execution Flow

1. User clicks a script in the tree → `ScriptTreeComponent` opens it in a tab
2. `ScriptService.parseAsync()` invokes `NodeScriptService.parseAsync()` in the main process
3. Main process runs `GetCommandMetadata.ps1` via `exec()` to extract parameter metadata
4. `ScriptFormComponent` renders inputs based on `IScriptParam[]`
5. User clicks Run → `ScriptService.runAsync()` spawns a `node-pty` child process
6. Child PTY output is streamed to the renderer via IPC on `{scriptChannel}:data`
7. Exit events come via `{scriptChannel}:exit`
8. `ScriptLogComponent` (xterm.js) renders the terminal output with flow control (XON/XOFF)

### Configuration & Settings

- Settings are stored in `~/.powerrunner/settings.yaml` (managed by `NodeSettingsService`)
- `src/app/run-settings.ts` contains compile-time toggles for caching and pre-caching behavior

### Script Discovery

- Uses `globby` for file glob matching
- Scripts are grouped by parent directory (`module` field) for tree display
- Exclude paths start with `!` in settings

## Coding Conventions

- Component prefix: `pru-` (configured in `angular.json` `prefix`)
- Styles: SCSS, viewEncapsulation set to `None` globally
- Linting: TSLint (with `tslint-consistent-coding`)
- Testing: Jasmine + Karma (unit), Protractor (e2e)
- The `main.ts` Electron entry uses a `bindService()` pattern that auto-discovers all public methods on service instances and registers them as IPC handlers — no manual IPC mapping needed.
