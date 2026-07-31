import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const CANONICAL_AGENT_MAP = `# SFWA-WTL-G1 Agent Map

This is the canonical repository instruction map for coding agents.

## SYSTEMX-first rule

- Treat \`.SYSTEMX\` as the default operating root.
- Root agent files are discovery stubs only when a vendor/tool requires a fixed
  path.
- Canonical AI instructions, adapter source, prompt rules, routing rules, and
  subagent standards live under \`.SYSTEMX/AI\`.
- Do not create misleading aliases such as \`CODEX.md\`, \`GPT.md\`, or
  \`CoPilot.md\`.

## Operating rules

- Preserve the cross-platform contract: macOS Apple Silicon, Windows 11 x64,
  and Windows 11 ARM64 are primary; Ubuntu, Debian, and WSL2 are documented
  compatibility lanes.
- Put shared behavior in the Node.js CLI under \`.SYSTEMX\`; shell files are
  compatibility launchers only.
- Use argument-array child processes. Never interpolate secrets into commands,
  logs, setup packets, commits, or agent prompts.
- Run \`npm run ci:all\` and \`npm run wtl:deploy -- --preflight\` before
  publishing production-impacting changes.
- Keep \`package.json\`, \`.SYSTEMX/version/\`, starter files, setup-packet
  schema, documentation, and agent adapters synchronized with
  \`npm run wtl:sync\`.
- Read \`.SYSTEMX/docs/AGENT-OPERATIONS.md\` before delegating work. Subagents
  multiply token, tool, and review usage; assign bounded lanes and verify every
  result in the parent session.
- Do not make production deployments, rotate credentials, or change billing
  without explicit operator authorization.

Product: **SFWA-WTL-G1 — Standard Firebase Web App, Wayne Tech Lab Generation
1**, provided by Wayne Tech Lab LLC under the MIT License and without warranty.
`

export const SYSTEMX_AGENT_FILES = Object.freeze({
  '.SYSTEMX/AI/AGENTS.md': CANONICAL_AGENT_MAP,
  '.SYSTEMX/AI/adapters/README.md': `# SYSTEMX AI Adapter Registry

This folder is the canonical source for AI/coding-agent adapter instructions.

Root/vendor files such as \`AGENTS.md\`, \`CLAUDE.md\`,
\`.github/copilot-instructions.md\`, and \`.amazonq/rules/systemx.md\` are
small discovery stubs generated from \`.SYSTEMX/lib/agent-adapters.mjs\`.

Edit this SYSTEMX-owned source layer first, then run:

\`\`\`console
npm run wtl:sync
npm run sync:system:check
\`\`\`

Do not hand-edit generated root stubs unless you are also updating the generator.
`,
  '.SYSTEMX/AI/adapters/claude.md': `# Claude Code Adapter

Use the canonical SYSTEMX instructions:

- \`.SYSTEMX/AI/AGENTS.md\`
- \`.SYSTEMX/AI/LLM-INTERFACE-AND-TOOL-ROUTING.md\`
- \`.SYSTEMX/docs/AGENT-OPERATIONS.md\`

Keep Claude-specific root presence limited to \`CLAUDE.md\`. The root file is a
discovery stub; the durable rules live here under \`.SYSTEMX/AI/adapters/\`.
`,
  '.SYSTEMX/AI/adapters/gemini.md': `# Gemini CLI Adapter

Use the canonical SYSTEMX instructions:

- \`.SYSTEMX/AI/AGENTS.md\`
- \`.SYSTEMX/AI/LLM-INTERFACE-AND-TOOL-ROUTING.md\`
- \`.SYSTEMX/docs/AGENT-OPERATIONS.md\`

Keep Gemini-specific root presence limited to \`GEMINI.md\`. The root file is a
discovery stub; the durable rules live here under \`.SYSTEMX/AI/adapters/\`.
`,
  '.SYSTEMX/AI/adapters/copilot.md': `# GitHub Copilot Adapter

GitHub Copilot should follow the canonical SYSTEMX instructions:

- \`.SYSTEMX/AI/AGENTS.md\`
- \`.SYSTEMX/AI/LLM-INTERFACE-AND-TOOL-ROUTING.md\`
- \`.SYSTEMX/docs/AGENT-OPERATIONS.md\`

Keep Copilot-specific root presence limited to
\`.github/copilot-instructions.md\`. Do not create root \`CoPilot.md\` aliases.
`,
  '.SYSTEMX/AI/adapters/cursor.md': `# Cursor Adapter

Cursor rules route to SYSTEMX:

- Canonical instructions: \`.SYSTEMX/AI/AGENTS.md\`
- Tool routing: \`.SYSTEMX/AI/LLM-INTERFACE-AND-TOOL-ROUTING.md\`
- Agent operations: \`.SYSTEMX/docs/AGENT-OPERATIONS.md\`

Keep project rules under \`.cursor/rules/\` only as generated discovery stubs.
`,
  '.SYSTEMX/AI/adapters/windsurf.md': `# Windsurf Adapter

Windsurf rules route to SYSTEMX:

- Canonical instructions: \`.SYSTEMX/AI/AGENTS.md\`
- Tool routing: \`.SYSTEMX/AI/LLM-INTERFACE-AND-TOOL-ROUTING.md\`
- Agent operations: \`.SYSTEMX/docs/AGENT-OPERATIONS.md\`

Keep project rules under \`.windsurf/rules/\` only as generated discovery stubs.
`,
  '.SYSTEMX/AI/adapters/cline.md': `# Cline Adapter

Cline rules route to SYSTEMX:

- Canonical instructions: \`.SYSTEMX/AI/AGENTS.md\`
- Tool routing: \`.SYSTEMX/AI/LLM-INTERFACE-AND-TOOL-ROUTING.md\`
- Agent operations: \`.SYSTEMX/docs/AGENT-OPERATIONS.md\`

Keep project rules under \`.clinerules/\` only as generated discovery stubs.
`,
  '.SYSTEMX/AI/adapters/continue.md': `# Continue Adapter

Continue rules route to SYSTEMX:

- Canonical instructions: \`.SYSTEMX/AI/AGENTS.md\`
- Tool routing: \`.SYSTEMX/AI/LLM-INTERFACE-AND-TOOL-ROUTING.md\`
- Agent operations: \`.SYSTEMX/docs/AGENT-OPERATIONS.md\`

Keep project rules under \`.continue/rules/\` only as generated discovery stubs.
`,
  '.SYSTEMX/AI/adapters/junie.md': `# Junie Adapter

Junie rules route to SYSTEMX:

- Canonical instructions: \`.SYSTEMX/AI/AGENTS.md\`
- Tool routing: \`.SYSTEMX/AI/LLM-INTERFACE-AND-TOOL-ROUTING.md\`
- Agent operations: \`.SYSTEMX/docs/AGENT-OPERATIONS.md\`

Keep project rules under \`.junie/\` only as generated discovery stubs.
`,
  '.SYSTEMX/AI/adapters/amazonq.md': `# Amazon Q Adapter

Amazon Q rules route to SYSTEMX:

- Canonical instructions: \`.SYSTEMX/AI/AGENTS.md\`
- Tool routing: \`.SYSTEMX/AI/LLM-INTERFACE-AND-TOOL-ROUTING.md\`
- Agent operations: \`.SYSTEMX/docs/AGENT-OPERATIONS.md\`

Keep project rules under \`.amazonq/rules/\` only as generated discovery stubs.
`,
  '.SYSTEMX/AI/adapters/adapter-manifest.json': `${JSON.stringify({
    schemaVersion: 1,
    owner: '.SYSTEMX/AI',
    policy: 'Root/vendor paths are generated discovery stubs. Canonical AI instructions live under .SYSTEMX/AI.',
    canonical: '.SYSTEMX/AI/AGENTS.md',
    adapters: {
      claude: '.SYSTEMX/AI/adapters/claude.md',
      gemini: '.SYSTEMX/AI/adapters/gemini.md',
      copilot: '.SYSTEMX/AI/adapters/copilot.md',
      cursor: '.SYSTEMX/AI/adapters/cursor.md',
      windsurf: '.SYSTEMX/AI/adapters/windsurf.md',
      cline: '.SYSTEMX/AI/adapters/cline.md',
      continue: '.SYSTEMX/AI/adapters/continue.md',
      junie: '.SYSTEMX/AI/adapters/junie.md',
      amazonq: '.SYSTEMX/AI/adapters/amazonq.md',
    },
  }, null, 2)}\n`,
})

export const AGENT_ADAPTERS = Object.freeze({
  'AGENTS.md': `# SFWA-WTL-G1 Agent Map

Canonical AI operating instructions live in:

- \`.SYSTEMX/AI/AGENTS.md\`
- \`.SYSTEMX/AI/LLM-INTERFACE-AND-TOOL-ROUTING.md\`
- \`.SYSTEMX/docs/AGENT-OPERATIONS.md\`

Root \`AGENTS.md\` exists for agent discovery. Keep detailed agent standards,
adapter source, prompts, and routing logic inside \`.SYSTEMX/AI\`.
`,
  'CLAUDE.md': '# Claude Code Instructions\n\n@.SYSTEMX/AI/adapters/claude.md\n',
  'GEMINI.md': '# Gemini CLI Context\n\n@./.SYSTEMX/AI/adapters/gemini.md\n',
  '.github/copilot-instructions.md': '# GitHub Copilot Instructions\n\nFollow `.SYSTEMX/AI/adapters/copilot.md` and `.SYSTEMX/AI/AGENTS.md`.\n',
  '.cursor/rules/systemx.mdc': '---\ndescription: SFWA-WTL-G1 repository operating rules\nalwaysApply: true\n---\n\nFollow `.SYSTEMX/AI/adapters/cursor.md` and `.SYSTEMX/AI/AGENTS.md`.\n',
  '.windsurf/rules/systemx.md': '# SFWA-WTL-G1 Rules\n\nFollow `.SYSTEMX/AI/adapters/windsurf.md` and `.SYSTEMX/AI/AGENTS.md`.\n',
  '.clinerules/systemx.md': '# SFWA-WTL-G1 Rules\n\nFollow `.SYSTEMX/AI/adapters/cline.md` and `.SYSTEMX/AI/AGENTS.md`.\n',
  '.continue/rules/systemx.md': '---\nname: SFWA-WTL-G1 repository rules\n---\n\nFollow `.SYSTEMX/AI/adapters/continue.md` and `.SYSTEMX/AI/AGENTS.md`.\n',
  '.junie/AGENTS.md': '# Junie Repository Instructions\n\nUse `../.SYSTEMX/AI/adapters/junie.md` and `../.SYSTEMX/AI/AGENTS.md`.\n',
  '.amazonq/rules/systemx.md': '# SFWA-WTL-G1 Rules\n\nFollow `.SYSTEMX/AI/adapters/amazonq.md` and `.SYSTEMX/AI/AGENTS.md`.\n',
})

function syncFiles(rootDir, files, { check = false } = {}) {
  const drift = []
  for (const [relativePath, expected] of Object.entries(files)) {
    const target = path.join(rootDir, relativePath)
    const current = existsSync(target) ? readFileSync(target, 'utf8') : null
    if (current === expected) continue
    drift.push(relativePath)
    if (!check) {
      mkdirSync(path.dirname(target), { recursive: true })
      writeFileSync(target, expected, 'utf8')
    }
  }
  return drift
}

export function syncAgentAdapters(rootDir, { check = false } = {}) {
  const systemxDrift = syncFiles(rootDir, SYSTEMX_AGENT_FILES, { check })
  const adapterDrift = syncFiles(rootDir, AGENT_ADAPTERS, { check })
  return [...systemxDrift, ...adapterDrift]
}
