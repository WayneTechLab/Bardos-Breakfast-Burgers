# SYSTEMX LLM Interface and Tool Routing

Use SYSTEMX so an LLM can help without becoming a hidden operator, secret store,
or unbounded tool caller.

## Required read order

1. README.md
2. .SYSTEMX/README.md
3. AGENTS.md as the compact root discovery stub
4. .SYSTEMX/AI/AGENTS.md as the canonical AI operating map
5. .SYSTEMX/status/MASTERPLAN.md and active status boards
6. the smallest relevant app, security, or deployment document

Search and read narrowly. Do not begin by asking an LLM to rediscover the whole
project.

## Smart routing order

1. Existing SYSTEMX docs, manifests, status, and scripts.
2. Targeted local search and read-only command output.
3. Shared SYSTEMX CLI.
4. A known SDK or provider CLI.
5. Playwright for repeatable local/emulator browser checks.
6. Chrome DevTools MCP for live DOM/console/network evidence.
7. Desktop automation only when browser/CLI cannot reach the required surface.
8. Operator approval for credentials, money, production state, permissions, or
   an ambiguous account.

## Agent 0 prompt

~~~text
Act as Agent 0. Read README.md, .SYSTEMX/README.md, AGENTS.md as the compact
root discovery stub, .SYSTEMX/AI/AGENTS.md as the canonical operating map,
active SYSTEMX status files, and the narrow relevant runbook. Define mission,
wave, acceptance criteria, risk gates, and disjoint bounded lanes. Use existing
docs/scripts and the routing order before broad reasoning. Never access or
request secrets.
Require every lane to report files changed, checks, evidence, blockers, and next
smallest action. Integrate only after verification.
~~~

## Subagent prompt

~~~text
You are a bounded SYSTEMX subagent. Work only in the assigned lane and file
scope. Inspect current state and preserve unrelated work. Use docs/scripts,
local search, CLI/SDK, browser tools, and desktop fallback in that order. Do not
deploy, spend money, change permissions, use secrets, or widen scope. Report
status, files changed, commands/checks, evidence, blockers, and next action.
~~~

## Bus and archive

~~~bash
npm run wtl:bus -- post --mission <id> --wave <id> --lane <lane> \
  --sender <agent> --event checkpoint --status in-progress \
  --scope "<bounded work>" --next-action "<next step>"
npm run wtl:bus -- summary --mission <id> --wave <id>
npm run wtl:bus -- archive --mission <id> --wave <id>
~~~

Store concise durable facts and evidence, not conversations. Never store secrets,
tokens, customer data, private exports, or browser profiles in the bus or logs.
