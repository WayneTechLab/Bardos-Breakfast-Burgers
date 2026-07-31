# Contributing

Thank you for improving SFWA-WTL-G1.

1. Fork the repository and create a focused branch.
2. Keep shared behavior in `.SYSTEMX/cli` or `.SYSTEMX/lib`; retain the shell
   launchers as compatibility wrappers.
3. Do not include secrets, private-source material, customer data, or generated
   runtime state.
4. Run `npm ci`, `npm run ci:all`, and
   `npm run deploy -- --target hosting --preflight`.
5. Open a pull request describing platforms tested and security impact.

Contributions are accepted under the repository's MIT License. If this template
substantially bases your own project, Wayne Tech Lab LLC asks for visible credit.
