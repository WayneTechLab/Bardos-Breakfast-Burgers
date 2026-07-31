# Agent File Map

SFWA-WTL-G1 uses `.SYSTEMX` as the default operational root. AI instructions,
agent standards, prompt catalogs, route maps, and adapter source files belong in
`.SYSTEMX/AI`.

## SYSTEMX-first root policy

Root/vendor agent files exist only when a tool needs a fixed discovery path.
They must stay compact and point back into `.SYSTEMX/AI`.

| Path | Role | Root/vendor status | Source of truth |
| --- | --- | --- | --- |
| `AGENTS.md` | Codex/general discovery stub | Keep, compact | `.SYSTEMX/AI/AGENTS.md` |
| `CLAUDE.md` | Claude Code discovery stub | Keep, compact | `.SYSTEMX/AI/adapters/claude.md` |
| `GEMINI.md` | Gemini CLI discovery stub | Keep, compact | `.SYSTEMX/AI/adapters/gemini.md` |
| `.github/copilot-instructions.md` | GitHub Copilot discovery stub | Keep, compact | `.SYSTEMX/AI/adapters/copilot.md` |
| `.cursor/rules/systemx.mdc` | Cursor discovery stub | Keep, compact | `.SYSTEMX/AI/adapters/cursor.md` |
| `.windsurf/rules/systemx.md` | Windsurf discovery stub | Keep, compact | `.SYSTEMX/AI/adapters/windsurf.md` |
| `.clinerules/systemx.md` | Cline discovery stub | Keep, compact | `.SYSTEMX/AI/adapters/cline.md` |
| `.continue/rules/systemx.md` | Continue discovery stub | Keep, compact | `.SYSTEMX/AI/adapters/continue.md` |
| `.junie/AGENTS.md` | Junie discovery stub | Keep, compact | `.SYSTEMX/AI/adapters/junie.md` |
| `.amazonq/rules/systemx.md` | Amazon Q discovery stub | Keep, compact | `.SYSTEMX/AI/adapters/amazonq.md` |

## Generation rule

`npm run wtl:sync` owns both sides:

1. Canonical SYSTEMX AI files under `.SYSTEMX/AI`.
2. Generated discovery stubs at required root/vendor paths.

Run:

```console
npm run wtl:sync
npm run sync:system:check
```

If a new agent requires a fixed root path, add its canonical source file and
generated stub to `.SYSTEMX/lib/agent-adapters.mjs`, document it here, and add
it to the structure and AI standard checks.

## Default placement rule

- AI operating docs: `.SYSTEMX/AI/`
- Agent adapter source: `.SYSTEMX/AI/adapters/`
- Agent runbooks: `.SYSTEMX/docs/`
- Active work lanes: `.SYSTEMX/status/`
- Message bus state: `.SYSTEMX/state/bus/`
- Tool-required discovery stubs: exact vendor paths only

Do not create root `CODEX.md`, `CoPilot.md`, `GPT.md`, or similar aliases.
Codex uses `AGENTS.md`, Copilot uses `.github/copilot-instructions.md`, and
Gemini uses `GEMINI.md`.
