# SYSTEMX AI Adapter Registry

This folder is the canonical source for AI/coding-agent adapter instructions.

Root/vendor files such as `AGENTS.md`, `CLAUDE.md`,
`.github/copilot-instructions.md`, and `.amazonq/rules/systemx.md` are
small discovery stubs generated from `.SYSTEMX/lib/agent-adapters.mjs`.

Edit this SYSTEMX-owned source layer first, then run:

```console
npm run wtl:sync
npm run sync:system:check
```

Do not hand-edit generated root stubs unless you are also updating the generator.
