# Ubuntu, Linux, and WSL2 Setup

## Supported paths

| Environment | Architecture | Status |
| --- | --- | --- |
| Ubuntu 24.04 | x64 | Supported and release-blocking |
| Ubuntu 24.04 | ARM64 | Supported; hosted runner is public preview |
| WSL2 with Ubuntu/Debian | x64 or ARM64 | Supported compatibility lane |
| Debian 12+ | x64 or ARM64 | Compatibility lane |
| Other apt/dnf Linux | x64 or ARM64 | Community compatibility |

Start with the single command on [One-Line Install](One-Line-Install). The
installer detects the distribution and architecture automatically.

## Native Linux toolchain

Node 24 is downloaded from Node.js and checked against the vendor SHA-256 file.
GitHub CLI, VS Code, and Google Cloud use signed vendor repositories on
Ubuntu/Debian. Linux x64 receives Google Chrome; ARM64 receives Chromium because
Google does not provide the same Chrome Linux ARM64 package path.

## WSL2 behavior

Keep the repository in the Linux filesystem, such as
`~/SFWA-WTL-G1`, for reliable file watching and permissions. SYSTEMX installs
Linux-native Node, npm, Git, GitHub CLI, Google Cloud, and Firebase inside WSL.
VS Code and Chrome remain Windows-host applications; the installer uses WinGet
and installs the VS Code WSL extension when interop is available.

After restarting WSL, open the project with:

```bash
cd "$HOME/SFWA-WTL-G1"
code .
npm run wtl:menu -- --setup-phase
```

## Diagnostics

```bash
npm run wtl:platform
npm run wtl:doctor -- --json
npm run system:audit
npm run deploy -- --target hosting --preflight
```

Generic Linux distributions can run the shared Node CLI. If an automatic
desktop, browser, or Google Cloud package is unavailable for the distribution,
the installer stops or warns instead of silently using an unverified binary.

Official references: [VS Code Linux](https://code.visualstudio.com/docs/setup/linux),
[VS Code WSL](https://code.visualstudio.com/docs/remote/wsl-tutorial),
[GitHub CLI Linux](https://github.com/cli/cli/blob/trunk/docs/install_linux.md),
[Google Cloud CLI](https://docs.cloud.google.com/sdk/docs/install-sdk), and
[GitHub-hosted runners](https://docs.github.com/en/actions/reference/runners/github-hosted-runners).
