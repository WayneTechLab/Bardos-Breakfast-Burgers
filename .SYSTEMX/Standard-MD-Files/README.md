# Standard MD Files

This folder is governed by the
[SYSTEMX Standard MD Kit](../KIT/Standard-MD/README.md). Keep this legacy path
in place for setup packet exports, copy-paste workflows, and downstream project
compatibility.

This folder contains the standard Markdown source set used to build SFWA-WTL-G1 setup
packet zips.

Use these files when chat history is unreliable or when a new AI/code tooling
session needs the complete operating context.

## Export For Browser LLM Use

Run:

```console
npm run setup:packet:export
```

SYSTEMX auto-detects macOS, Windows, native Ubuntu, WSL2, Debian, and generic
Linux on x64 or ARM64. It records the platform ID, stack mode, edition, packet
tier, shell, architecture, tooling, agent, and security contracts.

## Copy Order

Copy the files in this order:

1. [`00-COPY-ORDER.md`](./00-COPY-ORDER.md)
2. [`01-LLM-ROLE-AND-RULES.md`](./01-LLM-ROLE-AND-RULES.md)
3. [`02-TEMPLATE-UPDATE-REQUEST.md`](./02-TEMPLATE-UPDATE-REQUEST.md)
4. [`03-SYSTEMX-CONTEXT.md`](./03-SYSTEMX-CONTEXT.md)
5. [`04-EDITION-AND-MODULES.md`](./04-EDITION-AND-MODULES.md)
6. [`05-SECURITY-LOGIN-ACCOUNT-LEVELS.md`](./05-SECURITY-LOGIN-ACCOUNT-LEVELS.md)
7. [`06-SETUP-DEPLOY-QUALITY-GATES.md`](./06-SETUP-DEPLOY-QUALITY-GATES.md)
8. [`07-OUTPUT-CHECKLIST.md`](./07-OUTPUT-CHECKLIST.md)
9. [`08-DESIGN.md`](./08-DESIGN.md)
10. [`09-MEDIA-ASSETS.md`](./09-MEDIA-ASSETS.md)
11. [`10-CONTENT-SEO.md`](./10-CONTENT-SEO.md)
12. [`11-ACCESSIBILITY-UX.md`](./11-ACCESSIBILITY-UX.md)
13. [`12-BRAND-TOKENS.md`](./12-BRAND-TOKENS.md)
14. [`13-PLATFORM-AGENT-TOOLING.md`](./13-PLATFORM-AGENT-TOOLING.md)

For project-specific setup, the packet also includes intake files, master-plan
docs, packet assets, and the reinjection prompt.

## Rules

- Do not paste live secrets into these files.
- Replace placeholder values before asking for project-specific output.
- Keep generated changes generic unless the target is a specific project.
- Ask the LLM to read `.SYSTEMX` first when it has repository access.
- Require checks before accepting an updated version.
