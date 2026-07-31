# FAQ

## Is this a starter app or a setup system?

**Both.** The repo root is a runnable React + Firebase app (Step 02 of the
playbook). The `.SYSTEMX/Template/` directory is the full ordered system that
takes you all the way to production. Use the fast start when you just want a
running app; use the playbook when you need provisioning, payments, Functions,
local verification, and monitoring.

## Why does the app run before I add Firebase config?

`src/config/firebase.ts` only calls `initializeApp` when an API key + project ID
are present. Until then, `auth`, `db`, and `storage` are `null` and the app boots
normally (with a dev-only console warning). This lets you develop UI before
provisioning Firebase. See **[Environment Variables](Environment-Variables)**.

## Is the Firebase API key a secret? Should I hide it?

No. A Firebase web API key **identifies** your project; it does not grant
privileged access. It's protected by **Security Rules + App Check**, not by
secrecy. It's expected to ship in the client bundle. Real secrets (payment
provider secret keys, webhook secrets, email API keys) belong on the server. See
**[Security](Security)**.

## How do I start a new project from this?

```bash
gh repo create my-app --template WayneTechLab/Bardos-Breakfast-Burgers --private --clone
```

…or click **“Use this template”** on the repo page. See **[Quick Start](Quick-Start)**.

## How do I deploy?

```bash
npm run build
bash .SYSTEMX/scripts/deploy.sh hosting --dry-run
bash .SYSTEMX/scripts/deploy.sh hosting --project your-firebase-project-id
```

Full details in **[Deployment](Deployment)**.

## Do I have to use payments / Cloud Functions / Sentry?

No — those are **optional modules** toggled during the Interview (Step 01). The
baseline app has none of them; enable only what your project needs.

## Can an AI agent run the playbook?

Yes — that's a first-class mode. Start with `.SYSTEMX`, fill the intake packet
under `.SYSTEMX/Unified-Setup-Process/intake/`, then re-inject
`06-AI-REINJECTION-PROMPT.md`. Use `.SYSTEMX/Template/WEBAPP-STACK-G1.0.md`
and the `steps/` files for detailed gates. See **[Setup Playbook](Setup-Playbook)**.

## What Node version do I need?

Node **≥ 20**, with **22 recommended** (Cloud Functions runtime targets Node 22).

## How do I change the routes/pages?

Add a page component under `src/pages/`, then register it in `src/router.tsx`. All
routes render inside the shared `Layout` (Navbar + Footer). See
**[Project Structure](Project-Structure)**.

## What does "G One Point Zero" mean?

**Generation 1.0.** Bump the generation for a breaking change to the step order or
baseline stack (e.g. swapping the build tool); patch individual step files freely.

## Where's the canonical reference?

[`.SYSTEMX/Template/WEBAPP-STACK-G1.0.md`](https://github.com/WayneTechLab/Bardos-Breakfast-Burgers/blob/main/.SYSTEMX/Template/WEBAPP-STACK-G1.0.md)
is the master playbook. This wiki summarizes and links into it.
