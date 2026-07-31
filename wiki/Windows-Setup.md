# Windows 11 Setup

## One-line install

Run in Windows Terminal using Windows PowerShell 5.1 or PowerShell 7:

```powershell
irm https://raw.githubusercontent.com/WayneTechLab/Bardos-Breakfast-Burgers/main/.SYSTEMX/scripts/install.ps1 | iex
```

This installs PowerShell 7, Git, GitHub CLI, VS Code, Google Cloud CLI, Chrome,
checksum-verified Node.js 24, the exact-version Firebase CLI command, and project dependencies.
After diagnostics pass, it asks whether to enter the menu-driven Setup &
Tooling phase. If the command starts in Windows PowerShell 5.1, that phase
relaunches in the installed PowerShell 7 host.

It does not authenticate, create cloud projects, deploy, or collect secrets.
Existing Git checkouts are reused without pulling, resetting, or overwriting
local changes.

## Existing clone

```powershell
.\.SYSTEMX\scripts\bootstrap-windows.ps1 -Check
.\wtl-menu.ps1
.\wtl-setup.ps1 --check
.\.SYSTEMX\systemx.ps1 doctor --json
npm run wtl:menu -- --setup-phase
```

CMD launchers are also provided. Windows does not require Bash or WSL.

## Windows ARM64

Node.js, Git, GitHub CLI, VS Code, and Firebase tooling use native ARM64 paths
when available. Google Cloud CLI and Stripe CLI may use x64 emulation. The
installer displays that warning and verifies Google Cloud with a read-only
version command before setup continues.

## Authentication

Authentication starts only after installation, from the setup phase. Use
interactive local logins and OIDC or Application Default Credentials in CI.
Never store legacy Firebase tokens, service-account files, or production
secrets in the repository.

See [One-Line Install](One-Line-Install) and the
[Platform Matrix](Platform-Matrix).
