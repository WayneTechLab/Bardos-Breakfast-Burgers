# Changelog

All notable changes to Bardo's Breakfast Burgers are documented here. This
project follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and Semantic Versioning.

## [Unreleased]

### Added

- Created the Bardo's Breakfast Burgers branded webapp concept for Salem,
  Oregon.
- Added the supplied Bardo's BB logo to `public/assets` and `docs/assets`.
- Rebranded the home, about, menu, contact, docs, rewards, README, and wiki
  landing experience from the base template.

## [4.1.0] - 2026-07-31

### Changed

- Moved canonical coding-agent instructions into `.SYSTEMX/AI/AGENTS.md`.
- Added `.SYSTEMX/AI/adapters/` as the source registry for Claude, Gemini,
  Copilot, Cursor, Windsurf, Cline, Continue, Junie, and Amazon Q.
- Converted root and vendor agent files into compact discovery stubs generated
  by `npm run wtl:sync`.
- Updated setup-packet metadata, docs, wiki source, structure validation, and
  tests for the SYSTEMX-first root cleanup.

## [4.0.0] - 2026-07-31

### Added

- Promoted `.SYSTEMX/KIT` into the unified source-package catalog.
- Added the SYSTEMX Standard MD Kit and SLC bridge commands for local-control
  screen, command, state, evidence, and stop-rule mapping.

## [1.2.0] - 2026-07-16

### Added

- Single-line workstation installers for macOS, Windows 11, Ubuntu, Debian,
  WSL2, and apt/dnf Linux compatibility lanes.
- Native Ubuntu 24.04 x64 and ARM64 platform detection, setup packets, tests,
  documentation, and required GitHub-hosted CI jobs.
- Menu-driven post-install setup phase that starts only after user consent.

### Changed

- VS Code, Git, GitHub CLI, Google Cloud CLI, Chrome/Chromium, Node.js 24, and
  pinned Firebase dependencies are installed or verified through OS-native
  package and checksum paths.
- WSL2 installs Linux-native CLIs inside the distribution and integrates with
  VS Code and Chrome on the Windows host.

## [1.1.0] - 2026-07-16

### Added

- Shared cross-platform SYSTEMX Node.js CLI and native PowerShell/CMD launchers.
- Windows 11 x64 and ARM64 setup, diagnostics, packets, quality, and deployment.
- Platform-aware sanitized JSONL logs, local state migration, tests, and docs.
- Canonical `AGENTS.md` with generated adapters for common coding agents.
- GitHub-hosted macOS/Windows CI, experimental Ubuntu smoke checks, and CodeQL.

### Changed

- Product identity to SFWA-WTL-G1, version 1.1.0, and Node.js 24 LTS.
- Firebase CLI is pinned locally for reproducible emulation and deployment.

## [1.0.0] - 2026-07-11

### Added

- Initial public SFWA-WTL template derived from the private WebApp Stack G1.

[4.1.0]: https://github.com/WayneTechLab/Bardos-Breakfast-Burgers/compare/v4.0.0...v4.1.0
[4.0.0]: https://github.com/WayneTechLab/Bardos-Breakfast-Burgers/releases/tag/v4.0.0
[1.2.0]: https://github.com/WayneTechLab/Bardos-Breakfast-Burgers/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/WayneTechLab/Bardos-Breakfast-Burgers/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/WayneTechLab/Bardos-Breakfast-Burgers/releases/tag/v1.0.0
