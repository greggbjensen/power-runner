# Developer Guide

## Prerequisites

- **Node.js** LTS version — https://nodejs.org/en/
- **Yarn** (classic) — https://classic.yarnpkg.com/en/docs/install/#windows-stable
- **Visual Studio Code** — https://code.visualstudio.com/
- **Windows Build Tools** (for native dependencies like `node-pty`, `sqlite3`):
  ```bash
  npm install --global --production windows-build-tools
  ```

## Setting Up

```bash
# Clone the repository
git clone <repo-url>
cd power-runner

# Install dependencies
yarn

# Start development mode (builds Electron + Angular, launches app)
npm start
```

## Project Structure

```
power-runner/
├── src/
│   ├── main.ts                    # Angular renderer entry point
│   ├── polyfills.ts
│   ├── index.html
│   ├── app/
│   │   ├── app.module.ts          # Root Angular module
│   │   ├── app.component.ts       # Root component (toolbar, layout)
│   │   ├── core/
│   │   │   ├── models/            # Shared TypeScript interfaces
│   │   │   ├── services/          # IPC-wrapped Angular services
│   │   │   └── utils/             # Utilities (e.g., script formatting)
│   │   ├── runner/                # Feature module (UI components)
│   │   │   ├── runner.module.ts
│   │   │   ├── components/        # All UI components
│   │   │   └── directives/
│   │   ├── shared/                # Shared UI module (Angular Material)
│   │   └── run-settings.ts        # Compile-time toggles
│   ├── electron/
│   │   ├── main.ts                # Electron main process entry
│   │   ├── preload.js             # contextBridge for IPC
│   │   ├── services/              # Native Node.js services
│   │   ├── models/
│   │   ├── powershell/
│   │   │   └── GetCommandMetadata.ps1  # Parses PowerShell scripts
│   │   └── updater.ts             # Self-update logic
│   └── assets/
├── docs/                          # Documentation site (GitHub Pages)
├── e2e/                           # Protractor e2e tests
├── samples/                       # Sample PowerShell scripts
├── angular.json                   # Angular CLI config
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript config
└── tsconfig.electron.json         # Electron process tsconfig
```

## Key Modules

| Module | Location | Purpose |
|---|---|---|
| `AppModule` | `src/app/` | Root module, bootstraps `AppComponent` |
| `CoreModule` | `src/app/core/` | Models, IPC services, utilities |
| `RunnerModule` | `src/app/runner/` | All UI components for script management |
| `SharedModule` | `src/app/shared/` | Angular Material aggregation, shared components |
| Electron Main | `src/electron/` | Native process, file system, PowerShell execution |

## Running Tests

### Unit Tests (Karma + Jasmine)

```bash
npm run test
```

Runs all unit tests in a headless Chrome browser. Test files use the `.spec.ts` naming convention alongside their source files.

### End-to-End Tests (Protractor)

```bash
npm run e2e
```

Launches the Angular dev server, then runs Protractor tests against it.

## Linting

```bash
npm run lint
```

Runs TSLint on the project. Configuration is in `tslint.json` with the `tslint-consistent-coding` rule package.

## Building

### Development Build

```bash
npm run build
```

1. Compiles Electron TypeScript to `electron/main.js`
2. Builds Angular app to `dist/powerrunner/`
3. Copies `preload.js` into the dist output

### Production Build

```bash
npm run build-prod
```

Same as development build but with `--prod` flags: optimization, no source maps, vendor chunk removal, budget enforcement.

## Packaging for Distribution

### Package the App

```bash
npm run package
```

1. Runs production build
2. Copies dependencies (`copyfiles`)
3. Packages with `electron-packager` into `./release/`

### Create Windows Installer

```bash
npm run package-installer
```

Runs `npm run package`, then executes `installer.js` (uses `electron-winstaller`) to create `PowerRunnerSetup.exe` in `release/installers/`.

### Install Dependencies for Packaging

Native modules (`node-pty`, `sqlite3`) need to be rebuilt for the target Electron version:

```bash
npm run electron-rebuild
```

## Release Process

1. Create a `feature/` branch from `develop`
2. Update `package.json` version
3. Submit PR into `develop`
4. Create a `release/` version branch from `develop`
5. Merge `release/` into `master`
6. Delete `release\PowerRunner-win32-x64` if it exists
7. Remove old installer versions from `release\installers\PowerRunner-win32-x64` as needed
8. Run `npm run package-installer`
9. Create a new GitHub release
10. Upload installers from `release\installers\PowerRunner-win32-x64`

## Development Notes

### Environment Variable

Set `NODE_ENV=dev` (done automatically by `npm start`) to enable hot reload via `electron-reload` and open DevTools on startup.

### Yarnrc Setting

`.yarnrc` must reflect the same Electron target version as specified in `package.json`.

### Port Configuration

The Angular dev server runs on `localhost:4200` by default (`ng serve`). The Electron app loads the Angular app from the `dist/` directory (not the dev server) in development mode.

### Debugging

- Open DevTools: **Help > Toggle Developer Tools** (or press Ctrl+Shift+I when focused)
- In dev mode, DevTools opens automatically on startup
- Renderer logs appear in the DevTools Console
- Main process logs appear in the terminal where you ran `npm start`
