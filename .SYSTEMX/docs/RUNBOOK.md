# SFWA-WTL-G1 Runbook

This runbook is the operator checklist for projects created from the template.
Keep project-specific incident details in the downstream app, not in this base
template.

## Start of day

- Start a repository-owned local session: `npm run wtl:local -- start-day`.
- Inspect the selected ports and PIDs: `npm run wtl:local -- status`.
- Run `npm run wtl:sync -- --check` before deploys.
- Run `npm run wtl:quality -- --build` before merging release work.
- Run `npm run ci:security` when Firebase rules, environment wiring, or
  deployment settings change.
- Confirm `.env.local` and `.secrets.env` are present only on trusted machines.

## Deploy

1. Confirm the working tree is intentional with `git status`.
2. Run `npm run wtl:deploy -- --preflight`.
3. Run `npm run wtl:deploy -- --target hosting --project <project-id>`.
4. Verify the Firebase Hosting URL and any configured smoke checks.
5. Record follow-up work in `.SYSTEMX/status/TODO.md`.

## Incident Response

- Roll back Hosting from the Firebase console or redeploy the last known good
  commit.
- Revoke exposed API keys or tokens immediately.
- Rotate `.secrets.env` values and any matching hosted secrets.
- Keep the public issue tracker free of secret values and exploit details.

## End of day

```bash
npm run wtl:bus -- summary --mission <id> --wave <id>
npm run wtl:bus -- archive --mission <id> --wave <id>
npm run wtl:local -- end-day
```

SYSTEMX stops only the processes recorded for this repository. Do not use broad
process-kill commands to clean up a local session.

## Recovery

- Re-run `npm run wtl:setup -- --check`.
- Re-run `npm ci` if dependency state is suspect.
- Re-run `npm run wtl:sync` to restore managed `.SYSTEMX` surfaces.
