# Platform Matrix

| Capability | macOS ARM64 | Windows x64 | Windows ARM64 | Ubuntu x64 | Ubuntu ARM64 | WSL2 | Debian / Linux |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Support | Required | Required | Required with gates | Required | Required; runner preview | Compatibility | Compatibility/community |
| Shell | Zsh/Bash | PowerShell 7 | PowerShell 7 | Bash | Bash | Bash + Windows interop | Bash |
| Node.js 24 | Native + checksum | Native + checksum | Native + checksum | Native + checksum | Native + checksum | Linux native + checksum | Native + checksum |
| VS Code | macOS app | Windows app | Windows app | Linux package | Linux ARM64 package | Windows host + WSL extension | Vendor package varies |
| Git / GitHub CLI | Native | Native | Native | Signed repository | Signed repository | Linux native | apt/dnf path |
| Firebase CLI | Pinned Node package | Pinned Node package | Pinned Node package | Pinned Node package | Pinned Node package | Pinned Node package | Pinned Node package |
| Google Cloud CLI | Native | Native x64 | x64 emulation + verification | Signed repository | Native ARM package | Linux native | May require manual completion |
| Browser | Chrome | Chrome | Chrome | Chrome | Chromium fallback | Windows-host Chrome | Vendor package varies |
| CI release gate | `macos-15` | `windows-2025` | `windows-11-arm` | `ubuntu-24.04` | `ubuntu-24.04-arm` | Simulated smoke | Unit/platform coverage |

The machine-readable contract is
[`../platforms/support-matrix.json`](../platforms/support-matrix.json). A required
support claim means setup checks, tests, security checks, build, packet round
trip, native launcher/installer dry run, doctor, and deployment preflight pass
on the corresponding hosted runner.

WSL2 cannot be represented completely by a standard GitHub-hosted runner. Its
platform, process, path, browser integration, and installer paths are covered by
tests and a simulated smoke job; Windows-host interop remains a compatibility
gate. The Ubuntu ARM runner is a GitHub public-preview runner class.

Windows 10, 32-bit hosts, Alpine/musl workstation installs, BSD, and unlisted
architectures are not supported. Intel macOS is auto-detected and installer
compatible but is not a required release lane.
