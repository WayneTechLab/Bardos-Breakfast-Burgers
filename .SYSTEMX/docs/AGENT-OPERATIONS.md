# Agent Operations Standard

This template is designed for human developers and coding agents working in the
same repository. `.SYSTEMX` is the shared coordination layer, not a private
agent memory store.

## Required read order

Before editing, an agent should read:

1. `README.md`
2. `.SYSTEMX/README.md`
3. `.SYSTEMX/AI/LLM-INTERFACE-AND-TOOL-ROUTING.md`
4. `.SYSTEMX/Unified-Setup-Process/standards/@@CODER.SatoshiUNO.md`
5. `.SYSTEMX/status/TODO.md`, `.SYSTEMX/status/IN_PROGRESS.md`, and
   `.SYSTEMX/status/AGENTS.md`
5. The relevant setup, security, and deployment docs

For multi-wave or multi-lane work, also read `.SYSTEMX/status/MASTERPLAN.md`.

## Coordination rules

- Inspect `git status` before making changes and preserve unrelated work.
- Claim a lane in `.SYSTEMX/status/AGENTS.md` before a multi-file change.
- Keep ownership disjoint: agents should not edit the same file set concurrently.
- Record active work in `IN_PROGRESS.md`, completed work in `DONE.md`, and
  follow-up work in `TODO.md`.
- Use mission IDs and wave IDs when multiple lanes run in parallel for the same
  objective.
- Re-read status after each major checkpoint; a quiet worker is not assumed
  complete until its lane reports a result.
- Never place credentials, tokens, private customer data, or production exports
  in `.SYSTEMX`, git history, setup packets, or generated reports.
- Run `npm run wtl:sync -- --check`, the relevant quality/security checks, and
  the build before handoff.

## Handoff format

Each worker handoff should state the lane and files changed, current result,
checks run, assumptions or risks, the next smallest actionable step, and the
current mission/wave identifier when one exists.

## Safe parallelism

Good parallel lanes are documentation/setup, UI, Firebase rules/configuration,
and test/verification. Avoid concurrent edits to package manifests, routing,
Firebase configuration, generated files, or shared status boards without a
coordinator checkpoint. The coordinator owns final integration, generated
artifacts, release gates, and the push decision.

## Message bus guidance

Use the local agent message bus for compact checkpoint traffic and archival
summaries only. Do not treat chat persistence as permission to widen scope,
bypass review, or store secrets. Archive aggressively so the live lane state
stays small and replayable:

```bash
npm run wtl:bus -- summary --mission <id> --wave <id>
npm run wtl:bus -- archive --mission <id> --wave <id>
```
