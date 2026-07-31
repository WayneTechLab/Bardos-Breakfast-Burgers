# SYSTEMX WEBPORTAL

SYSTEMX WEBPORTAL defines the local-only control surface for `.SYSTEMX`.
The first implementation is **SYSTEMX LAN**, a plain HTML5 dashboard served by
a loopback-only Node.js server.

## Operating goal

Keep the management screen inside the repository for local development while
mechanically preventing it from becoming part of a customer-facing website or a
Firebase Hosting deployment.

## Directory contract

```text
.SYSTEMX/LAN/Website_Dashboard.html
.SYSTEMX/LAN/Website/
.SYSTEMX/LAN/Temp/
.SYSTEMX/LAN/Backup/
.SYSTEMX/LAN/Files/
```

Responsibilities:

- `Website_Dashboard.html`: tracked local dashboard HTML entry.
- `Website/`: tracked dashboard CSS, JavaScript, components, and assets.
- `Temp/`: ignored runtime files, process notes, temporary previews, exports.
- `Backup/`: ignored local backups created before SYSTEMX writes files.
- `Files/`: ignored operator imports, setup packets, and working documents.

## Hard boundary

SYSTEMX LAN is not a Vite route, Firebase route, or public app page.

It runs at:

```text
http://127.0.0.1:7331/
```

If that port is already occupied, the local runner selects the next open
loopback port and writes the active ports and PIDs to:

```text
.SYSTEMX/LAN/session-current.json
```

It must never be served from:

```text
dist/
public/
src/
firebase.json
```

## Production isolation rules

- Do not import `.SYSTEMX/LAN` from `src/`.
- Do not place LAN assets under `public/`.
- Do not add a Firebase rewrite for the dashboard.
- Do not expose `Temp`, `Backup`, or `Files` through the local server.
- Keep the server bound to `127.0.0.1`.
- Keep production deployment pointed at `dist` only.
- Run `npm run ci:lan-isolation` after production builds.
- Stop only the PIDs recorded in the current SYSTEMX LAN session file.

## Modes

- Observer: read-only status, health, and documentation links.
- Operator: allowlisted SYSTEMX actions with evidence and audit logs.
- Unlocked All: future high-risk local operator mode; requires explicit
  controls, typed confirmations, and no generic shell endpoint.

## Agent and bus integration

The dashboard should visualize Agent 0 missions, waves, lanes, blockers, and
quiet-lane status from the SYSTEMX message bus. It should summarize and archive
old wave traffic to keep active context small.

## Implementation phases

1. Local dashboard shell and isolation guard.
2. Read-only operator status.
3. Allowlisted actions through SYSTEMX CLI and bus.
4. Persistent setup wizard driven by the 20-phase process.
5. Deployment preflight and dry-run controls.

Real production deployment controls should be added only after session
protection, concurrency locking, clean-tree checks, typed project confirmation,
audit logging, cancellation, and public-build leakage tests are complete.
