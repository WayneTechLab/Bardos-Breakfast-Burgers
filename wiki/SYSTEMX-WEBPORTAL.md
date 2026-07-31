# SYSTEMX WEBPORTAL

SYSTEMX WEBPORTAL is the local-only management surface for `.SYSTEMX`. The G1
implementation is named **SYSTEMX LAN** and is intentionally separate from the
public React/Vite/Firebase application.

## Local-only contract

- Source is committed under `.SYSTEMX/LAN`.
- The dashboard starts at `http://127.0.0.1:7331/`.
- If that port is busy, SYSTEMX selects the next open loopback port.
- The server binds only to loopback.
- Vite and Firebase do not serve the dashboard as a public route.
- Production Hosting continues to publish `dist` only.
- CI/build checks fail if LAN files or markers appear in `dist`.

## Directory map

| Path | Purpose |
| --- | --- |
| `.SYSTEMX/LAN/Website_Dashboard.html` | HTML5 dashboard entry |
| `.SYSTEMX/LAN/Website/` | Tracked CSS, JavaScript, components, and assets |
| `.SYSTEMX/LAN/Website/slc-sync-bridge.csv` | UI/CLI sync bridge mapping screens to commands, state changes, evidence, and stop rules |
| `.SYSTEMX/LAN/Temp/` | Ignored temporary runtime output |
| `.SYSTEMX/LAN/Backup/` | Ignored local pre-write backups |
| `.SYSTEMX/LAN/Files/` | Ignored local operator files and imports |
| `.SYSTEMX/LAN/server.mjs` | Loopback-only local server |
| `.SYSTEMX/LAN/runner.mjs` | Sidecar launcher for Vite or Firebase emulators |
| `.SYSTEMX/scripts/assert-lan-isolation.mjs` | Production leakage guard |

## Commands

```bash
npm run dev
npm run dev:public
npm run lan
npm run emulators
npm run emulators:public
npm run wtl:start-day
npm run wtl:end-day
npm run wtl:local -- status
npm run wtl:slc -- status
npm run wtl:slc -- bridge
npm run ci:lan-isolation
```

`npm run dev` starts the public Vite app and SYSTEMX LAN sidecar. `npm run
dev:public` runs only the public app. `npm run lan` starts only the local
dashboard server.

Start-of-day and end-of-day commands use `.SYSTEMX/LAN/session-current.json`.
That file records only ports and PIDs started by this repository, so End of Day
does not close another local project that happens to use the default Vite or LAN
ports.

SLC bridge commands expose the dashboard URL and print the CSV mapping that
keeps local screens, WTL menu commands, KIT routes, evidence, and stop rules in
sync.

## Security rules

- No generic shell endpoint.
- No environment file reader.
- No secret display.
- No `Temp`, `Backup`, or `Files` static serving.
- No `0.0.0.0` binding by default.
- No Firebase rewrite or deployment path for LAN.

## Roadmap

1. Local dashboard shell and isolation guard.
2. Read-only status and health surfaces.
3. Allowlisted SYSTEMX actions.
4. Agent 0 bus visualization.
5. Setup wizard driven by the 20-phase process.
6. Deployment preflight and dry-run controls with high-friction confirmation.
