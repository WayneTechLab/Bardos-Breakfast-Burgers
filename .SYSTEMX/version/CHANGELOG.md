# Changelog

All notable deploys are appended here automatically by
`.SYSTEMX/scripts/deploy.sh` (and version bumps by
`.SYSTEMX/scripts/version-bump.sh`).

Format: each deploy adds a timestamped section with the version and the files
that changed in that run.

## 4.1.0 - 2026-07-31

- Moved the canonical AI operating map into `.SYSTEMX/AI/AGENTS.md` so
  `.SYSTEMX` remains the default control root.
- Added `.SYSTEMX/AI/adapters/` with source adapter files and a machine-readable
  manifest for Claude, Gemini, Copilot, Cursor, Windsurf, Cline, Continue,
  Junie, and Amazon Q.
- Converted root `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and vendor rule files
  into compact generated discovery stubs.
- Updated `npm run wtl:sync`, setup-packet metadata, AI standard checks,
  template-structure validation, Standard/Stock MD packets, README, and wiki
  docs for the SYSTEMX-first adapter model.

## 4.0.0 - 2026-07-31

- Promoted `.SYSTEMX/KIT` into the unified source-package catalog for the
  public template.
- Added the **SYSTEMX Standard MD Kit** under `.SYSTEMX/KIT/Standard-MD/` to
  govern Standard MD files, Stock Setup files, intake, master-plan, and packet
  assets without breaking legacy setup paths.
- Added `npm run wtl:kit` for kit listing, Standard MD manifest inspection, and
  copy-order output.
- Added `npm run wtl:slc` and `.SYSTEMX/LAN/Website/slc-sync-bridge.csv` so
  SYSTEMX Local Control can stay aligned with WTL menu commands, state changes,
  evidence, and stop rules.
- Updated README, `.SYSTEMX` docs, wiki source, structure validation, and live
  wiki documentation for the KIT/SLC operating model.

## 3.0.0 - 2026-07-31

- Established the shared `npm run wtl:*` command contract as the documented
  cross-platform SYSTEMX interface; shell, PowerShell, and CMD launchers remain
  compatibility wrappers.
- Added the complete **0 → Finished** operator order covering framing,
  readiness, repository learning, intake, Firebase configuration, bounded agent
  work, local proof, release preflight, handoff, archive, and End of Day.
- Added an LLM interface and tooling routing standard for Agent 0, subagents,
  CLI/SDK, Playwright, Chrome DevTools MCP, and desktop fallback use.
- Added a real cross-platform SYSTEMX test runner and local `ci:all` release
  gate; pinned Playwright in the project and Firebase CLI in SYSTEMX's exact
  on-demand command runner to preserve a clean application dependency audit.
- Expanded Local Session Control: Vite, SYSTEMX LAN, and Firebase emulators use
  owned loopback ports; emulator mode creates a temporary ignored config with
  individually selected free Hosting, UI, Auth, Firestore, and Storage ports.
- Updated README, SYSTEMX runbooks, public wiki guides/sidebar, and structure
  validation around the new operating contract.

## 2.3.0 - 2026-07-31

- Added **WTL Brand Guide Standard Template v1.0** under
  `.SYSTEMX/KIT/Brand/`.
- Added `.SYSTEMX/KIT/Brand/SYSTEMX-KIT-INDEX.md` as the SYSTEMX-facing
  operator and LLM entry point for six-page PDF brand-guidelines production.
- Added the wiki Brand Guide Kit page and linked it from README, wiki home,
  sidebar, and wiki page map.
- Added Brand Kit integrity anchors to the SYSTEMX structure check.
- Preserved the kit source contract, examples, prompt ingest files, page
  prompts, preflight scripts, PDF stitching scripts, and checksum records.

## 2.2.0 - 2026-07-31

- Added **Wayne Tech Lab LLC. Master Production Kit v1.0** under
  `.SYSTEMX/KIT/Production/`.
- Added `.SYSTEMX/KIT/README.md`, `.SYSTEMX/KIT/Production/SYSTEMX-KIT-INDEX.md`,
  and the wiki Production Kit page.
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

- Added Wayne Tech Lab and SYSTEMX visual assets for the public README.
- Reworked the README into a website-style landing page with calls to action,
  beneficiary sections, and flow diagrams.
- Added a dedicated wiki update log so README stays focused on onboarding.
- Linked WayneTechLab.com, SYSTEMX AI standards, Playwright, Chrome DevTools MCP,
  setup, deployment, testing, and security documentation from the landing pages.
- Kept the public template generic and free of private project-specific vendor
  logic.
- Replaced the external router dependency with a lightweight local router and
  refreshed the root and starter lockfiles to zero high/critical audit findings.

## 2.0.0 - 2026-07-31

- Removed runner-based workflow automation from the public template.
- Added the `.SYSTEMX/AI` standard for Agent 0, subagents, MCP/browser tooling,
  connector adapters, and recovery playbooks.
- Added local drift checks for SYSTEMX AI standards.
