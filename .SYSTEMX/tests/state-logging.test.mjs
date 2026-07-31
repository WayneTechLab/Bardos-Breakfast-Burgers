import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { redact, writeOperationalLog } from '../lib/logging.mjs'
import { migrateState, readState, writeState } from '../lib/state.mjs'

test('migrates safe legacy state and excludes secrets', () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'systemx-state-'))
  try {
    const legacy = path.join(directory, 'setup-state.env')
    const state = path.join(directory, 'local.json')
    writeFileSync(legacy, 'EDITION=enterprise\nTOKEN=do-not-copy\nPLATFORM_ID=macos-arm64\n')
    assert.deepEqual(migrateState(state, legacy), { EDITION: 'enterprise', PLATFORM_ID: 'macos-arm64' })
    assert.deepEqual(readState(state), { EDITION: 'enterprise', PLATFORM_ID: 'macos-arm64' })
    assert.throws(() => writeState(state, { API_SECRET: 'nope' }), /Secrets are not allowed/)
  } finally { rmSync(directory, { recursive: true, force: true }) }
})

test('redacts nested key and inline credential values', () => {
  assert.deepEqual(redact({ token: 'abc', nested: { password: 'def' }, message: 'api_key=ghi', args: ['--token', 'jkl'] }), {
    token: '[REDACTED]', nested: { password: '[REDACTED]' }, message: 'api_key=[REDACTED]', args: ['--token', '[REDACTED]'],
  })
})

test('writes sanitized JSONL operational logs', () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'systemx-log-'))
  try {
    writeOperationalLog(directory, { command: 'setup', token: 'secret' })
    const record = JSON.parse(readFileSync(path.join(directory, 'operations.jsonl'), 'utf8'))
    assert.equal(record.token, '[REDACTED]')
    assert.match(record.timestamp, /^\d{4}-\d{2}-\d{2}T/)
  } finally { rmSync(directory, { recursive: true, force: true }) }
})
