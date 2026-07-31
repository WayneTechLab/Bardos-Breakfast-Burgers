# MASTERPLAN — SFWA-WTL-G1

This file is the durable operating map for `.SYSTEMX`. Agent 0 uses it to keep
the wide view of the system, choose the next mission, and decide which work is
safe to parallelize.

## Current status

- Platform support, cross-platform CLI, setup tooling, deployment helpers,
  status boards, and wiki system are live.
- Agent coordination exists today through status files and handoff discipline.
- The missing layer is a local agent message bus and archive loop for long
  running, multi-wave work.

## Agent 0 next mission

Mission name: `SYSTEMX Message Bus and Wave Control`

Objective:
Add a local-first coordination layer so Agent 0 and subagents can exchange
bounded live updates, preserve start/end-of-task checkpoints, and archive old
conversation state into compact records that reduce token drag over time.

## Milestones

### Milestone 1 — Control contract

Outcome: Agent 0, subagents, lanes, waves, and checkpoint rules are defined in
one place and mirrored into the status boards.

Checkpoints:

- Agent 0 has a mission card, lane map, and acceptance criteria.
- Subagents have a required start packet and end packet.
- Start-of-task and end-of-task review rules are explicit.

Tasks:

- Define message schema for `start`, `checkpoint`, `handoff`, `blocked`,
  `complete`, and `archive`.
- Define lane ownership rules and quiet-lane timeout policy.
- Define how Agent 0 closes, re-pings, or reassigns a lane.

### Milestone 2 — Local message bus

Outcome: `.SYSTEMX` has a local append-only bus for coordination traffic with
operator-readable logs and no secret storage.

Checkpoints:

- A local bus file format exists.
- Messages are tagged by run, lane, wave, and sender.
- A reader can reconstruct task progress without replaying every full chat.

Tasks:

- Add a local `bus/` directory design under `.SYSTEMX/state/` or
  `.SYSTEMX/logs/`.
- Store append-only JSONL records for lane traffic.
- Add rotation, redaction, and archive rules.

### Milestone 3 — Wave loop automation

Outcome: Agent 0 can run work in bounded waves and compress old state between
waves.

Checkpoints:

- Every wave starts with a plan, lane claims, and a stop condition.
- Every wave ends with a summary, archive event, and next-wave queue.
- Quiet or drifting lanes are detected and surfaced.

Tasks:

- Add start-wave and end-wave scripts or CLI commands.
- Generate a compact wave summary from bus events and status files.
- Archive stale lane chatter into compact mission snapshots.

### Milestone 4 — Tooling and docs integration

Outcome: the message-bus pattern is reflected in the menu, docs, and agent
instructions.

Checkpoints:

- Menu or CLI exposes a bus/status view.
- root `AGENTS.md`, `.SYSTEMX/AI/AGENTS.md`, `.SYSTEMX` docs, and wiki
  describe the loop.
- Verification covers schema, archiving, and quiet-lane detection.

Tasks:

- Add a `systemx bus` surface for inspect/export/archive.
- Update wiki and agent docs.
- Add tests for schema, retention, and summary generation.

## Wave model

Use waves to keep parallel work bounded.

### Wave start

- Agent 0 sets the mission target and exit condition.
- Agent 0 claims or refreshes lanes in `.SYSTEMX/status/AGENTS.md`.
- Each subagent posts a `start` packet with scope and next smallest action.

### In-wave checkpoints

- Subagents report on every meaningful state change.
- Agent 0 checks integration risk before allowing lane expansion.
- Shared files, manifests, deploy config, generated outputs, and status boards
  require coordinator checkpoints.

### Wave end

- Each lane posts `done`, `partial`, `blocked`, or `needs-review`.
- Agent 0 writes the durable summary into status files.
- Old lane chatter is archived to compact mission records.
- The next wave is either scheduled or the mission is closed.

## Message bus design target

Recommended shape:

- Directory: `.SYSTEMX/state/bus/`
- Active stream: `.SYSTEMX/state/bus/live.jsonl`
- Archived waves: `.SYSTEMX/state/bus/archive/YYYY-MM-DD-wave-NN.jsonl`
- Compact mission summaries: `.SYSTEMX/state/bus/summaries/`

Each message should include:

- `timestamp`
- `runId`
- `missionId`
- `waveId`
- `lane`
- `sender`
- `eventType`
- `status`
- `scope`
- `files`
- `evidence`
- `blockers`
- `nextAction`

## Guardrails

- No secrets, tokens, private prompts, or customer data in bus messages.
- No production authority granted by a bus event alone.
- Agent 0 remains the only release integrator unless the operator explicitly
  delegates that decision.
- Archive aggressively; do not let live bus history become the new token sink.
