import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const root = path.resolve(import.meta.dirname, '../..')
const bash = readFileSync(path.join(root, '.SYSTEMX/scripts/install.sh'), 'utf8')
const powershell = readFileSync(path.join(root, '.SYSTEMX/scripts/install.ps1'), 'utf8')

test('workstation installers are consent-gated and hand off to the setup menu', () => {
  for (const script of [bash, powershell]) {
    assert.match(script, /Install the listed development tools/)
    assert.match(script, /Proceed to the menu-driven Setup & Tooling phase now/)
    assert.match(script, /setup-phase/)
    assert.match(script, /dry-run/i)
  }
})

test('installers include the required editor and CLI baseline', () => {
  for (const tool of ['Visual Studio Code', 'GitHub CLI', 'Google Cloud CLI', 'Chrome', 'Node.js 24', 'Firebase CLI']) {
    assert.match(bash, new RegExp(tool.replace('.', '\\.')), `Bash installer includes ${tool}`)
    assert.match(powershell, new RegExp(tool.replace('.', '\\.')), `PowerShell installer includes ${tool}`)
  }
})

test('Linux installer has native Ubuntu, Debian, WSL2, x64, and ARM64 paths', () => {
  for (const marker of ['ubuntu', 'debian', 'wsl2', 'x64', 'arm64', 'apt-get', 'dnf']) {
    assert.match(bash.toLowerCase(), new RegExp(marker), `Bash installer includes ${marker}`)
  }
})

test('remote installer defaults do not contain credential parameters', () => {
  for (const script of [bash, powershell]) {
    assert.doesNotMatch(script, /(?:--|-)(?:token|password|secret|api-key)\b/i)
  }
})
