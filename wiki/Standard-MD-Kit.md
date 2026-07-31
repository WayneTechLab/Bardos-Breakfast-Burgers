# SYSTEMX Standard MD Kit

The **SYSTEMX Standard MD Kit** lives in:

```text
.SYSTEMX/KIT/Standard-MD/
```

It makes the Standard Markdown packet system part of the unified SYSTEMX KIT
catalog while preserving the existing source folders that setup scripts and
older projects already use.

## What it unifies

| Source set | Path | Purpose |
| --- | --- | --- |
| Standard packet | `.SYSTEMX/Standard-MD-Files/` | Primary copy-order files for LLM and setup-packet use. |
| Stock setup packet | `.SYSTEMX/Stock-Setup-Files/` | Compatibility baseline for stock/template setup flows. |
| Intake files | `.SYSTEMX/Unified-Setup-Process/intake/` | Project-specific answers and planning inputs. |
| Master plan | `.SYSTEMX/Unified-Setup-Process/master-plan/` | 20-phase process and planning source. |
| Packet assets | `.SYSTEMX/Unified-Setup-Process/packet-assets/` | Schemas, visuals, and prompts used by setup packet tooling. |

## Why the legacy folders remain

The Standard MD and Stock Setup folders are already referenced by setup packet
exports, documentation, LLM prompts, and downstream projects. Moving them would
break existing users. The kit therefore becomes the governing index and routing
layer, while the original folders remain the canonical packet source paths.

## Operator commands

```bash
npm run wtl:kit -- list
npm run wtl:kit -- show standard-md
npm run wtl:kit -- standard-md-order
npm run wtl:packet -- export
```

## LLM usage prompt

```text
Use the SYSTEMX Standard MD Kit at:
https://github.com/WayneTechLab/Bardos-Breakfast-Burgers/tree/main/.SYSTEMX/KIT/Standard-MD

Read SYSTEMX-KIT-INDEX.md and MANIFEST.json first. Then read the Standard MD
copy order, Stock Setup compatibility notes, active intake files, master-plan
documents, and packet-assets schema before producing or updating a setup
packet. Do not request or expose secrets.
```

## SYSTEMX rule

New tooling should ask the KIT catalog where the Standard MD packet lives. Do
not hardcode new assumptions when `npm run wtl:kit -- show standard-md --json`
can return the current paths, command contract, copy order, and security rules.

Generated setup packets are not secret stores. Review them before sharing,
especially when a browser LLM, MCP server, SDK, or external operator receives
the packet.

