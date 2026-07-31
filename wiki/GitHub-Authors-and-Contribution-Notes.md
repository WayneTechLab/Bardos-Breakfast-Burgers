# GitHub Authors and Contribution Notes

This page explains how to follow the public template, how to contribute
cleanly, and how authors should keep the repository aligned with the live
`main` branch.

## Public GitHub contributors

As verified on July 17, 2026, the public contributor list for
`WayneTechLab/Bardos-Breakfast-Burgers` includes:

- [`@WayneTechLab`](https://github.com/WayneTechLab)
- [`@Quigles1337`](https://github.com/Quigles1337)

This list can change over time. Check the repository contributors page for the
latest public GitHub-visible author set.

## Follow and watch

- Follow the repository owner if you want upstream template changes:
  [`@WayneTechLab`](https://github.com/WayneTechLab)
- Watch the repository if you want release and change visibility:
  [`WayneTechLab/Bardos-Breakfast-Burgers`](https://github.com/WayneTechLab/Bardos-Breakfast-Burgers)
- Review the Wiki and `.SYSTEMX` docs before opening a contribution so your
  change matches the current operating model.

## Contribution notes

- Start from the current `main` branch.
- Keep branches short-lived and bounded.
- Prefer one scoped change per PR or update wave.
- Run the documented checks before handoff:
  `npm test`, `npm run sync:system:check`, and the relevant lint/build gates.
- Update `.SYSTEMX`, the README, and the Wiki together when the public operator
  model changes.
- Do not commit secrets, provider tokens, private exports, or customer data.

## Author notes for maintainers

- Treat `main` as the single public source of truth.
- Merge or close stale branches quickly so docs and status boards do not drift.
- When authorship, collaboration flow, or contribution policy changes, update:
  `README.md`, `.SYSTEMX/README.md`, and this Wiki page in the same pass.
- If an agent or automation opens temporary work branches, close them after the
  result is merged or intentionally discarded.

## Attribution

SFWA-WTL-G1 is provided by **Wayne Tech Lab LLC** under the project license.
If this template or `.SYSTEMX` materially forms the base of your project,
retain the license and request or provide visible attribution where appropriate.
