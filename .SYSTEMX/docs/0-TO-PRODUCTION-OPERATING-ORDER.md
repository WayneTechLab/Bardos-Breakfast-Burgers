# SYSTEMX 0 → Finished Operating Order

This is the operator path for turning a new S.F.W.A. Template repository into a
maintained Firebase web application. It is deliberately gated: do not skip
forward because an agent, script, or browser session appears confident.

## 0. Frame the mission

Define the problem, owner, users, constraints, budget boundary, data handling,
acceptance criteria, and release authority. For multi-lane work, Agent 0 creates
a mission and wave before assigning work.

```bash
npm run wtl:bus -- post --mission project-launch --wave wave-01 \
  --lane coordinator --sender agent-0 --event start --status planned \
  --scope "Define project outcome and gates" --next-action "Assign bounded lanes"
```

No secret belongs in a bus message, intake packet, issue, prompt, or source
control.

## 1. Establish workstation readiness

Use the platform-aware CLI before changing the project:

```bash
npm install
npm run wtl:platform -- --json
npm run wtl:doctor -- --strict=false
npm run wtl:setup -- --check
```

If tools are missing, use the documented one-line installer or run
`npm run wtl:setup -- --install` only after reviewing the install plan. The
operator signs into GitHub, Google Cloud, and Firebase interactively; the
template never asks an LLM to retain credentials.

## 2. Learn the repository before changing it

Read in this order:

1. `README.md`
2. `.SYSTEMX/README.md`
3. `AGENTS.md`
4. `.SYSTEMX/status/MASTERPLAN.md`, `TODO.md`, `IN_PROGRESS.md`, and `AGENTS.md`
5. the relevant app code, Firebase rules, and runbook

Use targeted `rg` searches and deterministic scripts before broad model
analysis. Preserve unrelated working-tree changes.

## 3. Plan the product and architecture

Complete the intake documents in
`.SYSTEMX/Unified-Setup-Process/intake/` in their numbered order. Resolve
edition, stack, routes, data, authentication, security, integrations, launch
criteria, and first delivery wave. The plan is complete only when it names
evidence that will prove each acceptance criterion.

Use packets when a human or LLM needs a portable, secret-free context bundle:

```bash
npm run wtl:packet -- export --edition enterprise --stack google-firebase
npm run wtl:packet -- import ./received-packet.zip
```

## 4. Configure Firebase and local environment

Create or select the Firebase project deliberately. Store runtime configuration
only in ignored files and secret stores. Do not paste real credentials into an
LLM prompt.

```bash
npm run wtl:firebase -- login
npm run wtl:firebase -- status
npm run wtl:firebase -- configure --from ./ignored-firebase-config.txt
```

Confirm auth providers, authorized domains, Firestore/Storage rules, indexes,
least privilege, MFA expectations, and local emulator policy before feature
work begins.

## 5. Build in controlled lanes

Agent 0 owns integration and publication. Each subagent receives one lane,
files/systems in scope, allowed tools, expected evidence, stop conditions, and
a report-back requirement. Use the bus for compact checkpoints, not chat dumps.

```bash
npm run wtl:bus -- post --mission project-launch --wave wave-01 \
  --lane frontend --sender agent-1 --event checkpoint --status in-progress \
  --scope "Implement approved route plan" --files "src/" \
  --next-action "Run local browser smoke"
npm run wtl:bus -- summary --mission project-launch --wave wave-01
```

Route work in this order: repository docs/scripts → local file search → CLI or
SDK → Playwright → Chrome DevTools MCP → desktop automation. Ask the operator
before a credential, production, paid, destructive, or ambiguous-account action.

## 6. Verify locally

Start only the local processes this repository owns:

```bash
npm run wtl:local -- start-day
npm run wtl:local -- status
npm run browser:install
npm run browser:codegen
npm run wtl:quality -- --build
npm run wtl:audit
```

For Firebase integration checks, replace the Vite session with dynamic-port
emulators:

```bash
npm run wtl:local -- end-day
npm run wtl:local -- start-day --firebase
npm run wtl:local -- status
```

The port allocator binds only to loopback, chooses free ports, and never kills
an unrelated local project. The dashboard is separate from the customer-facing
build; verify it never reaches `dist/`.

## 7. Preflight and release

A deploy is an operator decision, not an Agent 0 or menu decision:

```bash
git status -sb
npm run ci:all
npm run wtl:deploy -- --preflight
npm run wtl:deploy -- --target hosting --dry-run
# after human review of target account, branch, project, and output:
npm run wtl:deploy -- --target hosting --project your-firebase-project-id
```

Record the project ID, target, release version, verification evidence, and
rollback path. Use Firebase Hosting release history/the Firebase console for
rollback information.

## 8. Handoff and end of day

Update durable project truth: source docs, status boards, version/changelog, and
the wiki when the public standard changed. Archive the completed wave to reduce
active context and token cost.

```bash
npm run wtl:sync -- --check
npm run wtl:bus -- archive --mission project-launch --wave wave-01
npm run wtl:local -- end-day
```

A finished project is not merely deployed: its owner can identify the current
state, reproduce local verification, understand the deployment target, and
continue safely without hidden chat history.

