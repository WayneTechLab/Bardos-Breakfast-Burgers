# SYSTEMX Standard MD Kit Index

Canonical local path:

```text
.SYSTEMX/KIT/Standard-MD/
```

Canonical GitHub path:

```text
https://github.com/WayneTechLab/SFWA-WTL-TEMPLATE/tree/main/.SYSTEMX/KIT/Standard-MD
```

## Purpose

The Standard MD Kit unifies the reusable Markdown operating standard with the
rest of `.SYSTEMX/KIT`. It does not replace the existing packet source folders;
it indexes and governs them.

## Canonical source sets

| Source set | Path | Purpose |
| --- | --- | --- |
| Standard packet | `.SYSTEMX/Standard-MD-Files/` | Primary copy-order files for LLM and setup-packet use. |
| Stock setup packet | `.SYSTEMX/Stock-Setup-Files/` | Compatibility baseline for stock/template setup flows. |
| Intake files | `.SYSTEMX/Unified-Setup-Process/intake/` | Project-specific answers and planning inputs. |
| Master plan | `.SYSTEMX/Unified-Setup-Process/master-plan/` | 20-phase process and planning source. |
| Packet assets | `.SYSTEMX/Unified-Setup-Process/packet-assets/` | Schemas, prompts, and visuals used by setup packet tooling. |

## Copy order

The current Standard MD order is:

1. `00-COPY-ORDER.md`
2. `01-LLM-ROLE-AND-RULES.md`
3. `02-TEMPLATE-UPDATE-REQUEST.md`
4. `03-SYSTEMX-CONTEXT.md`
5. `04-EDITION-AND-MODULES.md`
6. `05-SECURITY-LOGIN-ACCOUNT-LEVELS.md`
7. `06-SETUP-DEPLOY-QUALITY-GATES.md`
8. `07-OUTPUT-CHECKLIST.md`
9. `08-DESIGN.md`
10. `09-MEDIA-ASSETS.md`
11. `10-CONTENT-SEO.md`
12. `11-ACCESSIBILITY-UX.md`
13. `12-BRAND-TOKENS.md`
14. `13-PLATFORM-AGENT-TOOLING.md`

## SYSTEMX integration

- `npm run wtl:kit -- list` shows every registered kit.
- `npm run wtl:kit -- show standard-md` prints this kit manifest.
- `npm run wtl:kit -- standard-md-order` prints the Standard MD copy order.
- `npm run wtl:packet -- export` still creates the platform-stamped setup zip
  from the canonical source folders.
- SLC and future local UIs should read `MANIFEST.json` or the CLI output instead
  of hardcoding folder assumptions.

