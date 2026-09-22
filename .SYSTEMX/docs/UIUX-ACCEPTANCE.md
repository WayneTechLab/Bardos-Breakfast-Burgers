# Bardo's UI/UX Acceptance

Date: 2026-09-22. Mission: BARDOS-UX-01, wave 1.

## Result

Local UI/UX acceptance passed. This is not authorization to deploy or a claim
that the restaurant's external services and operational policies are ready.
No Git commit, push, or deployment was performed.

The subsequent BARDOS-BRAND-01 pass supersedes the initial visual theme with the
actual GPT menu references and brand guide v6. See
[Brand Alignment](BARDOS-BRAND-ALIGNMENT.md) for source authority, artwork,
typography, unchanged-logo verification and the refreshed five-page print sample.

## Coverage

- Public: Home, About, Full Menu, Ordering & Help, Contact, Sign In, Order Online,
  My Account, guest access gates, and not-found routes.
- Operations: Overview, POS, Orders, Kitchen, Menu, Customers, Tickets,
  Inventory, Staff & HR, Schedule, Time Clock, Billing & Expenses, Website CMS,
  Account Access, and Audit Log.
- Guest, member, employee and owner UI states: 39 route/role combinations at
  1440, 768, 390 and 320 pixels, totaling 156 responsive route checks.
- Automated WCAG 2 A/AA and WCAG 2.1 AA scans: 78 desktop/mobile route scans
  plus all eight record editors. No reported violations or browser exceptions.
- Menu source parity: all 141 active SKU/variant rows remain present. Search,
  all-item print visibility, category jumping, cross-page hash links, corner
  navigation, Escape focus restoration, mobile workspace switching and offline
  recovery passed. The browser print sample is five Letter pages.
- Functional browser acceptance: email and mock Google sign-in, role bypass
  denial, POS simulation through kitchen completion, CRM create, live menu
  price edits and restoration, customer isolation, tickets and contact requests.
- Backend: 67 emulator checks passed, including role enforcement, own-account
  scoping for owners, server prices, concurrent idempotency, delivery rejection,
  CRUD, clock, rules denial and signed/replayed/mismatched Stripe fixtures.
- CI: lint, TypeScript, 23 SYSTEMX tests, six domain tests, static security/MFA
  gates, system audit, production build, dependency audits and deploy preflight.
  SYSTEMX sync check and Git whitespace check passed.
- A production-bundle smoke check rendered the public menu and unavailable-auth
  states without browser exceptions. It did not connect to a real project.

## Changes

Replaced public scaffold copy and internal documentation links with restaurant
content and customer help. Removed the unverified email address, hours and
provenance claims. Public pages no longer show SKUs or approval-workflow badges;
unapproved generated descriptions are withheld without removing menu items.

Added menu search and category selection while retaining the shared print
design. Improved page titles, keyboard focus, dynamic anchor discovery,
deep-link stability, form status messages, password visibility, offline notice,
error recovery, account rechecking, empty states and mobile navigation.

Operations tables retain readable column widths on small screens and scroll
inside their own region. Inventory thresholds render as numbers. Account
access controls stay with their row. Record dialogs protect unsaved changes
and disable edits during saves. Menu editing waits for a server-backed snapshot.
POS uses consistent category ordering, rejects incomplete delivery workflows,
and clearly gates unavailable ordering, card payments and paid memberships.
Personal account pages do not expose restaurant-wide records to an owner.

## Local Runtime Recovery

The previous 512 MiB Firestore emulator heap exhausted memory after repeated
test runs. Shutdown export could not finish. The pre-existing 09:45 local
export was preserved under `.emulator-data/restaurant-pre-uiux-restart-20260922`
and reimported; later test-only records from the failed session were not retained.
The launcher now defaults to a 2 GiB heap and checks HTTP responsiveness.

An explicit `not_configured` Stripe secret sentinel avoids a Cloud Secret
Manager lookup for an empty local secret. It cannot enable card payments.
The restarted app uses Auth 9099, Firestore 8081, Functions 5001, Storage 9199,
Emulator UI 4000 and Vite 5173. Always recheck live ports before reuse.

## Evidence And Reproduction

Run `npm run test:uiux` with the local app and emulators running. Evidence is
stored locally under `.SYSTEMX/LAN/Temp/uiux/`: `report.json`, desktop/mobile
screenshots and `full-menu.pdf`. Run mutating suites sequentially. See
[Restaurant Operations](RESTAURANT-OPERATIONS.md) for setup and commands.

## Launch Gates

Confirm venue contact details and opening hours, final menu descriptions and
food advisories, tax/refund/fulfillment policies and privacy/retention terms.
Configure the real Firebase project, providers, verified email flow, App Check,
staff MFA and owner provisioning. Configure and test actual Stripe sandbox
Checkout, refunds, subscriptions, portal and reconciliation before live mode.
Complete manual assistive-technology and real-device acceptance; automated
scans do not certify accessibility. Receipt hardware, payroll, recipe inventory
and accounting integrations remain outside the implemented workflows, as
recorded in the restaurant runbook. Spreadsheet sync remains unimplemented.
