# SYSTEMX Recovery Playbook

## Purpose

Automation fails in ordinary ways: ports are busy, browser prompts are waiting,
desktop permissions are missing, an apply operation stalls, or a local process
keeps running from another project. This playbook standardizes recovery without
guessing or brute forcing.

## Port Recovery

Before starting a dev session:

1. Detect whether the preferred port is already open.
2. Identify the owning process when the OS allows it.
3. If it belongs to this repo/session, reuse or restart it.
4. If it belongs to another project, choose the next available port.
5. Record the chosen ports in local ignored state.

At end of day:

1. Stop only processes started by this repo/session.
2. Leave unrelated local projects alone.
3. Record what was stopped and what remains open.

## Browser Recovery

Use this order:

1. Reload the local page.
2. Clear only local app state for the current dev origin.
3. Reopen through the SYSTEMX menu.
4. Run Playwright headed reproduction.
5. Inspect with Chrome DevTools MCP.
6. Ask the operator for any account, MFA, paid-service, or permission prompt.

## Desktop Recovery

For macOS and Windows desktop surfaces:

- Check permissions before assuming the app is broken.
- Normalize `PATH` and shell differences for GUI-launched processes.
- Keep app/window discovery bounded by title, bundle ID, or process ID.
- Avoid recursive accessibility dumps; request bounded summaries.
- Prefer local-only diagnostics and screenshots over unattended clicking.

## Apply Or Patch Recovery

When a code apply step fails:

1. Re-read the target file around the intended change.
2. Reduce the patch to the smallest reliable hunk.
3. Avoid rewriting unrelated user edits.
4. If the patch still fails, record the failed intent and produce a manual diff
   summary for Agent 0 review.

## Dead-Letter Entry

Use this shape for unrecovered blockers:

```json
{
  "id": "dlq_20260731_000001",
  "missionId": "mission_systemx_update",
  "lane": "browser",
  "reason": "modal",
  "summary": "Provider auth popup requires operator MFA.",
  "evidence": ["screenshot path or log path"],
  "nextAction": "Operator completes MFA, then rerun browser smoke.",
  "createdAt": "2026-07-31T00:00:00Z"
}
```

Dead letters are not failures to hide. They are how the system remembers why a
lane stopped without wasting future tokens rediscovering the same wall.
