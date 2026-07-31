# One-Line Workstation Install

These commands install the required workstation tools, clone SFWA-WTL-G1 into
`~/SFWA-WTL-G1` (or reuse an existing checkout safely), run diagnostics, and
then ask whether to proceed into the menu-driven Setup & Tooling phase.

## macOS Terminal

Apple Silicon is the required macOS lane. Intel macOS is compatibility-tested.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/WayneTechLab/Bardos-Breakfast-Burgers/main/.SYSTEMX/scripts/install.sh)"
```

## Windows 11 PowerShell

Run in Windows Terminal using Windows PowerShell 5.1 or PowerShell 7:

```powershell
irm https://raw.githubusercontent.com/WayneTechLab/Bardos-Breakfast-Burgers/main/.SYSTEMX/scripts/install.ps1 | iex
```

## Ubuntu, Debian, or Linux Terminal

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/WayneTechLab/Bardos-Breakfast-Burgers/main/.SYSTEMX/scripts/install.sh)"
```

## WSL2 shell

Run inside the Ubuntu or Debian WSL2 terminal:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/WayneTechLab/Bardos-Breakfast-Burgers/main/.SYSTEMX/scripts/install.sh)"
```

The WSL path installs Linux-native command-line tools inside WSL. It installs
Windows VS Code, Chrome, and the WSL extension through WinGet when Windows
interop is available.

## What is installed

- Node.js 24 LTS with vendor SHA-256 verification.
- Git, GitHub CLI, VS Code, Google Cloud CLI, and Chrome/Chromium.
- PowerShell 7 on Windows.
- Pinned Firebase CLI and project npm dependencies.

The installer does not sign in, create cloud projects, deploy, or collect
secrets. After diagnostics pass, it asks:

```text
Proceed to the menu-driven Setup & Tooling phase now? [Y/n]
```

Choose **No** to stop cleanly. Resume later with:

```console
npm run wtl:menu -- --setup-phase
```

## Review before execution

The `main` branch may change daily. Inspect the script first if required by
your security policy:

```bash
curl -fsSL https://raw.githubusercontent.com/WayneTechLab/Bardos-Breakfast-Burgers/main/.SYSTEMX/scripts/install.sh | less
```

```powershell
irm https://raw.githubusercontent.com/WayneTechLab/Bardos-Breakfast-Burgers/main/.SYSTEMX/scripts/install.ps1
```

For managed automation, use `--yes --skip-menu` with Bash. For PowerShell:

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/WayneTechLab/Bardos-Breakfast-Burgers/main/.SYSTEMX/scripts/install.ps1))) -Yes -SkipMenu
```

Never place credentials in the command line.

Read [Linux Setup](Linux-Setup), [Windows Setup](Windows-Setup), and the
[Platform Matrix](Platform-Matrix) for architecture and support details.
