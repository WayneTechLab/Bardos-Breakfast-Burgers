#!/usr/bin/env node
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const cli = path.join(root, '.SYSTEMX', 'cli', 'systemx.mjs')
const platform = process.env.SYSTEMX_CI_PLATFORM || 'auto'
const version = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')).version
const temporary = mkdtempSync(path.join(os.tmpdir(), 'systemx-smoke-'))

function invoke(args) {
  const result = spawnSync(process.execPath, [cli, ...args, '--platform', platform], { cwd: root, encoding: 'utf8' })
  if (result.status !== 0) throw new Error(`${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`)
  return result.stdout
}

try {
  assert.match(invoke(['help']), /SFWA-WTL-G1/)
  assert.match(invoke(['menu', '--help']), /Interactive lifecycle menu/)
  assert.match(invoke(['menu', '--help']), /setup phase/i)
  assert.match(invoke(['version', 'show']), new RegExp(version.replaceAll('.', '\\.')))
  const doctor = invoke(['doctor', '--json', '--strict=false'])
  assert.match(doctor, new RegExp(platform === 'auto' ? 'platformId' : platform))
  assert.match(doctor, /workstationBootstrap/)
  invoke(['setup', '--check'])
  invoke(['packet', 'export', '--output', temporary])
  const archive = readdirSync(temporary).find((file) => file.endsWith('.zip'))
  assert.ok(archive, 'setup packet archive was generated')
  invoke(['packet', 'import', path.join(temporary, archive), '--output', path.join(temporary, 'imported')])
  invoke(['deploy', '--target', 'hosting', '--preflight'])
  console.log(`[SFWA-WTL-G1] Cross-platform smoke passed for ${platform}`)
} finally {
  rmSync(temporary, { recursive: true, force: true })
}
