# Platform, Agent, Tooling, and Security Contract

Complete this file before generating or updating a project.

## Runtime target

- Platform ID: `macos-arm64` / `macos-x64` / `windows-x64` /
  `windows-arm64` / `ubuntu-x64` / `ubuntu-arm64` / `wsl2-x64` /
  `wsl2-arm64` / `debian-*` / `linux-*`
- Architecture: `arm64` / `x64`
- Shell: Zsh/Bash / PowerShell 7 / WSL2 Bash
- Node.js: 24.x LTS
- Firebase CLI: 15.25.1, pinned by the SYSTEMX on-demand command

## Agent compatibility

- Root discovery stub: `AGENTS.md`
- Canonical AI instructions: `.SYSTEMX/AI/AGENTS.md`
- Adapters required: Claude Code, Gemini CLI, GitHub Copilot, Cursor,
  Windsurf, Cline, Continue, Junie, and Amazon Q as applicable
- Subagent budget and lane limits:
- Human owner of integration and publication:

Do not create misleading `CODEX.md`, `CoPilot.md`, or `GPT.md` aliases. Use the
recognized agent instruction path.

## Tool architecture

- Native tools verified:
- x64-emulated tools and operator approval:
- Workstation installer and package-manager lane:
- VS Code location: native desktop / Windows host for WSL2
- Optional MCP servers and staging/local target:
- CI identity method: OIDC / Application Default Credentials

## Security requirements

- No credentials, tokens, private keys, or production exports in source,
  packets, prompts, or logs.
- Least-privilege IAM and staging-first validation.
- High/critical dependency findings: zero.
- Rules, auth/MFA, secret scan, packet validation, and deployment preflight pass.
