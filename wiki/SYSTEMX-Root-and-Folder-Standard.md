# SYSTEMX Root and Folder Standard

SFWA-WTL-G1 treats `.SYSTEMX` as the default operational root. New tooling,
logs, setup files, AI coordination notes, scripts, local dashboard files, and
workflow state should live under `.SYSTEMX` unless a framework, vendor, or
public web runtime requires a root path.

## What belongs in `.SYSTEMX`

| Area | Default path |
| --- | --- |
| SYSTEMX CLI and shared libraries | `.SYSTEMX/cli`, `.SYSTEMX/lib` |
| Setup, CI, security, local-session, and utility scripts | `.SYSTEMX/scripts` |
| AI, agent, prompt, adapter source, and adapter-governance docs | `.SYSTEMX/AI` |
| Agent 0 and subagent operating runbooks | `.SYSTEMX/docs` |
| Active boards, master plan, TODO, DONE, and agent lanes | `.SYSTEMX/status` |
| Ignored local state, bus archives, and runtime metadata | `.SYSTEMX/state` |
| Sanitized operation logs | `.SYSTEMX/logs` |
| Local-only LAN WEBPORTAL | `.SYSTEMX/LAN` |
| Setup packets, standards, intake, and manifests | `.SYSTEMX/Standard-MD-Files`, `.SYSTEMX/Stock-Setup-Files`, `.SYSTEMX/Unified-Setup-Process` |

## What must remain at repository root

These files stay at root because the app, package manager, GitHub, Firebase, or
coding-agent tools expect them there:

- `package.json`, `package-lock.json`
- `index.html`, `src/`, `public/`, `vite.config.ts`, `tsconfig.json`,
  `eslint.config.js`
- `firebase.json`, `.firebaserc`, `firestore.rules`,
  `firestore.indexes.json`, `storage.rules`
- `README.md`, `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, `SUPPORT.md`,
  `CODE_OF_CONDUCT.md`, `CHANGELOG.md`
- compact discovery stubs: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`
- `.github/`, `.cursor/`, `.windsurf/`, `.clinerules/`, `.continue/`,
  `.junie/`, `.amazonq/`
- Thin convenience launchers such as `wtl-menu`, `wtl-menu.ps1`, and
  `wtl-menu.cmd`

The rule is simple: root is for required public app surfaces and vendor
discovery files; `.SYSTEMX` is for the operating system around the app.

## Current cleanup rule

The legacy root `scripts/` folder is not used. SYSTEMX-owned scripts now live
under `.SYSTEMX/scripts`, including:

- `.SYSTEMX/scripts/setup/seed-test-users.mjs`
- `.SYSTEMX/scripts/security/run_security_checks.sh`

## AI document rule

Use `.SYSTEMX/AI` for AI maps, adapter source, prompts, and routing standards.
Root `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and vendor rule files are generated
discovery stubs only because their tools require those locations. The durable
rules live in:

- `.SYSTEMX/AI/AGENTS.md`
- `.SYSTEMX/AI/adapters/`
- `.SYSTEMX/AI/AGENT-FILE-MAP.md`

Do not create `CODEX.md`, `CoPilot.md`, or `GPT.md` aliases.

## Local-only rule

`.SYSTEMX/LAN` is committed as template source but is never part of the public
Firebase Hosting deployment. `npm run ci:lan-isolation` fails if the LAN
dashboard leaks into `dist`.
