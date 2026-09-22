# Bardo's Restaurant Operations

## Local Development

Use Node 24 for the app tooling and Node 22 for deployed Functions. The emulator
uses the host's Node executable; the current workstation has Node 25.8.1.
Java 21 is required for the Firestore and Storage emulators.
The local launcher defaults to a 2 GiB Java heap for repeated browser and
emulator acceptance runs. An explicit `JAVA_TOOL_OPTIONS` overrides this.
The status command checks HTTP responsiveness as well as the launcher PID.

```sh
npm ci
npm ci --prefix functions
npm run local:firebase
npm run local:seed
npm run wtl:local -- start-day
```

The isolated project is `demo-bardos-local`. The launcher chooses available
loopback ports and writes them to ignored `.env.development.local` and
`.SYSTEMX/LAN/Temp/restaurant-emulators.json`. The Vite client connects to these
services only in a development build with `VITE_USE_EMULATORS=true`.

Default URLs: app `http://127.0.0.1:5173/login`, workspace `/manage`, emulator UI
`http://127.0.0.1:4000`. Check actual ports with `npm run local:firebase:status`
and `npm run wtl:local -- status`.

Local test password for every seeded account: `BardosLocal!2026`.
These are public development fixtures, never production credentials.

| Account | Level | Access |
| --- | --- | --- |
| Signed out | 0 | Public menu/content |
| member@bardos.local | 1 | Own orders and tickets |
| pro@bardos.local | 2 | Member access with Pro entitlement |
| diamond@bardos.local | 3 | Member access with Diamond entitlement |
| staff@bardos.local | 4 | POS, kitchen, menu, CRM, tickets, inventory, schedule, own time entries |
| owner@bardos.local | 5 | Staff access plus HR, expenses, all time entries, access administration, audit |

Pro and Diamond are entitlement levels. Specific discounts/rewards benefits are
not invented or enabled. Owner-assigned levels support local testing; paid
subscription changes use signed Stripe events when real price IDs are configured.
Google sign-in opens Firebase's mock identity-provider popup in local mode.

The seed creates 141 menu SKU/variant rows and fictional business records.
Re-seeding preserves existing menu edits and business records, but restores
the five local fixture account roles. It never targets a live project.

Stop with `npm run local:firebase:stop`. The emulator exports data to ignored
`.emulator-data/restaurant` and imports it on the next start. Wait for shutdown
and export completion before restarting. Stop the separate app server with
`npm run wtl:local -- end-day`.

## Working Features

- `/manage/pos`: source menu, category/search, basket quantities, dine-in/takeaway,
  order notes, pay later, cash received, local simulation, Stripe Checkout.
- `/manage/orders` and `/manage/kitchen`: new, preparing, ready, completed and
  cancellation rules; outstanding cash payment; owner refunds; print view.
- `/manage/menu`: create/edit items, exact cent prices, publish/unpublish,
  availability, conflict protection, CSV export. Public menu listens to Firestore.
- `/manage/customers`, `/manage/tickets`, `/manage/inventory`: persistent CRM,
  ticket status/priority, stock counts and reorder thresholds.
- `/manage/employees`, `/manage/shifts`, `/manage/timeEntries`: private employee
  records and rates, schedules, server-timestamped clock-in/out, raw hour exports.
- `/manage/expenses`: vendor bills, categories, due dates, pending/paid records.
- `/manage/content`: published text content appears on the homepage; no raw HTML.
- `/manage/roles`, `/manage/audit`: owner role assignment, disabling accounts,
  immutable backend audit entries. Owners cannot demote/disable themselves.
- `/account`, `/order`, `/contact`: private customer history, support requests,
  authenticated checkout, and subscription/customer-portal integration.

Private records are served by the authenticated `business` callable. Direct
Firestore client writes and all Storage access are denied. Public reads are
limited to active menu items and published content. Audit/history contain no
passwords, card details, or authentication tokens.

## Stripe Test Setup

The official Stripe Node SDK is installed in `functions`. There is no card-data
form in the app. A placeholder API key cannot create a real Checkout Session.
Without a sandbox key, staff can exercise a clearly marked local simulated
payment; it never appears in paid-sales totals or contacts Stripe.

The local launcher creates ignored `functions/.secret.local` with
`STRIPE_SECRET_KEY=not_configured` and a fixture-only webhook signing secret.
The nonempty sentinel prevents the emulator from trying Cloud Secret Manager;
it is not recognized as a configured Stripe key. Replace those
values with a restricted sandbox key and the signing secret supplied by the
Stripe CLI for actual sandbox testing. Never place a Stripe secret in `src/`.

Forward sandbox events with Stripe CLI to the current local Functions URL:

```sh
stripe listen --forward-to http://127.0.0.1:5001/demo-bardos-local/us-central1/stripeWebhook
```

Server configuration is described in `functions/.env.example`. Set `APP_ORIGIN`
to the app's actual origin. Subscription checkout requires distinct configured
`STRIPE_PRO_PRICE_ID` and `STRIPE_DIAMOND_PRICE_ID` values and a configured
Stripe Customer Portal. Order prices always come from the server menu.

Order payment is confirmed only by a signature-verified webhook with matching
order reference, currency, and total. Event replay is idempotent. Subscription
events fetch current Stripe state before changing an entitlement. Refunds use
idempotency keys. A successful browser return URL cannot mark an order paid.

## Verification

```sh
npm run ci:all
npm run test:emulators
npm run test:restaurant-ui
npm run test:uiux
npm audit --prefix functions
npm run wtl:sync -- --check
```

Backend tests cover server pricing, input validation, role denial, record
isolation, concurrent order deduplication, order transitions, cash/refunds,
business CRUD, clocks, Firestore rules, and signed/replayed/mismatched webhook
fixtures. Browser tests cover login, bypass rejection, POS fulfilment, module
access, menu-to-public persistence, CRM, customer tickets and mobile overflow.
Stripe fixtures do not prove actual sandbox card processing or Terminal hardware.

The UI/UX suite scans public and all 15 operations modules at 1440, 768, 390,
and 320 pixels. It runs automated WCAG A/AA checks at desktop and mobile sizes,
checks all eight record editors, the complete source SKU set, print output,
corner navigation, deep links, offline recovery and contact-ticket persistence.
Screenshots, a PDF print sample and the JSON report are local-only under
`.SYSTEMX/LAN/Temp/uiux/`. Automated accessibility checks do not replace manual
assistive-technology acceptance. Run data-mutating suites sequentially, because
the workflow and emulator tests temporarily edit the same menu fixture.

Customer pages no longer show internal SKU or description-approval metadata.
Unapproved generated descriptions are withheld while all menu names, variants,
and prices remain present. Source descriptions and staff-authored replacements
are displayed. `/docs` is now customer ordering/help; operator documentation
remains in this repository. Unconfirmed venue details are not fabricated.
Delivery is rejected by the server until an address and fulfillment workflow
exists. Personal account views are scoped to the signed-in user even for owners.

## Production Release Requirements

This is a tested local operations implementation, not a completed production
restaurant rollout. Do not import emulator credentials or synthetic records.

1. Select and configure the real Firebase project; enable email/password and
   Google providers, authorized domains, email verification and recovery sender.
2. Enable Identity Platform TOTP MFA and enroll staff/owners. The app contains
   enrollment and sign-in challenge flows; privileged backend access requires
   MFA outside the demo project. Validate these flows on staging.
3. Configure App Check and `VITE_RECAPTCHA_SITE_KEY`. Callable App Check is
   enforced outside the emulator. Provision the first owner through a trusted
   Admin SDK process; never grant roles from browser input or email matching.
4. Store Stripe secrets in Secret Manager; configure test price IDs, Customer
   Portal and webhook endpoint; test successful/declined/asynchronous payments,
   expiry, refunds, subscriptions, and reconciliation against the Stripe sandbox.
5. Confirm actual venue address, hours, contact details, menu approval, taxes,
   fulfillment rules, refund policy, tip handling and delivery rules. Current
   order tax is zero and automated tax collection is not enabled. Stripe Tax
   requires an applicable registration and configuration before use.
6. Set `CHECKOUT_ENABLED=true` only after checkout acceptance. It defaults closed
   in production. Confirm inventory recipes/modifiers, payroll/time policies,
   export requirements, and kitchen/printer workflow before operating a shift.
7. Configure backups/restore, logging/alerts, retention, performance
   and accessibility acceptance; load-test expected restaurant volume.
8. Run release checks and staging acceptance before an explicitly authorized
   deployment. The existing `.firebaserc` production project is still a placeholder.

## Explicit Limits

- POS uses hosted Stripe Checkout, not Stripe Terminal/card-present reader
  integration. Receipt printers, cash drawers, and offline operation are not built.
- Inventory is a stock ledger with saved history; recipe consumption, purchase
  ordering, menu modifier pricing and supplier fulfillment need further work.
- HR stores employee details, rates, schedules and time entries. It does not
  process payroll, taxes, benefits, overtime or employment documents.
- Expenses are an operational ledger, not a general ledger/accounting integration.
- Workspace reads are paged in batches of 500, with a Load more control. Dashboard
  totals and exports cover loaded records, not accounting-grade aggregate reports.
- Production requests are limited to 120 per authenticated user per minute;
  validate this policy and capacity with expected shift volume.
- Live payment, TOTP, App Check, subscription lifecycle and email deliverability
  require configured external services and staging tests. No live test is claimed.
- Spreadsheet/Drive synchronization remains unimplemented as previously requested.
