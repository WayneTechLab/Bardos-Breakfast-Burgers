import { existsSync, readFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export const PLATFORM_IDS = Object.freeze([
  'macos-arm64',
  'macos-x64',
  'windows-x64',
  'windows-arm64',
  'ubuntu-x64',
  'ubuntu-arm64',
  'wsl2-x64',
  'wsl2-arm64',
  'debian-x64',
  'debian-arm64',
  'linux-x64',
  'linux-arm64',
])

const PLATFORM_ALIASES = Object.freeze({
  auto: 'auto',
  mac: 'macos-arm64',
  macos: 'macos-arm64',
  'macos-arm64': 'macos-arm64',
  'macos-x64': 'macos-x64',
  'windows-x64': 'windows-x64',
  win32: 'windows-x64',
  'win32-x64': 'windows-x64',
  'windows-arm64': 'windows-arm64',
  'win32-arm64': 'windows-arm64',
  ubuntu: 'ubuntu-x64',
  'ubuntu-x64': 'ubuntu-x64',
  'ubuntu-arm64': 'ubuntu-arm64',
  'ubuntu-x64-experimental': 'ubuntu-x64',
  'ubuntu-arm64-experimental': 'ubuntu-arm64',
  wsl: 'wsl2-x64',
  wsl2: 'wsl2-x64',
  'wsl2-x64': 'wsl2-x64',
  'wsl2-arm64': 'wsl2-arm64',
  debian: 'debian-x64',
  'debian-x64': 'debian-x64',
  'debian-arm64': 'debian-arm64',
  linux: 'linux-x64',
  'linux-x64': 'linux-x64',
  'linux-arm64': 'linux-arm64',
})

export function parseOsRelease(text = '') {
  const values = {}
  for (const line of String(text).split(/\r?\n/)) {
    const match = line.match(/^([A-Z_]+)=(.*)$/)
    if (!match) continue
    values[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '')
  }
  return values
}

function readOsRelease() {
  const file = '/etc/os-release'
  if (!existsSync(file)) return ''
  try { return readFileSync(file, 'utf8') } catch { return '' }
}

export function normalizePlatformOverride(value = 'auto') {
  const normalized = String(value || 'auto').trim().toLowerCase()
  const platformId = PLATFORM_ALIASES[normalized]
  if (!platformId) {
    throw new Error(`Unsupported platform override: ${value}. Expected auto or ${PLATFORM_IDS.join(', ')}`)
  }
  return platformId
}

export function detectPlatform({
  platform = process.platform,
  arch = process.arch,
  override = 'auto',
  env = process.env,
  release = os.release(),
  osReleaseText,
} = {}) {
  const requested = normalizePlatformOverride(override)
  const effectiveArch = arch === 'arm64' ? 'arm64' : arch === 'x64' ? 'x64' : null
  const osRelease = parseOsRelease(osReleaseText ?? (platform === 'linux' ? readOsRelease() : ''))
  const distroId = (osRelease.ID || '').toLowerCase() || null
  const wslDetected = platform === 'linux' && Boolean(
    env.WSL_DISTRO_NAME || env.WSL_INTEROP || /microsoft|wsl/i.test(release),
  )
  let platformId = requested

  if (requested === 'auto') {
    if (!effectiveArch) throw new Error(`Unsupported host architecture: ${platform}-${arch}`)
    if (platform === 'darwin') platformId = `macos-${effectiveArch}`
    else if (platform === 'win32') platformId = `windows-${effectiveArch}`
    else if (platform === 'linux' && wslDetected) platformId = `wsl2-${effectiveArch}`
    else if (platform === 'linux' && distroId === 'ubuntu') platformId = `ubuntu-${effectiveArch}`
    else if (platform === 'linux' && distroId === 'debian') platformId = `debian-${effectiveArch}`
    else if (platform === 'linux') platformId = `linux-${effectiveArch}`
    else throw new Error(`Unsupported host platform: ${platform}-${arch}`)
  }

  const windows = platformId.startsWith('windows-')
  const macos = platformId.startsWith('macos-')
  const linux = /^(ubuntu|wsl2|debian|linux)-/.test(platformId)
  const wsl = platformId.startsWith('wsl2-')
  const ubuntu = platformId.startsWith('ubuntu-')
  const compatibility = wsl || platformId.startsWith('debian-') || platformId.startsWith('linux-') || platformId === 'macos-x64'
  const resolvedArch = platformId.endsWith('arm64') ? 'arm64' : 'x64'

  return Object.freeze({
    platformId,
    detectedPlatform: platform,
    detectedArch: arch,
    arch: resolvedArch,
    distroId,
    windows,
    macos,
    linux,
    ubuntu,
    wsl,
    compatibility,
    experimental: platformId.startsWith('linux-'),
    shell: windows ? 'PowerShell 7' : macos ? 'zsh/bash' : 'bash',
    downloadsDir: windows
      ? path.join(env.USERPROFILE || os.homedir(), 'Downloads')
      : path.join(env.HOME || os.homedir(), 'Downloads'),
  })
}

export function executableName(command, platformInfo) {
  if (!platformInfo?.windows) return command
  if (['npm', 'npx', 'firebase', 'm365'].includes(command)) return `${command}.cmd`
  return command
}

export function browserOpenCommand(url, platformInfo) {
  if (platformInfo.windows) {
    return {
      command: 'pwsh.exe',
      args: ['-NoLogo', '-NoProfile', '-Command', 'Start-Process -FilePath $args[0]', url],
    }
  }
  if (platformInfo.wsl) {
    return {
      command: 'powershell.exe',
      args: ['-NoLogo', '-NoProfile', '-Command', 'Start-Process -FilePath $args[0]', url],
    }
  }
  if (platformInfo.macos) return { command: 'open', args: [url] }
  return { command: 'xdg-open', args: [url] }
}

export function nativePathFlavor(platformInfo) {
  return platformInfo.windows ? path.win32 : path.posix
}
