# S.F.W.A. Template — Starter Runtime

A fast, opinionated **TypeScript + React + Vite + Tailwind + Firebase** starter
template. Use it to spin up a new production-ready web app in minutes.

> This repository is a **GitHub template**. Click **“Use this template”** (or
> `gh repo create <name> --template WayneTechLab/SFWA-WTL-TEMPLATE`) to start a new
> project from it.

## What's inside

- ⚛️ **React 19** + **TypeScript** (strict) + **Vite 8**
- 🎨 **Tailwind CSS 4** with light/dark support
- 🧭 Lightweight local client router with a shared layout (Navbar + Footer)
- 🔥 **Firebase** client config (Auth, Firestore, Storage) — boots even before
  you add credentials
- 🛡️ Deploy-ready **Firebase Hosting** config with security headers + rules
- ✅ **ESLint** flat config + local verification scripts (lint, typecheck, build)
- 📄 Base pages: **Home**, **About**, **Services**, **Docs**, **Login**, **Contact**, **404**

## Quick start

```bash
# 1. Create your project from this template (UI button or CLI):
gh repo create my-app --template WayneTechLab/SFWA-WTL-TEMPLATE --private --clone
cd my-app

# 2. Install + run the standalone starter
npm install
npm run dev          # http://localhost:5173

# 3. Add Firebase config
cp .env.example .env.local
#   fill VITE_FIREBASE_* from your Firebase project's web app config
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | TypeScript checks |
| `npm run lint` | ESLint |

## Project structure

```
src/
├── main.tsx                 # entry + local router
├── router.tsx               # routes
├── index.css                # Tailwind entry
├── config/firebase.ts       # Firebase client init (lazy/guarded)
├── components/layout/        # Layout, Navbar, Footer
└── pages/                    # Home, About, Services, Docs, Login, Contact, NotFound
```

## Deploy to Firebase Hosting

```bash
# one-time:
npx --yes firebase-tools login
npx --yes firebase-tools use --add
# update .firebaserc default to your project id

npm run build
npx --yes firebase-tools deploy --only hosting,firestore:rules,storage:rules
```

## SYSTEMX parent template

This folder is a lightweight runtime snapshot. The full **S.F.W.A. Template —
.SYSTEMX Forever WebApp** lifecycle, cross-platform CLI, local port-safe
sessions, Firebase process, agent standards, kits, and operator guides live in
the parent repository. Start there with `npm run wtl:menu` and the root README.

---

Provided by Wayne Tech Lab LLC. Review, secure, test, and operate your own
project before production use.
