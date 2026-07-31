# Agent Mesh Standard

## Purpose

The SYSTEMX agent mesh gives an AI-assisted project a shared operating contract:
who is coordinating, which lanes are active, what tools are allowed, what
evidence was produced, and what must be archived to keep token use under
control.

This is not a promise of autonomy. It is a coordination format for developers
and coding agents.

## Roles

| Role | Responsibility | Authority |
| --- | --- | --- |
| Agent 0 | Coordinator, router, final reviewer, checkpoint owner | Can plan, delegate, merge evidence, and request approval. |
| Subagent lane | Narrow research, code, test, docs, security, or browser task | Can inspect and propose within its lane. |
| Operator | Human project owner | Owns secrets, production deploy decisions, paid services, and final acceptance. |
| Tool runner | Script, CLI, MCP server, browser, or SDK process | Runs only through allowlisted commands or documented manual steps. |

## Lane Types

Use these generic lanes before inventing project-specific ones:

| Lane | Use When |
| --- | --- |
| `research` | Inspect docs, repo history, APIs, standards, or dependency behavior. |
| `code` | Implement a scoped source change. |
| `test` | Run, write, or repair verification. |
| `browser` | Drive local UI with Playwright, Chrome DevTools MCP, or browser inspection. |
| `desktop` | Use macOS/Windows desktop automation or native app inspection with explicit permission. |
| `connector` | Work with external service APIs, SDKs, CLIs, or vendor dashboards. |
| `security` | Review secrets, auth, policy, permissions, or release gates. |
| `docs` | Update README, wiki, setup packets, and operator guides. |
| `release` | Prepare version, changelog, tag notes, deploy preflight, and rollback notes. |

## Message Envelope

Every durable agent message should fit this shape:

```json
{
  "id": "msg_20260731_000001",
  "missionId": "mission_systemx_update",
  "waveId": "wave_01",
  "lane": "browser",
  "from": "agent_0",
  "to": "subagent_browser",
  "type": "task",
  "status": "in_progress",
  "priority": 5,
  "correlationId": "flow_login_smoke",
  "sessionId": "local_session_001",
  "summary": "Verify login popup flow locally.",
  "evidence": [],
  "blockers": [],
  "nextAction": "Run Playwright headed smoke against localhost.",
  "createdAt": "2026-07-31T00:00:00Z",
  "expiresAt": "2026-08-01T00:00:00Z"
}
```

## Required Statuses

Use only these statuses in durable state:

| Status | Meaning |
| --- | --- |
| `planned` | Lane exists but work has not started. |
| `in_progress` | Work is active. |
| `blocked` | Work cannot continue without a decision, credential, permission, or external state change. |
| `needs_review` | Work produced output and needs Agent 0 or operator review. |
| `done` | Lane is complete and evidence was recorded. |
| `archived` | Lane was summarized and removed from active context. |

## Start And End Of Task

At the start of every task, Agent 0 records:

- objective
- lane owner
- allowed tools
- files or systems in scope
- expected evidence
- stop conditions

At the end of every task, Agent 0 records:

- files changed
- checks run
- evidence links
- unresolved blockers
- next mission
- archive summary

## Token Saving Rules

- Keep active lane summaries short.
- Archive completed waves into `.SYSTEMX/logs/` or the project wiki when they
  become operational history.
- Store durable facts, not full chat transcripts.
- Prefer command outputs, test reports, screenshots, and small JSON summaries
  over long copied conversations.
- Do not keep secrets, private credentials, customer data, or proprietary vendor
  implementation details in the message bus.

## Promotion Gate

A subagent lane may influence production only after:

- Agent 0 reviews the evidence.
- Security-sensitive commands have an explicit preflight.
- The operator approves any paid, destructive, production, or external-account
  action.
- The work is documented in README/wiki/setup packets when it changes the
  standard.
