# Active Agent Roster

Use this page as the shared source of truth when multiple humans or coding
agents work in the repository. Replace example rows with real handles and
remove stale entries when a lane is complete.

Canonical playbook: `.SYSTEMX/docs/project/agent-0-subagent-loop.md`.

Every subagent must report status, lane, changed files, evidence, blockers, and
next action back to the coordinator before closing or accepting another task.
Subagents multiply token and tool usage, so keep assignments bounded and
parallel lanes disjoint.

Agent 0 should also assign a mission ID, wave ID, and checkpoint cadence for
every active lane. A lane without a current mission/wave context is not ready
for execution.

| Lane | Owner | Scope | Status | Last checkpoint |
| --- | --- | --- | --- | --- |
| Coordinator | project owner | integration, generated files, release gate | available | — |
| Setup/docs | unassigned | `.SYSTEMX`, README, wiki, runbooks | available | — |
| App/runtime | unassigned | `src/`, Firebase client behavior | available | — |
| Security/data | unassigned | rules, auth, secrets, deployment config | available | — |
| Verification | unassigned | tests, lint, typecheck, smoke checks | available | — |

## Mission control packet

Before a lane starts, Agent 0 should define:

- Mission ID
- Wave ID
- Lane owner
- Allowed files and tools
- Start condition
- End condition
- Required evidence
- Timeout or quiet-lane recycle threshold

## Required lane packets

Every lane should emit:

- `start`: scope claimed, first task, expected evidence
- `checkpoint`: progress, changed files, blockers, next smallest step
- `handoff`: ready for integration or review
- `complete`: verified outcome and residual risk
- `archive`: compact summary retained after the wave closes

## Checkpoint protocol

Workers update their row at start, after a meaningful checkpoint, and at
handoff. Use `IN_PROGRESS.md` for details and `DONE.md` for completed outcomes.
Do not claim a lane that overlaps another active owner without coordinator
approval.
