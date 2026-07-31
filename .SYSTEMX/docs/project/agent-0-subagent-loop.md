# Agent 0 and Subagent Operating Loop

This is the reusable coordination contract for human and AI work in the
template. Agent 0 is the coordinator. Subagents are bounded workers or
explorers: each owns one lane, reports evidence back, and receives a next task
only after the coordinator records the result.

## Source of truth

- Mission map: `.SYSTEMX/status/MASTERPLAN.md`
- Roster and heartbeat: `.SYSTEMX/status/AGENTS.md`
- Active work: `.SYSTEMX/status/IN_PROGRESS.md`
- Queue: `.SYSTEMX/status/TODO.md`
- Completed work: `.SYSTEMX/status/DONE.md`
- Release and deployment notes: `.SYSTEMX/docs/` and `.SYSTEMX/version/`

## Required report-back packet

Every subagent report to Agent 0 must include:

- Status: `done`, `partial`, `blocked`, or `needs-review`
- Lane and exact scope owned
- Exact changed files, or `none`
- Evidence: commands, tests, files, logs, or inspected sources
- Blockers, or `none`
- Next smallest executable action
- Mission ID and wave ID when part of multi-lane work

Subagents multiply token and tool usage. Use them for bounded work that
benefits from parallel investigation; do not spawn them for trivial edits.

## Loop

1. Agent 0 assigns one bounded lane with an explicit read/write scope.
2. The subagent inspects current state and preserves unrelated changes.
3. The subagent works only within its lane and reports after each task,
   checkpoint, blocker, or handoff.
4. Agent 0 records the result in the roster and mirrors durable status into the
   status boards and relevant documentation.
5. Agent 0 closes the lane, re-pings it with a narrower action, or reassigns it.

## Wave discipline

Run larger missions in waves so the coordinator can keep the wide view while
workers stay bounded.

### Start of wave

1. Agent 0 records the mission and active wave in `MASTERPLAN.md`.
2. Agent 0 assigns lanes with explicit scope, evidence, and stop conditions.
3. Each worker posts a `start` packet before meaningful edits.

### During the wave

1. Workers report at every meaningful checkpoint, blocker, or handoff.
2. Agent 0 reviews shared-surface risk before expanding or overlapping lanes.
3. Quiet lanes are re-pinged, narrowed, or recycled.

### End of wave

1. Every lane closes as `done`, `partial`, `blocked`, or `needs-review`.
2. Agent 0 writes durable outcomes into status files and runbooks.
3. The coordination trail is archived into compact summaries so old chatter
   does not dominate later context windows.

## Safe parallelism

Prefer disjoint lanes such as setup/docs, UI, Firebase rules/configuration, and
verification. Do not concurrently edit manifests, routing, generated files,
deployment configuration, or shared status boards without a coordinator
checkpoint. No worker may revert another worker’s changes.

## Quiet lane policy

A lane is quiet when it stops without a report-back, finishes without a next
action, or fails to answer its assignment. Agent 0 must re-ping it with a
narrower task, record the condition, and recycle or reassign it if it remains
quiet. A quiet lane is never treated as complete without evidence.

## Message bus target

For longer running missions, add a local-first agent message bus so status
traffic lives outside ephemeral chat windows.

Recommended design:

- Append-only JSONL records on disk
- One live stream for active waves
- Archived wave files after closure
- Compact mission summaries for replay

The bus is a coordination layer, not a source of authority. A bus event may
describe a deploy recommendation or review result, but Agent 0 or the human
operator still owns the release decision.

## Completion rule

The goal is complete only when every explicit requirement has direct evidence:
tests, logs, current files, generated artifacts, or a verified runtime check.
