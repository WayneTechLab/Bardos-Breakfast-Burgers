# DONE — SFWA-WTL-G1

Completed work on the generic template system. Newest first.

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
