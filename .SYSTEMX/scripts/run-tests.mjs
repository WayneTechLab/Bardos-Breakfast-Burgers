#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptFile = fileURLToPath(import.meta.url)
const rootDir = path.resolve(path.dirname(scriptFile), '..', '..')
const testsDir = path.join(rootDir, '.SYSTEMX', 'tests')
const files = readdirSync(testsDir)
  .filter((name) => name.endsWith('.test.mjs'))
  .sort()
  .map((name) => path.join(testsDir, name))

if (!files.length) throw new Error('No SYSTEMX test files were found.')

const result = spawnSync(process.execPath, ['--test', ...files], {
  cwd: rootDir,
  shell: false,
  stdio: 'inherit',
})

process.exitCode = result.status ?? 1
