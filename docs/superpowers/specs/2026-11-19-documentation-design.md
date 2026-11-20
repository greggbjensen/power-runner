# Documentation Design — PowerRunner

**Date:** 2026-11-19
**Status:** Draft — awaiting user approval
**Branch:** `feature/documentation` (to be created from `develop`)

## Overview

Create a comprehensive documentation site for PowerRunner, a desktop application built with Angular 12 + Electron for running and managing PowerShell scripts. The documentation will live in `docs/` (GitHub Pages, Jekyll `cayman` theme) and replace the current minimal `docs/index.md`.

## Goals

1. Provide a single source of truth for both end users and developers
2. Replace the sparse `docs/index.md` with a proper docs home
3. Document the architecture so new contributors can understand the codebase quickly
4. Capture troubleshooting knowledge that currently only exists in code (e.g., the Code.exe editor integration)

## Non-Goals

- Fix the Code.exe ENOENT bug (deferred to a separate PR)
- Restructure the codebase
- Add new features

## Target Structure

```
docs/
├── index.md                  # Docs home — overview, quick links
├── _config.yml               # Existing Jekyll config, kept as-is
├── user-guide.md             # Installation, setup, running scripts, profiles
├── developer-guide.md        # Dev environment setup, build/test/release, code structure
├── architecture.md           # Two-process model, IPC bridge, module layout, data flow
└── troubleshooting.md        # Common issues, known limitations, editor setup
```

## Content Plan

### `docs/index.md` (new)
- Project overview (reuse current README intro + example)
- Screenshot
- Quick links to User Guide and Developer Guide
- Brief feature list

### `docs/user-guide.md`
- Installation (installer, Windows SmartScreen workaround)
- First-run setup (base path, search patterns with examples)
- Understanding the UI (tree sidebar, tabs, form, terminal)
- Running scripts (run, run external, copy command)
- Managing profiles (save, load, share, remove)
- Editor integration (editing scripts in VS Code)

### `docs/developer-guide.md`
- Prerequisites (Node.js LTS, Yarn, VS Code, Windows Build Tools)
- Setting up the dev environment (clone, yarn, npm start)
- Running tests (unit: `npm run test`, e2e: `npm run e2e`)
- Linting (`npm run lint`)
- Code structure overview (modules, key files)
- Building for production (`npm run build-prod`)
- Packaging releases (`npm run package`, `npm run package-installer`)
- Release process (from README)

### `docs/architecture.md`
- Two-process model (renderer vs main)
- IPC bridge design (NodeProxyRegistry, ProxyNodeService, preload bridge)
- Module layout (AppModule, CoreModule, RunnerModule, SharedModule)
- Key components (ScriptTree, ScriptPage, ScriptForm, ScriptLog, SettingsPane)
- Script execution flow (discover → parse → form → run → output)
- Settings storage (~/.powerrunner/settings.yaml)
- Key models (IScript, IScriptFile, IScriptParam, ISettings, etc.)

### `docs/troubleshooting.md`
- Code.exe not found (document the issue and workaround)
- Scripts not appearing (check search path patterns, glob syntax)
- Script parsing fails (PowerShell availability, GetCommandMetadata)
- Elevated mode issues
- Performance with large script directories

## Branch Strategy

1. Create `feature/documentation` from `develop`
2. Write all documentation files
3. Commit with descriptive messages
4. Submit PR to `develop`

## Success Criteria

- [ ] `docs/index.md` has a proper landing page with overview and navigation
- [ ] `docs/user-guide.md` covers all user-facing features end-to-end
- [ ] `docs/developer-guide.md` lets a new developer set up and run tests
- [ ] `docs/architecture.md` accurately describes the codebase structure and data flow
- [ ] `docs/troubleshooting.md` covers common pain points
- [ ] All files follow consistent formatting
- [ ] GitHub Pages renders the site correctly
