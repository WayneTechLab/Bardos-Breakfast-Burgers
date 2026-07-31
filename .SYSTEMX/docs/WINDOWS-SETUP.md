# Windows 11 Setup

## Requirements

- Windows 11 x64 or ARM64.
- Windows Terminal.
- WinGet from Microsoft App Installer.
- A normal user account; elevate only when a trusted vendor installer asks.

## One-line bootstrap

Run in Windows PowerShell 5.1 or PowerShell 7:

```powershell
irm https://raw.githubusercontent.com/WayneTechLab/SFWA-WTL-TEMPLATE/main/.SYSTEMX/scripts/install.ps1 | iex
```

This installs PowerShell 7, Git, GitHub CLI, VS Code, Google Cloud CLI, Chrome,
Node.js 24, the exact-version Firebase CLI command, and project dependencies. It runs
diagnostics, then asks before entering the Setup & Tooling menu phase. It does
not authenticate, create cloud resources, deploy, or collect secrets. If the
command starts in Windows PowerShell 5.1, the setup menu relaunches in the
installed PowerShell 7 host.

Node is downloaded for the detected x64 or ARM64 architecture, verified against
Node.js `SHASUMS256.txt`, and added to the user path. Existing Git checkouts are
reused without pulling, resetting, or overwriting local work.

## Existing-clone commands

```powershell
.\.SYSTEMX\scripts\bootstrap-windows.ps1 -Check
.\wtl-menu.ps1
.\.SYSTEMX\systemx.ps1 doctor --json
npm run wtl:menu -- --setup-phase
```

Optional Stripe, Microsoft 365, and MCP tooling remains explicit:

```powershell
.\.SYSTEMX\scripts\bootstrap-windows.ps1 -WithStripe -WithM365 -WithMcp
```

CMD users can run `wtl-menu.cmd`, `wtl-setup.cmd`, or
`.SYSTEMX\systemx.cmd doctor --json`. No Bash, WSL, or command translation is
required for native Windows operation.

## ARM64 verification

Node.js, Git, GitHub CLI, VS Code, and npm-based Firebase tooling use native
paths when the vendor package provides one. Google Cloud CLI and Stripe CLI may
run under x64 emulation. The installer warns before that path and runs a
harmless Google Cloud version check before setup can continue.

## Authentication

Use `gh auth login`, `gcloud auth login`, and
`npx --yes firebase-tools@15.25.1 login` locally after entering the setup phase. Use
OIDC or Application Default Credentials in CI. Do not generate or store legacy
Firebase CI tokens.

Official references: [WinGet](https://learn.microsoft.com/windows/package-manager/winget/),
[Google Cloud CLI](https://docs.cloud.google.com/sdk/docs/install-sdk), and
[Node.js 24 downloads](https://nodejs.org/download/release/latest-v24.x/).
