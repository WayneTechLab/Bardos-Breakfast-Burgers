# How the SYSTEMX Menu Works

SYSTEMX is a shared Node.js control panel for common operator workflows. Run it
from the repository root:

```bash
npm run wtl:menu
```

It groups the system into these operator areas:

| Area | Operator purpose |
| --- | --- |
| Start into Production | Guided setup and optional release |
| Setup & Tooling | Bootstrap, auth, packets, Firebase, hooks |
| Deploy | Preflight and targeted Firebase deployment actions |
| Quality Checks | Type, lint, tests, audit, and security-related checks |
| Version | Version and changelog maintenance |
| Firebase | Login, projects, emulator, indexes, and setup helpers |
| Git | Status, pull, commit, and push helpers |
| Dev & App | Install, development server, build, and preview |
| System | Sync, diagnostics, validation, and security checks |
| Update | Repository update and release-oriented actions |
| Local Session Control | Start Vite or Firebase emulators plus SYSTEMX LAN with automatic port selection; inspect owned ports and PIDs |
| End of Day Local Session | Stop only the PIDs recorded for this repo's local session |
| SYSTEMX KIT Catalog | Show Production, Brand Guide, and Standard MD kit paths, manifests, and command routing |
| SLC .SYSTEMX Local Control | Open or inspect the local-control screen and its UI/CLI bridge CSV |

The menu is a launcher, not an authorization system. Read the command it is
about to execute, verify the active project and account, and do not provide
secrets to a prompt unless you understand where they will be stored. A menu
choice may invoke vendor CLIs that create cost, change cloud resources, or
publish a release.

The CLI detects the active operating system and architecture and exposes native
PowerShell and Windows Command Prompt launchers in addition to shell launchers.
See [Platform Matrix](Platform-Matrix) for supported and experimental lanes.

Local session commands never assume the default ports are free. They probe
loopback, choose open ports when needed, and write the owned process list to
`.SYSTEMX/LAN/session-current.json`. End of Day reads that file and stops only
those recorded PIDs.

Use the non-interactive equivalents when an LLM or runbook needs a deterministic
command:

```bash
npm run wtl:local -- start-day
npm run wtl:local -- start-day --firebase
npm run wtl:local -- status
npm run wtl:local -- end-day
npm run wtl:kit -- list
npm run wtl:slc -- bridge
```

Firebase emulator mode dynamically assigns Hosting, Emulator UI, Auth,
Firestore, and Storage ports through a short-lived ignored configuration file;
production `firebase.json` is not changed.
