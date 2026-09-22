# Step 04 - Environment and Secrets

Use the public web configuration from [Firebase provisioning](./03-firebase-provision.md)
to populate the root `.env.local` from `.env.example`. Firebase browser configuration
identifies the project; authentication, server authorization, and database rules
protect its data. Do not place service account credentials or provider secret keys
in any `VITE_` variable.

Store backend credentials in Firebase Secret Manager and bind them explicitly to
the Functions that need them. Keep local emulator overrides in ignored files.
Never copy local test identities or emulator export data into production.

For Bardo's restaurant, use the [restaurant runbook](../../docs/RESTAURANT-OPERATIONS.md)
for the isolated emulator project, local account credentials, server settings,
Stripe bindings, and release requirements.

Validate configuration with `npm run wtl:doctor -- --strict=false`, run the relevant
emulator tests, and run `npm run ci:all`. A successful local test does not configure
a production project or authorize a deployment.

Continue to [Step 05 - Stripe](./05-stripe.md) when payment integration is required.
