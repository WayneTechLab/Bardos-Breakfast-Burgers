# Platform Matrix

| Capability | macOS ARM64 | Windows x64 | Windows ARM64 | Ubuntu x64 | Ubuntu ARM64 | WSL2 | Other Linux |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Status | Supported | Supported | Supported with gates | Supported | Supported; CI preview | Compatibility | Compatibility/community |
| Shell | Zsh/Bash | PowerShell 7 | PowerShell 7 | Bash | Bash | Bash + Windows interop | Bash |
| Node 24 | Native + SHA-256 | Native + SHA-256 | Native + SHA-256 | Native + SHA-256 | Native + SHA-256 | Linux native | Native x64/ARM64 |
| VS Code | macOS app | Windows app | Windows app | Microsoft apt | Microsoft apt ARM64 | Windows host + WSL extension | Vendor package varies |
| Git / GitHub CLI | Native | Native | Native | Signed repository | Signed repository | Linux native | apt/dnf |
| Firebase CLI | Pinned Node | Pinned Node | Pinned Node | Pinned Node | Pinned Node | Pinned Node | Pinned Node |
| Google Cloud CLI | Native | x64 native | Emulation + verification | Signed repository | Native ARM | Linux native | May be manual |
| Browser | Chrome | Chrome | Chrome | Chrome | Chromium fallback | Windows host | Vendor package varies |
| CI runner | `macos-15` | `windows-2025` | `windows-11-arm` | `ubuntu-24.04` | `ubuntu-24.04-arm` | Simulated smoke | Platform tests |

Ubuntu x64 and ARM64 are required release gates. GitHub currently labels the
Ubuntu ARM64 hosted runner as public preview. WSL2 platform logic is tested in
CI, but complete Windows-host integration cannot be reproduced on a standard
hosted runner and remains a compatibility gate.

Debian 12+ follows the apt path. Other apt/dnf Linux distributions can run the
shared SYSTEMX CLI, but desktop, browser, and Google Cloud vendor packages may
need manual completion. The installer warns or stops instead of silently using
an unverified binary.

Windows 10, 32-bit systems, Alpine/musl workstation installs, BSD, and unknown
architectures are not supported targets. Intel macOS is auto-detected as a
compatibility lane.
