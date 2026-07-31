# SFWA-WTL-G1 Agent Map

This is the canonical repository instruction map for coding agents.

## SYSTEMX-first rule

- Treat `.SYSTEMX` as the default operating root.
- Root agent files are discovery stubs only when a vendor/tool requires a fixed
  path.
- Canonical AI instructions, adapter source, prompt rules, routing rules, and
  subagent standards live under `.SYSTEMX/AI`.
- Do not create misleading aliases such as `CODEX.md`, `GPT.md`, or
  `CoPilot.md`.

## Operating rules

- Preserve the cross-platform contract: macOS Apple Silicon, Windows 11 x64,
  and Windows 11 ARM64 are primary; Ubuntu, Debian, and WSL2 are documented
  compatibility lanes.
- Put shared behavior in the Node.js CLI under `.SYSTEMX`; shell files are
  compatibility launchers only.
- Use argument-array child processes. Never interpolate secrets into commands,
  logs, setup packets, commits, or agent prompts.
- Run `npm run ci:all` and `npm run wtl:deploy -- --preflight` before
  publishing production-impacting changes.
- Keep `package.json`, `.SYSTEMX/version/`, starter files, setup-packet
  schema, documentation, and agent adapters synchronized with
  `npm run wtl:sync`.
- Read `.SYSTEMX/docs/AGENT-OPERATIONS.md` before delegating work. Subagents
  multiply token, tool, and review usage; assign bounded lanes and verify every
  result in the parent session.
- Do not make production deployments, rotate credentials, or change billing
  without explicit operator authorization.

Product: **SFWA-WTL-G1 — Standard Firebase Web App, Wayne Tech Lab Generation
1**, provided by Wayne Tech Lab LLC under the MIT License and without warranty.
