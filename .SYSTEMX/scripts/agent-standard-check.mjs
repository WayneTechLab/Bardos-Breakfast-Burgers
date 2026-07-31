#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()

const requiredFiles = [
  '.SYSTEMX/AI/README.md',
  '.SYSTEMX/AI/AGENTS.md',
  '.SYSTEMX/AI/AGENT-FILE-MAP.md',
  '.SYSTEMX/AI/AGENT-MESH-STANDARD.md',
  '.SYSTEMX/AI/TOOLCALLING-AND-BROWSER-AUTOMATION.md',
  '.SYSTEMX/AI/EXTERNAL-SERVICE-CONNECTOR-STANDARD.md',
  '.SYSTEMX/AI/RECOVERY-PLAYBOOK.md',
  '.SYSTEMX/AI/LLM-INTERFACE-AND-TOOL-ROUTING.md',
  '.SYSTEMX/AI/agent-mesh.schema.json',
  '.SYSTEMX/AI/adapters/README.md',
  '.SYSTEMX/AI/adapters/adapter-manifest.json',
  '.SYSTEMX/AI/adapters/claude.md',
  '.SYSTEMX/AI/adapters/gemini.md',
  '.SYSTEMX/AI/adapters/copilot.md',
  '.SYSTEMX/AI/adapters/cursor.md',
  '.SYSTEMX/AI/adapters/windsurf.md',
  '.SYSTEMX/AI/adapters/cline.md',
  '.SYSTEMX/AI/adapters/continue.md',
  '.SYSTEMX/AI/adapters/junie.md',
  '.SYSTEMX/AI/adapters/amazonq.md',
]

const requiredPhrases = new Map([
  ['.SYSTEMX/AI/AGENTS.md', ['SYSTEMX-first rule', 'Root agent files are discovery stubs']],
  ['.SYSTEMX/AI/AGENT-FILE-MAP.md', ['SYSTEMX-first root policy', 'discovery stub']],
  ['.SYSTEMX/AI/AGENT-MESH-STANDARD.md', ['Agent 0', 'Message Envelope', 'Token Saving Rules']],
  ['.SYSTEMX/AI/TOOLCALLING-AND-BROWSER-AUTOMATION.md', ['Playwright', 'Chrome DevTools MCP', 'Popup And Apply-Block Handling']],
  ['.SYSTEMX/AI/EXTERNAL-SERVICE-CONNECTOR-STANDARD.md', ['Connector Contract', 'Fallback Ladder']],
  ['.SYSTEMX/AI/RECOVERY-PLAYBOOK.md', ['Port Recovery', 'Dead-Letter Entry']],
  ['.SYSTEMX/AI/adapters/README.md', ['canonical source', 'generated root stubs']],
])

const forbiddenRootAgentAliases = ['CODEX.md', 'GPT.md', 'CoPilot.md', 'COPILOT.md']

for (const relativeFile of requiredFiles) {
  const file = path.join(rootDir, relativeFile)
  if (!existsSync(file)) {
    throw new Error(`Missing SYSTEMX AI standard file: ${relativeFile}`)
  }
}

for (const [relativeFile, phrases] of requiredPhrases) {
  const contents = readFileSync(path.join(rootDir, relativeFile), 'utf8')
  for (const phrase of phrases) {
    if (!contents.includes(phrase)) {
      throw new Error(`Missing phrase "${phrase}" in ${relativeFile}`)
    }
  }
}

JSON.parse(readFileSync(path.join(rootDir, '.SYSTEMX/AI/agent-mesh.schema.json'), 'utf8'))
JSON.parse(readFileSync(path.join(rootDir, '.SYSTEMX/AI/adapters/adapter-manifest.json'), 'utf8'))

for (const alias of forbiddenRootAgentAliases) {
  if (existsSync(path.join(rootDir, alias))) {
    throw new Error(`Misleading root agent alias is not allowed: ${alias}`)
  }
}

console.log('[SYSTEMX] AI standard check passed')
