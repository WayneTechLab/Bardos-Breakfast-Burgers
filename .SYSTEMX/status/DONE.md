# DONE — SFWA-WTL-G1

Completed work on the generic template system. Newest first.

## 2026-09-22

- BARDOS-GH-01 (Codex, wave 1): replaced the obsolete concept README with current website/menu branding, a public menu screenshot, restaurant module scope, account levels, emulator setup, verification commands and explicit production limits. SYSTEMX metadata synchronized. Prepared the completed app/backend/brand sources for the user-authorized `origin/main` publication; CI, 67 emulator checks, restaurant workflow UI, 156 responsive UI/UX checks, brand acceptance, both dependency audits, secret/path checks and release preflight passed. Private local handoff files, credentials, emulator exports and runtime evidence are excluded. GitHub ref parity is verified at delivery; no Firebase deployment or wiki publication is part of this packet.

- BARDOS-BRAND-01 (Codex, wave 1): reread the actual GPT design conversation and inspected brand guide v6, menu design system and local mockups. Applied shared red/gold/cream/black tokens, self-hosted Roboto Slab/Montserrat/Source Sans 3, generated paper stock using built-in imagegen, real-text menu layout, matching public pages and restrained operations theming. Approved logo byte identity retained; all 141 variants and 16 categories preserved. Mobile page controls docked away from prices. Brand tests, 156 responsive route checks, automated accessibility scans, CI, SYSTEMX sync and non-deploying preflight passed. Final browser-print menu is five pages. Source, prompt, asset/license paths and limitations: `.SYSTEMX/docs/BARDOS-BRAND-ALIGNMENT.md`. No backend/data mutation, commit, push or deployment in this mission; test-created local support tickets are fixtures.

- BARDOS-UX-01 (Codex, wave 1): public and all 15 operations screens reviewed and refined; customer copy/help, complete searchable/printable menu, responsive staff tables and navigation, accessible forms, offline/error states, dynamic anchors, server-backed menu editing, personal account scoping and unavailable-service gating. Verified 156 responsive route checks, 78 route accessibility scans plus eight dialogs, 67 emulator checks, full restaurant workflow acceptance, CI and deploy preflight. Recovered local Firestore after 512 MiB heap exhaustion using preserved prior export; launcher now uses 2 GiB by default. See `.SYSTEMX/docs/UIUX-ACCEPTANCE.md`. No deployment; production launch gates remain explicit.

- Restaurant local implementation (Codex, wave 1): demo Firebase Auth/Firestore/Functions/Storage, local owner/staff/member fixtures, authenticated server roles, protected business CRUD, menu publication and price control, POS/order/kitchen flows, cash and simulated payments, Stripe Checkout/Billing/webhook/refund integration, CRM, support tickets, inventory, HR records/schedules/clocks, expense ledger, account disabling, audit/history, and public CMS. Verified 64 emulator checks, 23 SYSTEMX tests, 6 business unit tests, desktop/mobile browser acceptance including Google emulator login, clean dependency audits, full CI and deploy preflight. Owner workspace left open at localhost. Real Stripe transactions, production MFA/App Check, physical POS hardware, payroll, and remaining restaurant policies/workflows are not production-accepted; see the restaurant runbook.

- Corner navigation, mission `corner-navigation`, wave 1 (Codex): persistent top-left page sections, top-right site navigation, and bottom-right page controls. Menu exposes all 16 category anchors; other pages derive anchors from headings or explicit section markers. Supports deep links, browser history, reduced motion, focus transfer, Escape, outside-click dismissal, and print hiding. Verified with Playwright at 1440px, 390px, and 320px, retaining all 141 menu rows. Local browser proof: `.SYSTEMX/LAN/Temp/corner-navigation-check.mjs` (ignored). No deployment.

## 2026-07-01

- ✅ **Unified Setup intake packet** — added `.SYSTEMX/Unified-Setup-Process/intake/`
  with ordered project brief, edition/modules, pages/routes, data/auth/security,
  integrations/deploy, and AI reinjection prompt files.
- ✅ **First-time setup pause** — added `.SYSTEMX/scripts/first-time-setup-packet.sh`
  and wired it into `start-production.sh`, `Template/setup.sh`, and `WSG-MENU`.
- ✅ **WSG Level 0-5 working app layer** — added `src/auth/accountLevels.ts`,
  `src/auth/useAccountLevel.ts`, `/login`, standard test identities, and
  account-level checks in `.SYSTEMX/scripts/account-level-check.mjs`.
- ✅ **Unified Login standard** — documented Google/Firebase default,
  Microsoft 365, GoDaddy DNS, Stripe, sender email, and secret-safe handoff.
- ✅ **Audit-clean dependency model** — removed vendored `firebase-tools`; scripts
  use the exact pinned Firebase CLI command through `npx --yes firebase-tools@15.25.1`.
- ✅ **Deploy script expansion** — `.SYSTEMX/scripts/deploy.sh` now supports
  target modes, `--preflight`, `--audit`, `--dry-run`, `--check`,
  `--rollback-info`, `--fast`, and background mode.
- ✅ **Docs alignment** — README, `.SYSTEMX`, template docs, and wiki updated for
  Vite 8, current pages, first-time intake, Level 0-5, Unified Login, deploy
  controls, and zero-warning security/audit gates.

## 2026-06-08

- ✅ **Start Template into Production wizard** — `.SYSTEMX/scripts/start-production.sh`,
  now **menu option #1**. Guided one-time flow: tooling check → identity →
  Firebase/Google config (paste once) → secure `.env` seeding → Prompt Ingest
  `.md` → install/build → deploy → **delete-the-chat security reminder**.
- ✅ **One-time secure env seeding** — `wsg_capture_env_paste` + `wsg_seed_env_files`
  write `.env.local` (client) and `.secrets.env` (server, `chmod 600`), with
  backups; all git-ignored.
- ✅ **Prompt Ingest** — wizard ingests a project build-spec `.md` to
  `PROMPT-INGEST.md` (git-ignored) for the AI agent to build on top of.
- ✅ **`WSG-MENU` terminal command** — `.SYSTEMX/scripts/install-command.sh` adds
  a shell function to `~/.zshrc` / `~/.bashrc` so you can type `WSG-MENU` in any
  terminal (idempotent install/uninstall).
- ✅ **Tooling bootstrap** — `.SYSTEMX/scripts/bootstrap.sh` installs,
  authenticates, and verifies all SDKs + CLIs (Node, Git, gh, gcloud, Firebase,
  optional Stripe) plus app SDKs.
- ✅ **WTL integration** — pulled the generic operational layer out of the WTL
  system into `.SYSTEMX/`: rich submenu `WSG-MENU.sh`, `deploy.sh` (smart Firebase
  targets), focused deploy scripts, `quality-check.sh`, `version-bump.sh`,
  `firebase-setup.sh`, git hooks, and `version/` tracking. Stripped all
  WTL-specific bits (hardcoded project, WTL-AGI, SupportX, admin migration).
- ✅ **WTL folder removed** — `.SYSTEMX/WTL/` deleted after extraction.
- ✅ **WSG-MENU control panel** — one launcher for tooling, Firebase config
  capture (Web/iOS/Android), guided setup, quality, version, Firebase, git, dev.
- ✅ **Firebase project capture** — `Template/lib/firebase-config.sh` lets the
  operator paste per-platform config (Web `firebaseConfig`, iOS
  `GoogleService-Info.plist`, Android `google-services.json`).
- ✅ **Guided playbook** — `Template/` steps 00→12, `setup.sh`, `starter/`.
- ✅ **Docs** — root README, `Template/README.md`, and the GitHub wiki updated.
- ✅ **Git hygiene** — `interview.answers`, `logs/`, `deploy-count.txt`, secrets
  are git-ignored.
