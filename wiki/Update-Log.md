# Update Log

This page is the public-facing update log for S.F.W.A. Template. README is the
landing page; release history belongs here and in `.SYSTEMX/version/CHANGELOG.md`.

## 4.1.0 - 2026-07-31

- Moved the canonical AI operating map into `.SYSTEMX/AI/AGENTS.md`.
- Added `.SYSTEMX/AI/adapters/` as the source registry for Claude, Gemini,
  Copilot, Cursor, Windsurf, Cline, Continue, Junie, and Amazon Q instructions.
- Converted root and vendor agent files into compact discovery stubs generated
  by `npm run wtl:sync`.
- Updated CLI packet metadata, Standard/Stock MD setup files, root-folder docs,
  wiki pages, structure validation, tests, and AI standard checks for the
  SYSTEMX-first root cleanup.

## 4.0.0 - 2026-07-31

- Added [Standard MD Kit](Standard-MD-Kit) to document how `.SYSTEMX/KIT`
  governs Standard MD files, Stock Setup files, intake, master-plan, and packet
  assets without breaking legacy setup paths.
- Added `npm run wtl:kit` as the CLI catalog for Production, Brand Guide, and
  Standard MD kits.
- Added `npm run wtl:slc` and the SLC sync bridge CSV so `.SYSTEMX Local
  Control` can map screens to commands, state changes, evidence, and stop rules.
- Synchronized package, starter, lockfile, and SYSTEMX version files as the
  major `v4.0.0` public template release.

## Staff runbook update - 2026-07-31

- Added [Staff Runbook & Builder Use Cases](SYSTEMX-Staff-Runbook-and-Builder-Use-Cases)
  as the practical staff operating guide for screen/tool order, state changes,
  evidence creation, stop rules, Agent 0 routing, builder usage, and handoff.
- Linked the staff runbook from Home, Quick Start, WTL Standard Setup Guide,
  SYSTEMX 0 to Production Guide, and the Wiki sidebar.

## 3.0.0 - 2026-07-31

- Established the public cross-platform `npm run wtl:*` SYSTEMX command
  contract; legacy Bash, PowerShell, and Command Prompt launchers remain
  compatibility paths.
- Added the [SYSTEMX 0 → Production Guide](SYSTEMX-0-to-Production-Guide),
  [SYSTEMX CLI & Tooling Reference](SYSTEMX-CLI-and-Tooling-Reference), and
  [LLM Interface & Tool Routing](SYSTEMX-LLM-Interface-and-Tool-Routing).
- Added a unified process from mission framing through readiness, intake,
  Firebase configuration, bounded Agent 0/subagent work, local proof, deploy
  preflight, handoff, archive, and End of Day.
- Added an actual cross-platform SYSTEMX test runner, a local `ci:all` gate,
  pinned Playwright tooling and exact on-demand Firebase CLI resolution to keep
  the application dependency audit clean, plus documented Playwright and Chrome
  DevTools MCP use.
- Strengthened Local Session Control: local Vite, SYSTEMX LAN, and Firebase
  emulators select free loopback ports without taking another project’s port;
  Firebase emulator port overrides remain temporary and ignored.

## 2.3.0 - 2026-07-31

- Added **WTL Brand Guide Standard Template v1.0** under
  `.SYSTEMX/KIT/Brand/`.
- Added the SYSTEMX-facing Brand Guide Kit index and wiki page.
- Documented the six-page PDF brand-guidelines workflow, prompt-ingest order,
  locked-logo rules, local Python preflight/stitch commands, and LLM entry
  prompt.
- Added Brand Kit anchors to the local structure check.

## 2.2.0 - 2026-07-31

- Added **Wayne Tech Lab LLC. Master Production Kit v1.0** under
  `.SYSTEMX/KIT/Production/`.
- Added `.SYSTEMX/KIT/README.md`, `.SYSTEMX/KIT/Production/SYSTEMX-KIT-INDEX.md`,
  and the wiki [Production Kit](Production-Kit) page.
- Documented dual use: local SYSTEMX production source and standalone GitHub
  folder for LLM/SDK/CLI/MCP/browser-agent consumption.
- Added kit integrity anchors to the SYSTEMX structure check.

## 2.1.1 - 2026-07-31

- Updated the SYSTEMX logo to the exact public product label:
  **S.F.W.A. Template — ".SYSTEMX Forever WebApp" — A Product Provided by Wayne Tech Lab LLC. — Version. Generation 1**.
- Added `docs/assets/systemx-logo.svg` as the deterministic vector master and
  refreshed `docs/assets/systemx-logo.png` as a compatibility render.
- Updated README and wiki home image references, alt text, and product-label copy.

## 2.1.0 - 2026-07-31

- Added Wayne Tech Lab and SYSTEMX visual assets.
- Reworked the README into a public landing page with calls to action, benefit
  sections, and Mermaid diagrams.
- Updated the wiki home page to read like a branded documentation landing page.
- Added this dedicated update log page.
- Linked WayneTechLab.com, SYSTEMX AI standards, Playwright, Chrome DevTools MCP,
  setup, testing, security, deployment, and wiki pages together.
- Kept connector and vendor language generic so private project-specific IP does
  not enter the public template.
- Replaced the external router dependency with a lightweight local router and
  refreshed the root and starter lockfiles to zero high/critical audit findings.

## 2.0.0 - 2026-07-31

- Removed runner-based workflow automation from the base public template.
- Added `.SYSTEMX/AI` as the generic home for Agent 0, subagent lanes, message
  envelopes, browser/MCP tooling, external connector adapters, and recovery
  playbooks.
- Added `npm run ai:standard:check`, `npm run browser:install`,
  `npm run browser:codegen`, and `npm run mcp:chrome`.
- Added the wiki page [Agent Mesh And Tooling Standard](Agent-Mesh-and-Tooling-Standard).
- Published tag `v2.0.0`.

## Log Policy

- Keep this page human-readable and public.
- Put operational detail in `.SYSTEMX/version/CHANGELOG.md`.
- Put deep process documentation in the relevant wiki page.
- Do not store secrets, private customer names, proprietary vendor workflows, or
  paid-service account details in the public update log.
