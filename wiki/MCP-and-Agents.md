# MCP and Agents

`.SYSTEMX/AI/AGENTS.md` is the canonical repository instruction map. Root
`AGENTS.md` and vendor rule files are compact discovery stubs only.
Drift-checked adapter source lives under `.SYSTEMX/AI/adapters/` for Claude
Code, Gemini CLI, GitHub Copilot, Cursor, Windsurf, Cline, Continue, Junie, and
Amazon Q.

`CODEX.md`, `CoPilot.md`, and `GPT.md` are intentionally not created because
they are not the recognized repository standards. Codex uses `AGENTS.md`,
GitHub Copilot uses `.github/copilot-instructions.md`, and Gemini CLI uses
`GEMINI.md`.

Run `npm run wtl:mcp` to generate opt-in Firebase and Chrome DevTools MCP
configuration. Use local or staging resources and no production secrets.
Google Cloud remote MCP and Stripe MCP are not enabled automatically; review
provider authentication, scopes, account/project target, and audit controls.

Subagents multiply token, tool, and review usage. Assign disjoint files, finite
objectives, least privilege, no secrets, and mandatory report-backs. The parent
agent owns integration, tests, security review, and publication.
