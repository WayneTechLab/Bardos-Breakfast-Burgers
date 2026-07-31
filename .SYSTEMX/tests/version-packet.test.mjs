import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const root = path.resolve(import.meta.dirname, '../..')
const readJson = (relativePath) => JSON.parse(readFileSync(path.join(root, relativePath), 'utf8'))

test('version surfaces are synchronized', () => {
  const packageJson = readJson('package.json')
  const starter = readJson('.SYSTEMX/Template/starter/package.json')
  const version = readJson('.SYSTEMX/version/version.json')
  const versionText = readFileSync(path.join(root, '.SYSTEMX/version/app-version.txt'), 'utf8').trim()
  assert.match(packageJson.version, /^\d+\.\d+\.\d+$/)
  assert.equal(starter.version, packageJson.version)
  assert.equal(version.app.version, packageJson.version)
  assert.equal(version.systemx.version, packageJson.version)
  assert.equal(versionText, packageJson.version)
})

test('setup packet schema carries platform and security contracts', () => {
  const schema = readJson('.SYSTEMX/Unified-Setup-Process/packet-assets/schemas/setup-packet.schema.json')
  for (const field of ['platformId', 'architecture', 'shell', 'agentCompatibility', 'toolingVersions', 'securityRequirements']) {
    assert.ok(schema.required.includes(field), `${field} is required`)
  }
  for (const platform of ['ubuntu-x64', 'ubuntu-arm64', 'wsl2-x64', 'wsl2-arm64', 'debian-x64', 'debian-arm64', 'linux-x64', 'linux-arm64']) {
    assert.ok(schema.properties.platformId.enum.includes(platform), `${platform} is accepted`)
  }
})
