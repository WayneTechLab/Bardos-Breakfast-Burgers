import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { executableName } from './platform.mjs'

function packageManagerCli(command) {
  const cliName = command === 'npx' ? 'npx-cli.js' : 'npm-cli.js'
  const executableDir = path.dirname(process.execPath)
  const candidates = [
    process.env.npm_execpath && path.join(path.dirname(process.env.npm_execpath), cliName),
    path.join(executableDir, 'node_modules', 'npm', 'bin', cliName),
    path.join(path.dirname(executableDir), 'lib', 'node_modules', 'npm', 'bin', cliName),
  ].filter(Boolean)
  return candidates.find((candidate) => existsSync(candidate)) || null
}

export function resolveInvocation(command, args = [], platformInfo) {
  if (platformInfo?.windows && ['npm', 'npx'].includes(command)) {
    const cli = packageManagerCli(command)
    if (cli) return { executable: process.execPath, args: [cli, ...args.map(String)] }
  }
  return { executable: executableName(command, platformInfo), args: args.map(String) }
}

export function run(command, args = [], options = {}) {
  const invocation = resolveInvocation(command, args, options.platformInfo)
  const result = spawnSync(invocation.executable, invocation.args, {
    cwd: options.cwd,
    env: options.env || process.env,
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
    shell: false,
    windowsHide: true,
  })
  if (result.error && options.allowMissing) return { status: 127, stdout: '', stderr: result.error.message }
  if (result.error) throw result.error
  const normalized = { status: result.status ?? 1, stdout: result.stdout || '', stderr: result.stderr || '' }
  if (normalized.status !== 0 && !options.allowFailure) {
    const detail = normalized.stderr.trim() || normalized.stdout.trim()
    throw new Error(`${invocation.executable} ${invocation.args.join(' ')} failed (${normalized.status})${detail ? `: ${detail}` : ''}`)
  }
  return normalized
}

export function hasCommand(command, platformInfo, cwd) {
  const probe = platformInfo.windows
    ? run('where.exe', [executableName(command, platformInfo)], { capture: true, allowFailure: true, allowMissing: true, cwd, platformInfo })
    : run('sh', ['-c', 'command -v "$1" >/dev/null 2>&1', 'sh', command], { capture: true, allowFailure: true, allowMissing: true, cwd, platformInfo })
  return probe.status === 0
}

export function versionOf(command, platformInfo, cwd, args = ['--version']) {
  const result = run(command, args, { capture: true, allowFailure: true, allowMissing: true, cwd, platformInfo })
  return result.status === 0 ? (result.stdout || result.stderr).trim().split(/\r?\n/)[0] : null
}
