# Bardo's Breakfast Burgers Wiki Source

These Markdown files are the source for the
[**GitHub Wiki**](https://github.com/WayneTechLab/Bardos-Breakfast-Burgers/wiki).

GitHub wikis are backed by a **separate git repository**
(`WayneTechLab/Bardos-Breakfast-Burgers.wiki.git`). Keeping the pages here, in
the main repo, lets us version and review them alongside the code; they are then
published to the wiki repo.

This project keeps the inherited SYSTEMX operator pages while adding a
restaurant-specific Home page and navigation for Bardo's Breakfast Burgers.

## Pages

| File | Wiki page |
| --- | --- |
| `Home.md` | Landing page |
| `Quick-Start.md` | Quick Start |
| `SYSTEMX-Staff-Runbook-and-Builder-Use-Cases.md` | Staff Runbook & Builder Use Cases |
| `Architecture-and-Stack.md` | Architecture & Stack |
| `Project-Structure.md` | Project Structure |
| `Environment-Variables.md` | Environment Variables |
| `Security.md` | Security |
| `Agent-Mesh-and-Tooling-Standard.md` | Agent Mesh & Tooling Standard |
| `Production-Kit.md` | SYSTEMX Production Kit |
| `Brand-Guide-Kit.md` | SYSTEMX Brand Guide Kit |
| `Standard-MD-Kit.md` | SYSTEMX Standard MD Kit |
| `Setup-Playbook.md` | Setup Playbook + Unified Setup intake |
| `Deployment.md` | Deployment |
| `Testing-and-QA.md` | Testing & QA |
| `Update-Log.md` | Update Log |
| `FAQ.md` | FAQ |
| `_Sidebar.md` | Right-hand navigation |
| `_Footer.md` | Page footer |

## Non-wiki `.SYSTEMX` references

These are intentionally kept in `.SYSTEMX` instead of duplicated into wiki pages:

- `.SYSTEMX/Unified-Setup-Process/README.md`
- `.SYSTEMX/Unified-Setup-Process/intake/`
- `.SYSTEMX/Unified-Setup-Process/standards/WSG-Account-Levels.md`
- `.SYSTEMX/Unified-Setup-Process/standards/Unified-Login.md`
- `.SYSTEMX/AI/`
- `.SYSTEMX/scripts/deploy.sh`

## Publishing to the GitHub Wiki

> The wiki must be enabled once: repo **Settings → Features → Wikis**, then create
> the first page in the UI so the `.wiki.git` repo exists.

```bash
# From the repo root:
git clone https://github.com/WayneTechLab/Bardos-Breakfast-Burgers.wiki.git /tmp/bardos-breakfast-burgers-wiki
cp wiki/*.md /tmp/bardos-breakfast-burgers-wiki/
cd /tmp/bardos-breakfast-burgers-wiki
git add -A
git commit -m "docs: sync wiki from main repo"
git push
```

After the first publish, re-run the `cp` + commit + push whenever these files
change.
