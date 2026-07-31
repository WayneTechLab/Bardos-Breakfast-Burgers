# SYSTEMX KIT

`.SYSTEMX/KIT/` stores reusable production-ready kits that can be consumed in
two ways:

1. **As part of this template** — SYSTEMX scripts, docs, setup packets, and LLM
   prompts can reference the kit as a local source of approved brand,
   production, document, web, mobile, and media assets.
2. **As a standalone repo reference** — an LLM, SDK, CLI, or automation process
   can be pointed at the GitHub URL for this folder and instructed to use it as
   the exact source package for generating brand-compliant outputs.

## Kits

| Kit | Path | Purpose |
| --- | --- | --- |
| Production Kit | `.SYSTEMX/KIT/Production/` | Wayne Tech Lab LLC master production kit: brand assets, platform assets, media kit, web app brand component, mobile assets, document templates, manifests, and checksum records. |
| Brand Guide Kit | `.SYSTEMX/KIT/Brand/` | WTL Brand Guide Standard Template v1.0: intake, layout contracts, page prompts, preflight/stitch scripts, examples, and PDF brand-guidelines production flow. |
| Standard MD Kit | `.SYSTEMX/KIT/Standard-MD/` | Unified catalog for Standard MD files, Stock Setup files, intake, master-plan, packet assets, and setup-packet copy order. |

## Unified Standard MD rule

The Standard MD and Stock Setup folders remain in their existing locations for
backward compatibility, but they are now governed as the **Standard MD Kit**.
Use `.SYSTEMX/KIT/Standard-MD/MANIFEST.json` and
`.SYSTEMX/KIT/Standard-MD/SYSTEMX-KIT-INDEX.md` when an operator, LLM, CLI, SDK,
MCP tool, or SLC screen needs to understand the full Markdown setup standard.

```bash
npm run wtl:kit -- list
npm run wtl:kit -- show standard-md
npm run wtl:kit -- standard-md-order
```

## Operating rule

Kits are source packages. Do not casually rewrite, flatten, or “improve” their
contents. Add wrapper docs, indexes, scripts, or integration notes around the
kit when SYSTEMX needs automation, but preserve the kit’s internal source
contract unless a human explicitly approves a kit version update.
