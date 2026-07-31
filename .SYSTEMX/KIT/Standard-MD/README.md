# SYSTEMX Standard MD Kit

The **SYSTEMX Standard MD Kit** makes the Standard Markdown packet system part
of `.SYSTEMX/KIT` without breaking the legacy packet paths used by setup,
exports, prompts, and existing projects.

## Canonical role

`.SYSTEMX/KIT/Standard-MD/` is the kit-level index and manifest for:

- `.SYSTEMX/Standard-MD-Files/`
- `.SYSTEMX/Stock-Setup-Files/`
- `.SYSTEMX/Unified-Setup-Process/intake/`
- `.SYSTEMX/Unified-Setup-Process/master-plan/`
- `.SYSTEMX/Unified-Setup-Process/packet-assets/`

The files above remain where they are because existing commands and copied
setup packets depend on those paths. The kit acts as the unified catalog,
routing map, and LLM entry point.

## Operating rule

Use the kit when an LLM, CLI, SDK, MCP tool, browser session, or staff member
needs the complete standard document context. Use the legacy folders when a
script needs to copy, export, import, or validate the packet contents.

## Recommended command flow

```bash
npm run wtl:kit -- list
npm run wtl:kit -- show standard-md
npm run wtl:kit -- standard-md-order
npm run wtl:packet -- export
```

## LLM starter instruction

```text
Use the SYSTEMX Standard MD Kit at .SYSTEMX/KIT/Standard-MD. Read
SYSTEMX-KIT-INDEX.md and MANIFEST.json first. Then read the canonical
Standard-MD-Files copy order, Stock-Setup-Files compatibility notes, active
Unified-Setup-Process intake files, and packet-assets schema before producing
or updating a setup packet. Do not request or expose secrets.
```

## Safety

- Do not paste secrets into Standard MD, Stock Setup, intake, setup packets, or
  LLM prompts.
- Do not move the legacy folders unless every script, wiki page, and downstream
  project reference is migrated in the same release.
- Treat generated setup packets as shareable only after a human confirms they
  contain no credentials or customer-private material.

