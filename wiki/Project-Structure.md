# Project Structure

The repository serves a **dual role**: the root is a runnable app; `.SYSTEMX/`
holds the full setup playbook.

## Repository root (the runnable starter)

```
.
├── index.html                # Vite entry HTML
├── package.json              # scripts + dependencies
├── package-lock.json
├── vite.config.ts            # Vite + React + Tailwind + @ alias + chunking
├── tsconfig.json             # strict TypeScript config
├── eslint.config.js          # ESLint flat config
├── firebase.json             # Hosting + rules + security headers
├── firestore.rules           # Firestore security rules
├── firestore.indexes.json    # Composite indexes
├── storage.rules             # Storage security rules
├── .firebaserc               # Firebase project alias (set your project id)
├── .env.example              # VITE_FIREBASE_* client config template
├── docs/
│   └── assets/               # public repo landing and wiki images
├── public/
│   ├── robots.txt
│   └── favicon.svg
└── src/
    ├── main.tsx              # entry + local router
    ├── router.tsx            # route table
    ├── index.css             # Tailwind entry
    ├── vite-env.d.ts         # Vite types
    ├── config/
    │   └── firebase.ts       # Firebase client init (lazy/guarded)
    ├── components/
    │   └── layout/
    │       ├── Layout.tsx     # Navbar + page content + Footer
    │       ├── Navbar.tsx
    │       └── Footer.tsx
    └── pages/
        ├── HomePage.tsx
        ├── ServicesPage.tsx
        ├── DocsPage.tsx
        ├── LoginPage.tsx
        ├── AboutPage.tsx
        ├── ContactPage.tsx
        └── NotFoundPage.tsx  # catch-all 404
```

## The playbook (`.SYSTEMX/Template/`)

Generic AI, subagent, browser automation, connector, and recovery standards live
under `.SYSTEMX/AI/`.

```
.SYSTEMX/Template/
├── README.md                     # index + how-to for the template
├── WEBAPP-STACK-G1.0.md          # master playbook: use cases + stack reference
├── setup.sh                      # interactive orchestrator (walks steps in order)
├── steps/
│   ├── 00-prerequisites.md       # install + verify all CLIs
│   ├── 01-project-interview.md   # capture project identity & choices
│   ├── 02-scaffold.md            # TS + React + Vite + Tailwind skeleton
│   ├── 03-firebase-provision.md  # create/convert Firebase project, web config
│   ├── 04-env-and-secrets.md     # .env / secrets wiring
│   ├── 05-stripe.md              # products, prices, webhooks (optional)
│   ├── 06-cloud-functions.md     # Cloud Functions backend
│   ├── 07-security-rules.md      # Firestore / Storage rules + tests
│   ├── 08-mcp-servers.md         # Chrome DevTools MCP (optional)
│   ├── 09-ci-cd.md               # Local verification + deploy flow, repo secrets
│   ├── 10-testing-qa.md          # Vitest + Playwright + a11y/security gates
│   ├── 11-build-deploy.md        # build, deploy, smoke test
│   └── 12-post-launch.md         # monitoring, runbook, backups, cost guardrails
├── templates/
│   ├── env.template              # client VITE_* variables
│   ├── secrets.env.template      # server-side secrets (never commit)
│   └── interview.answers.template # captured answers from step 01 (git-ignored)
└── starter/                      # a self-contained copy of the runnable app
```

## Full project layout (after the complete playbook)

When you run the full playbook, the project grows to include functions, tests,
and scripts:

```
<repo-root>/
├── src/
│   ├── main.tsx / App.tsx
│   ├── config/                 # firebase.ts, seo.ts, navigation.ts
│   ├── components/  hooks/  lib/  pages/  data/  types/  styles/
│   └── __tests__/
├── functions/
│   ├── package.json / tsconfig.json
│   └── src/                     # index.ts, payments, email, scheduled jobs
├── tests/                       # Optional project-specific Playwright specs
├── .SYSTEMX/scripts/            # SYSTEMX deploy, security, seed, and utility helpers
├── .SYSTEMX/AI/                 # Agent 0, adapters, browser/MCP, connectors, recovery
├── .SYSTEMX/KIT/                # Production, Brand Guide, and Standard MD kit catalog
├── vitest.config.ts / vitest.setup.ts
└── playwright.config.ts
```

## The kit catalog (`.SYSTEMX/KIT/`)

`.SYSTEMX/KIT/` is the unified source-package catalog for reusable assets and
setup standards:

| Kit | Path | Role |
| --- | --- | --- |
| Production | `.SYSTEMX/KIT/Production/` | Brand, media, web, mobile, and document production assets. |
| Brand Guide | `.SYSTEMX/KIT/Brand/` | Brand-guidelines prompt, intake, examples, and PDF generation flow. |
| Standard MD | `.SYSTEMX/KIT/Standard-MD/` | Index for Standard MD, Stock Setup, intake, master-plan, and packet assets. |

The Standard MD kit governs the Markdown packet system while preserving the
legacy `.SYSTEMX/Standard-MD-Files/` and `.SYSTEMX/Stock-Setup-Files/` paths.
Use `npm run wtl:kit -- list` to inspect the catalog.

## Key file conventions

- **Path alias:** import from `@/…` (maps to `src/…`) — configured in both
  `tsconfig.json` and `vite.config.ts`.
- **Pages** live in `src/pages/` and are registered in `src/router.tsx`.
- **Layout** wraps all routes via the lightweight local router in `src/router.tsx`.
- **Firebase** is initialized once in `src/config/firebase.ts` and guarded so the
  app boots without credentials.
