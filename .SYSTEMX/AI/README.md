# SYSTEMX AI Standard

This folder is the generic AI operating layer for SFWA-WTL-G1. It captures the
reusable lessons from high-automation project work without carrying private
product logic, private vendor names, or customer-specific workflows into the
public template.

## Files

| File | Purpose |
| --- | --- |
| `AGENT-MESH-STANDARD.md` | Agent 0, subagent lanes, message bus, checkpoints, memory, and archive rules. |
| `TOOLCALLING-AND-BROWSER-AUTOMATION.md` | Playwright, Chrome DevTools MCP, local browser control, and screen fallback rules. |
| `EXTERNAL-SERVICE-CONNECTOR-STANDARD.md` | Generic adapter pattern for third-party services and vendor tools. |
| `RECOVERY-PLAYBOOK.md` | Popup, permission, auth, port, process, and apply/blocker recovery paths. |
| `LLM-INTERFACE-AND-TOOL-ROUTING.md` | Required LLM read order, routing ladder, prompt baselines, and tool handoff contract. |
| `agent-mesh.schema.json` | Minimal machine-readable schema for agent messages and checkpoints. |
| `AGENTS.md` | Canonical SYSTEMX-first agent instruction map. |
| `adapters/` | Canonical source for Claude, Gemini, Copilot, Cursor, Windsurf, Cline, Continue, Junie, and Amazon Q adapter instructions. |

## Root Cleanup Rule

`.SYSTEMX/AI` is the source of truth for AI instructions. Root files and vendor
rule folders are now discovery shims only:

- `AGENTS.md`
- `CLAUDE.md`
- `GEMINI.md`
- `.github/copilot-instructions.md`
- `.cursor/rules/systemx.mdc`
- `.windsurf/rules/systemx.md`
- `.clinerules/systemx.md`
- `.continue/rules/systemx.md`
- `.junie/AGENTS.md`
- `.amazonq/rules/systemx.md`

Do not put long agent rules in those root/vendor files. Update
`.SYSTEMX/AI/AGENTS.md` and `.SYSTEMX/AI/adapters/`, then run
`npm run wtl:sync`.

## Core Rule

Agent systems in this template must be reviewable, bounded, and local-first.
Subagents may help research, inspect, test, and propose changes, but they do not
become hidden memory, silent deploy authority, or unbounded tool callers.

Use Agent 0 as the coordinator. Use subagents as scoped lanes. Use scripts and
MCP/browser tools as allowlisted capabilities with logs, evidence, and a clear
deny path.

Start an AI-assisted task with
[`LLM-INTERFACE-AND-TOOL-ROUTING.md`](LLM-INTERFACE-AND-TOOL-ROUTING.md), then
use the [Agent Mesh Standard](AGENT-MESH-STANDARD.md) for message and archive
rules.
