# Linux and WSL2 Setup

## One-line install

Run this in Terminal on Ubuntu 24.04, Debian 12+, WSL2, or another apt/dnf
Linux distribution:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/WayneTechLab/SFWA-WTL-TEMPLATE/main/.SYSTEMX/scripts/install.sh)"
```

The installer detects x64 or ARM64 and distinguishes native Ubuntu, Debian,
generic Linux, and WSL2. It displays its plan before making changes and asks
again before entering the menu-driven Setup & Tooling phase.

## Installed baseline

- Node.js 24 from the matching vendor archive, verified against
  `SHASUMS256.txt`.
- Git and the official signed GitHub CLI repository.
- VS Code from Microsoft's signed apt/RPM repository.
- Google Cloud CLI from Google's signed apt repository where supported.
- Google Chrome on Linux x64 or Chromium on Linux ARM64.
- The pinned project Firebase CLI and all npm dependencies.

On WSL2, Linux-native Node, Git, GitHub CLI, Google Cloud, Firebase, and npm run
inside the distribution. When Windows interop and WinGet are available, VS
Code, Chrome, and the WSL extension are installed on the Windows host. Restart
the WSL shell if the `code` command is not immediately visible.

## Support levels

- Ubuntu 24.04 x64 and ARM64 are required release gates.
- WSL2 x64/ARM64 uses the Ubuntu/Debian shell path plus Windows-host integration
  and is a supported compatibility lane.
- Debian 12+ is an apt compatibility lane.
- Other apt/dnf distributions support the shared CLI, but vendor browser,
  desktop, or Google Cloud packages may require manual completion.
- Alpine/musl, 32-bit Linux, BSD, and containers without an interactive shell
  are not workstation-installer targets.

## Safe automation

Review the current installer before running it:

```bash
curl -fsSL https://raw.githubusercontent.com/WayneTechLab/SFWA-WTL-TEMPLATE/main/.SYSTEMX/scripts/install.sh | less
```

For unattended CI or managed workstations:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/WayneTechLab/SFWA-WTL-TEMPLATE/main/.SYSTEMX/scripts/install.sh)" -- --yes --skip-menu
```

Override the clone destination or repository with `SFWA_WTL_HOME` and
`SFWA_WTL_REPO_URL`. Existing Git checkouts are reused without pulling,
resetting, or overwriting local changes.

## After installation

If setup was deferred:

```bash
cd "$HOME/SFWA-WTL-G1"
npm run wtl:menu -- --setup-phase
```

Authentication happens after installation through the setup phase. Never put
tokens, service-account files, private keys, or production secrets in the
installer command or repository.

Vendor references: [VS Code on Linux](https://code.visualstudio.com/docs/setup/linux),
[VS Code with WSL](https://code.visualstudio.com/docs/remote/wsl-tutorial),
[GitHub CLI on Linux](https://github.com/cli/cli/blob/trunk/docs/install_linux.md),
[Google Cloud CLI](https://docs.cloud.google.com/sdk/docs/install-sdk), and
[Node.js 24 downloads](https://nodejs.org/download/release/latest-v24.x/).
