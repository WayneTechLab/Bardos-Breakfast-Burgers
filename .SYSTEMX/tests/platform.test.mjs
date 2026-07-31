import assert from 'node:assert/strict'
import test from 'node:test'
import { browserOpenCommand, detectPlatform, executableName, nativePathFlavor, parseOsRelease } from '../lib/platform.mjs'
import { resolveInvocation } from '../lib/process.mjs'

test('detects required macOS and Windows host combinations', () => {
  assert.equal(detectPlatform({ platform: 'darwin', arch: 'arm64' }).platformId, 'macos-arm64')
  assert.equal(detectPlatform({ platform: 'darwin', arch: 'x64' }).platformId, 'macos-x64')
  assert.equal(detectPlatform({ platform: 'win32', arch: 'x64' }).platformId, 'windows-x64')
  assert.equal(detectPlatform({ platform: 'win32', arch: 'arm64' }).platformId, 'windows-arm64')
})

test('detects Ubuntu, WSL2, Debian, and generic Linux by distro and architecture', () => {
  assert.equal(detectPlatform({ platform: 'linux', arch: 'x64', env: {}, osReleaseText: 'ID=ubuntu\n' }).platformId, 'ubuntu-x64')
  assert.equal(detectPlatform({ platform: 'linux', arch: 'arm64', env: {}, osReleaseText: 'ID="ubuntu"\n' }).platformId, 'ubuntu-arm64')
  assert.equal(detectPlatform({ platform: 'linux', arch: 'x64', env: { WSL_DISTRO_NAME: 'Ubuntu' }, release: 'microsoft-standard-WSL2', osReleaseText: 'ID=ubuntu\n' }).platformId, 'wsl2-x64')
  assert.equal(detectPlatform({ platform: 'linux', arch: 'arm64', env: { WSL_INTEROP: '/run/WSL/1_interop' }, osReleaseText: 'ID=ubuntu\n' }).platformId, 'wsl2-arm64')
  assert.equal(detectPlatform({ platform: 'linux', arch: 'x64', env: {}, osReleaseText: 'ID=debian\n' }).platformId, 'debian-x64')
  assert.equal(detectPlatform({ platform: 'linux', arch: 'arm64', env: {}, osReleaseText: 'ID=fedora\n' }).platformId, 'linux-arm64')
})

test('parses os-release values and retains compatibility aliases', () => {
  assert.deepEqual(parseOsRelease('ID="ubuntu"\nID_LIKE=debian\n'), { ID: 'ubuntu', ID_LIKE: 'debian' })
  assert.equal(detectPlatform({ override: 'ubuntu-x64-experimental' }).platformId, 'ubuntu-x64')
  assert.equal(detectPlatform({ override: 'wsl' }).platformId, 'wsl2-x64')
})

test('explicit override wins and unsupported hosts fail', () => {
  assert.equal(detectPlatform({ platform: 'darwin', arch: 'arm64', override: 'windows-x64' }).platformId, 'windows-x64')
  assert.throws(() => detectPlatform({ platform: 'aix', arch: 'ppc64' }), /Unsupported host/)
  assert.throws(() => detectPlatform({ override: 'windows-32' }), /Unsupported platform override/)
})

test('resolves Windows commands, paths, and browser opening', () => {
  const windows = detectPlatform({ platform: 'win32', arch: 'arm64' })
  assert.equal(executableName('npm', windows), 'npm.cmd')
  assert.equal(executableName('git', windows), 'git')
  assert.equal(nativePathFlavor(windows).sep, '\\')
  assert.equal(browserOpenCommand('https://example.com', windows).command, 'pwsh.exe')
  const invocation = resolveInvocation('npm', ['run', 'test'], windows)
  assert.ok(invocation.executable === process.execPath || invocation.executable === 'npm.cmd')
  assert.ok(invocation.args.includes('test'))
})

test('uses Windows host browser integration for WSL and xdg-open for Linux', () => {
  const wsl = detectPlatform({ override: 'wsl2-x64' })
  const ubuntu = detectPlatform({ override: 'ubuntu-x64' })
  assert.equal(browserOpenCommand('https://example.com', wsl).command, 'powershell.exe')
  assert.equal(browserOpenCommand('https://example.com', ubuntu).command, 'xdg-open')
  assert.equal(wsl.wsl, true)
  assert.equal(ubuntu.linux, true)
})
