# LLM Interface and Tool Routing

This document is the compact operating interface for an LLM, SDK, CLI, MCP
client, browser agent, or human working with SYSTEMX.

## Required first read

1. `README.md`
2. `.SYSTEMX/README.md`
3. `AGENTS.md` as the root discovery stub
4. `.SYSTEMX/AI/AGENTS.md` as the canonical AI operating map
5. `.SYSTEMX/status/MASTERPLAN.md` and current status files
6. the narrowest relevant feature, security, or deployment document

Do not request a complete repository dump. Search the file tree and read only
the files needed for the current decision.

## Routing ladder

| Order | Use | Why |
| --- | --- | --- |
| 1 | Existing SYSTEMX docs, manifests, status, and package scripts | Reuses known project truth with no tool-side effects. |
| 2 | Targeted local search and read-only shell commands | Locates code and evidence cheaply. |
| 3 | Shared SYSTEMX CLI | Runs safe, logged, cross-platform project operations. |
| 4 | Known SDK or provider CLI | Performs a bounded provider operation with explicit arguments. |
| 5 | Playwright | Repeats local/emulator browser flows and captures evidence. |
| 6 | Chrome DevTools MCP | Inspects a live local/staging browser state, console, DOM, and network. |
| 7 | Desktop automation | Last resort for a native UI or approval surface unavailable otherwise. |
| 8 | Operator approval | Required for credentials, payment, production, permissions, or unclear ownership. |

Never use an LLM as a substitute for a deterministic command when one already
proves the answer.

## Agent 0 mission prompt

```text
Act as Agent 0 for this repository. Read README.md, .SYSTEMX/README.md,
root AGENTS.md as the discovery stub, .SYSTEMX/AI/AGENTS.md as the canonical
operating map, .SYSTEMX/status/MASTERPLAN.md, TODO.md, IN_PROGRESS.md, and the
narrowest relevant runbook. State the mission, active wave, acceptance
criteria, risk gates, and bounded non-overlapping lanes. Use existing SYSTEMX
scripts and the routing ladder before broad reasoning. Do not access or request
secrets. Require each lane to report files changed, evidence, checks, blockers,
and the next smallest action. Integrate only after verification.
```

## Bounded subagent prompt

```text
You are a bounded SYSTEMX subagent. Work only within the lane and file scope
assigned by Agent 0. Inspect current state first and preserve unrelated work.
Use docs/scripts, local search, CLI/SDK, browser tooling, and desktop fallback
in that order. Do not deploy, spend money, change permissions, use secrets, or
widen scope. Report status, files changed, commands/checks run, evidence,
blockers, and the next smallest action.
```

## Tool invocation patterns

```bash
# platform, project, and local-session state
npm run wtl:doctor -- --strict=false
npm run wtl:local -- status

# Agent coordination
npm run wtl:bus -- post --mission <id> --wave <id> --lane <lane> \
  --sender <agent> --event checkpoint --status in-progress \
  --scope "<bounded work>" --next-action "<next step>"
npm run wtl:bus -- summary --mission <id> --wave <id>

# Browser and MCP, after npm install
npm run browser:install
npm run browser:codegen
npm run wtl:mcp
```

MCP generation writes local configuration definitions; it does not authorize a
provider, select a production account, or grant a tool unrestricted shell
access. Review every generated server command and scope before enabling it.

## Start and finish checkpoints

At the start, record objective, lane owner, allowed tools, scope, expected
evidence, and stop conditions. At finish, record files changed, checks,
evidence, blockers, next action, and whether the work is ready for review.

Archive completed wave traffic promptly:

```bash
npm run wtl:bus -- archive --mission <id> --wave <id>
```

Store compact durable outcomes, not transcript copies. Never place credentials,
tokens, customer data, private exports, or full browser profiles in the bus,
logs, packets, or prompts.
