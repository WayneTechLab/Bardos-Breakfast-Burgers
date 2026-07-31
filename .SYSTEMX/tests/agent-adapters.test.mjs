import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { AGENT_ADAPTERS, SYSTEMX_AGENT_FILES, syncAgentAdapters } from '../lib/agent-adapters.mjs'

test('generates adapters and reports drift in check mode', () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'systemx-agents-'))
  try {
    assert.equal(syncAgentAdapters(directory).length, Object.keys(SYSTEMX_AGENT_FILES).length + Object.keys(AGENT_ADAPTERS).length)
    assert.deepEqual(syncAgentAdapters(directory, { check: true }), [])
    mkdirSync(path.join(directory, '.github'), { recursive: true })
    writeFileSync(path.join(directory, '.github', 'copilot-instructions.md'), 'drift\n')
    assert.deepEqual(syncAgentAdapters(directory, { check: true }), ['.github/copilot-instructions.md'])
  } finally { rmSync(directory, { recursive: true, force: true }) }
})
