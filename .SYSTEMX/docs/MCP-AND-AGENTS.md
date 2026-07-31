# MCP and Agent Tooling

MCP integrations are optional. Enable only a server needed for a bounded task,
use local or staging resources, and never place production credentials in
`.mcp.json`, prompts, logs, setup packets, or source control.

`npm run wtl:mcp` generates verified command definitions for:

- Firebase MCP through the pinned `firebase-tools` CLI.
- Chrome DevTools MCP in isolated, slim, telemetry-disabled mode.

Google Cloud remote MCP and Stripe MCP are not auto-enabled. Their provider
authentication, scopes, target account/project, and audit controls must be
reviewed explicitly. Prefer read-only access and revoke temporary grants after
the task.

The canonical repository instructions are in `.SYSTEMX/AI/AGENTS.md`. Root
`AGENTS.md` and vendor files are compact discovery stubs only. Adapter source
lives in `.SYSTEMX/AI/adapters/` for Claude Code, Gemini CLI, GitHub Copilot,
Cursor, Windsurf, Cline, Continue, Junie, and Amazon Q. `CODEX.md`,
`CoPilot.md`, and `GPT.md` are intentionally absent because they are not the
recognized repository-level standards for those products.

Subagents multiply token and tool usage. Give each worker disjoint file
ownership, a finite objective, a no-secret rule, and a required report-back;
the parent agent owns integration, testing, security review, and publication.

For longer missions, a local message bus can help subagents exchange compact
checkpoints without keeping every detail in the active chat context. Keep it
local-first, append-only, redacted, and aggressively archived; it should reduce
token drag, not become a second unbounded memory store.
