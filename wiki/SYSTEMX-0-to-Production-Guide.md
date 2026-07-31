# SYSTEMX 0 → Production Guide

This is the single order of operation for converting S.F.W.A. Template into a
real project. It is designed for a human operator, Agent 0, subagents, local
scripts, provider CLIs/SDKs, browser automation, and MCP tools working together.

For the more hands-on staff version with screens, tools, state changes,
evidence, stop rules, and builder use cases, see
[Staff Runbook & Builder Use Cases](SYSTEMX-Staff-Runbook-and-Builder-Use-Cases).

## 0. Frame

Define the business outcome, owner, users, constraints, data classification,
budget boundary, acceptance criteria, and release authority. For a larger task,
Agent 0 opens a mission and assigns bounded lanes; no lane receives implicit
deploy, spending, or secret authority.

## 1. Readiness

~~~bash
npm install
npm run wtl:platform -- --json
npm run wtl:doctor -- --strict=false
npm run wtl:setup -- --check
~~~

Use the one-line installer only after reviewing it. Node 24 is the SYSTEMX
target. Primary lanes are Apple Silicon macOS and Windows 11 x64/ARM64; Ubuntu,
Debian, and WSL2 are documented compatibility lanes.

## 2. Learn before editing

Read root README.md, .SYSTEMX/README.md, AGENTS.md as the discovery stub,
.SYSTEMX/AI/AGENTS.md as the canonical AI map, active status files, then
the narrow relevant code and runbook. Use rg, local scripts, and command output
before asking an LLM to reason broadly about the repository.

## 3. Plan

Complete the numbered intake documents under
.SYSTEMX/Unified-Setup-Process/intake/. Resolve the selected stack and edition,
routes, data, auth, security, integrations, launch criteria, and first wave.
Use a platform-stamped setup packet for secret-free collaboration:

~~~bash
npm run wtl:packet -- export
npm run wtl:packet -- import ./returned-setup-packet.zip
~~~

## 4. Configure

Use ignored local files and provider authentication for Firebase configuration:

~~~bash
npm run wtl:firebase -- login
npm run wtl:firebase -- status
npm run wtl:firebase -- configure --from ./ignored-firebase-config.txt
~~~

Never put real credentials in a prompt, issue, agent bus event, setup packet, or
source-controlled documentation.

## 5. Build with Agent 0

Agent 0 assigns non-overlapping code, docs, browser, security, or release lanes.
Workers report files changed, evidence, checks, blockers, and next action.
SYSTEMX bus traffic is compact and archived at the end of a wave.

~~~bash
npm run wtl:bus -- post --mission launch --wave wave-01 \
  --lane frontend --sender agent-1 --event checkpoint --status in-progress \
  --scope "Build approved routes" --next-action "Run local smoke"
npm run wtl:bus -- summary --mission launch --wave wave-01
~~~

## 6. Prove locally

~~~bash
npm run wtl:local -- start-day
npm run wtl:local -- status
npm run browser:install
npm run browser:codegen
npm run wtl:quality -- --build
npm run wtl:audit
~~~

SYSTEMX selects free loopback ports and records only this repository’s processes.
For Firebase integration work:

~~~bash
npm run wtl:local -- end-day
npm run wtl:local -- start-day --firebase
~~~

Emulator mode dynamically assigns Hosting, UI, Auth, Firestore, and Storage
ports without modifying production firebase.json. The SYSTEMX LAN dashboard
remains local and cannot become a public app route.

## 7. Preflight, deploy, and rollback readiness

~~~bash
git status -sb
npm run ci:all
npm run wtl:deploy -- --preflight
npm run wtl:deploy -- --target hosting --dry-run
~~~

Only after the human confirms the account, Firebase project, branch, target,
cost/compliance impact, rollback path, and local evidence should the operator
run an explicit deploy.

## 8. Handoff and end of day

~~~bash
npm run wtl:sync -- --check
npm run wtl:bus -- archive --mission launch --wave wave-01
npm run wtl:local -- end-day
~~~

Update source docs, status, release notes, and the wiki whenever the public
standard changed. A project is finished when the next operator can reproduce
the local proof and understand its production ownership without hidden chat
context.
