# Cross-Platform Firebase Deployment

Use the same command on macOS and Windows:

```console
npm run deploy -- --target hosting --dry-run
npm run deploy -- --target rules --project your-staging-project
npm run deploy -- --target app --bump patch
```

Supported targets are `all`, `app`, `hosting`, `rules`, and `functions`.
SYSTEMX reads `firebase.json`, constructs an argument array, runs typecheck,
lint, tests, security checks, and a production build, then invokes the pinned
local Firebase CLI.

## Safe sequence

1. Run `npm run wtl:doctor -- --json` and confirm platform/project context.
2. Run `npm run deploy -- --target hosting --preflight`.
3. Run the same target with `--dry-run` against staging.
4. Review Firebase rules, indexes, IAM, billing, and secret-manager bindings.
5. Deploy with an explicit `--project` when more than one project is accessible.
6. Save release and rollback context outside secret-bearing logs.

`--rollback-info` prints the release-inspection path without changing state.
`--open` opens a detected Hosting URL using the operating system's native
browser command.

Firebase documents that deploy dry-runs do not release changes but can still
enable required APIs on the selected project. Always point dry-runs at staging
unless that provider-side effect has been reviewed.

Local developers authenticate interactively. CI must use short-lived OIDC or
Application Default Credentials and least privilege. Legacy Firebase tokens are
not accepted as a deployment standard.
