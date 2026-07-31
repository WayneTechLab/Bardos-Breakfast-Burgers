# SYSTEMX CLI and Tooling Reference

Use the wtl:* npm scripts as the cross-platform interface. They call the shared
Node.js SYSTEMX CLI and automatically detect macOS, Windows, Linux, or WSL.

| Command | Purpose |
| --- | --- |
| npm run wtl:menu | Interactive lifecycle and local-session menu. |
| npm run wtl:platform -- --json | Show OS, architecture, shell, and support details. |
| npm run wtl:doctor -- --strict=false | Check Node, Git, CLI, SDK, browser, and platform readiness. |
| npm run wtl:setup -- --check | Inspect setup state without changing the machine. |
| npm run wtl:local -- start-day | Start Vite plus local SYSTEMX LAN on selected free loopback ports. |
| npm run wtl:local -- start-day --firebase | Start Firebase emulators plus SYSTEMX LAN on selected free ports. |
| npm run wtl:local -- status | Show only the PIDs/ports owned by this repository session. |
| npm run wtl:local -- end-day | Stop only this session’s recorded processes. |
| npm run wtl:quality -- --build | Typecheck, lint, tests, security checks, and build. |
| npm run wtl:audit | Verify structure, docs links, agent adapters, version drift, and dependencies. |
| npm run wtl:deploy -- --preflight | Check local gates without deploying. |
| npm run wtl:deploy -- --target hosting --dry-run | Validate an explicit Firebase Hosting target. |
| npm run wtl:packet -- export | Create a secret-free, platform-stamped setup packet. |
| npm run wtl:kit -- list | Show Production, Brand Guide, and Standard MD kit catalog entries. |
| npm run wtl:kit -- standard-md-order | Print the Standard MD copy order used by setup packets and LLM handoffs. |
| npm run wtl:slc -- status | Show the `.SYSTEMX Local Control` URL, active session, and bridge CSV path. |
| npm run wtl:slc -- bridge | Print the SLC UI/CLI sync bridge CSV. |
| npm run wtl:sync -- --check | Confirm version and agent-adapter synchronization. |
| npm run wtl:mcp | Generate opt-in Firebase and Chrome DevTools MCP definitions. |
| npm run wtl:bus -- summary … | Read compact mission/wave state. |

## Browser automation

~~~bash
npm install
npm run browser:install
npm run wtl:local -- start-day
npm run browser:codegen
npm run mcp:chrome
~~~

Playwright is the repeatable local-browser lane. Chrome DevTools MCP is the
live-inspection lane. Use both against local or staging targets by default; do
not use them to bypass a real approval, payment, permission, or account prompt.

## LLM and tools

Start with [LLM Interface and Tool Routing](SYSTEMX-LLM-Interface-and-Tool-Routing).
The smart routing order is project docs/scripts, local search, shared CLI,
provider CLI/SDK, Playwright, Chrome DevTools MCP, desktop automation, then
human approval.

Legacy shell, PowerShell, and Command Prompt launchers remain for compatibility,
but wtl:* is the supported documentation and automation contract.
