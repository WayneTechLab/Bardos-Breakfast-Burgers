# SYSTEMX Sync and Controlled Updates

This page was previously titled `SYSTEMX-AGI-Sync-and-Controlled-Updates`.
The slug was renamed to reduce confusion around autonomous-AI terminology while
preserving the same governed sync behavior.

`SYSTEMX Sync` is the current name for the governance synchronization path in
SFWA-WTL-G1. It aligns managed operational metadata such as versions and
generated agent adapters. It is not an autonomous artificial general
intelligence, a self-modifying application, or an unattended production
deployment service.

The historical `AGI` label is still accepted as a deprecated compatibility
alias. `npm run wtl:sync`, `npm run sync:system`, and `npm run wtl:agi` all
invoke the same `sync` command today.

Use its check mode before releases:

```bash
npm run sync:system:check
```

The check detects operational drift. A non-check run may update the files it
manages; review and commit those changes like any other source change. Sync
does not approve a deployment, create cloud credentials, bypass branch
protection, or decide whether a production change is safe.

Deployment remains a controlled action through the deploy helper and vendor
authentication. It should require an authorized operator or an approved CI
identity, explicit target selection, quality evidence, monitoring, and a
rollback plan. Future automation should preserve these controls rather than
remove them.

If “self-update” is desired, define it as a reviewed update pipeline: fetch a
known source, verify integrity and compatibility, run tests in a non-production
environment, obtain approval, deploy deliberately, and retain rollback. Never
allow an agent or script to silently upgrade production dependencies or security
policies without evidence and accountable approval.
