# Starter Prompts and Smart Routing

This page gives starter prompt patterns for using Agent 0, subagents, and
`.SYSTEMX` together while working with LLMs, SDKs, CLI tools, MCP servers,
APIs, local scripts, and other tooling.

## Routing principle

For max token savings, route work to the cheapest reliable tool first:

1. Existing `.SYSTEMX` docs, status, and scripts
2. Local files and repository search
3. CLI or shell command with bounded output
4. SDK or direct API call for a specific known operation
5. MCP server when it is the right scoped connector
6. Broader LLM reasoning only after the cheaper surfaces have narrowed the task

Use subagents only when the task truly benefits from parallel bounded lanes.

## Starter prompt: Agent 0 mission setup

```text
Read README.md, .SYSTEMX/README.md, .SYSTEMX/status/MASTERPLAN.md,
.SYSTEMX/status/TODO.md, .SYSTEMX/status/AGENTS.md, and the relevant runbooks.
Act as Agent 0. Define the mission, active wave, lanes, evidence rules, and the
next smallest executable task for each lane. Keep the repository on a single
mainline state and update durable status files before handoff.
```

For the complete read order, routing ladder, command patterns, and handoff
contract, see [LLM Interface & Tool Routing](SYSTEMX-LLM-Interface-and-Tool-Routing).

## Starter prompt: 0 → production mission

```text
Act as Agent 0 and follow the SYSTEMX 0 → Production Guide. First establish
platform and project readiness, then learn the repository, complete/verify the
intake plan, configure only ignored local environment files, assign bounded
lanes, prove locally with owned ports and browser evidence, run preflight before
any deploy, and archive a concise end-of-wave handoff. Do not request or store
secrets. Stop when a human account, spending, production, or permission decision
is needed.
```

## Starter prompt: one bounded subagent lane

```text
You are a bounded subagent. Work only in the assigned lane and file scope.
Before editing, inspect current state and preserve unrelated changes. Report
back with status, files changed, checks run, blockers, and next smallest action.
Do not widen scope without an Agent 0 checkpoint.
```

## Starter prompt: docs + SYSTEMX alignment

```text
Update the implementation, then align README, .SYSTEMX docs, and the Wiki in
the same pass. Prefer existing scripts and status files before inventing new
structure. Keep output compact and operator-readable.
```

## Starter prompt: SDK / CLI / MCP / API routing

```text
Use smart routing for token savings. Check repository docs and scripts first,
then local files, then CLI, then SDK or direct API, then MCP only when it is
the right scoped connector. Use the LLM mainly to plan, summarize, verify, and
integrate evidence rather than to replace deterministic tooling.
```

## Starter prompt: long mission with bus + waves

```text
Operate in waves. Start by defining mission ID, wave ID, lane scopes, and exit
conditions. Use the local SYSTEMX bus for compact checkpoint packets and archive
old wave traffic when the wave closes. Keep the live context focused on the
current wave only.
```

## Practical token-saving rules

- Do not ask the model to rediscover what `.SYSTEMX` already documents.
- Do not use broad browsing or giant file dumps when a targeted command works.
- Do not spawn subagents for trivial edits.
- Do not let every worker read the whole repo if only one surface matters.
- Archive old wave traffic into compact summaries.
- Reuse deterministic scripts and commands for repeated operations.

## Smart routing examples

- Use `rg` before asking an LLM where code lives.
- Use `npm run wtl:bus -- summary --mission <id> --wave <id>` before asking for a
  narrative recap of current lane state.
- Use direct provider CLI or SDK for known deploy/status actions instead of
  explaining them from memory.
- Use MCP when a connected tool can safely answer the task with less manual
  token-heavy reasoning.
