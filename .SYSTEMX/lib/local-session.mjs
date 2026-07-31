import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import net from 'node:net'
import path from 'node:path'

export const DEFAULT_HOST = '127.0.0.1'

export function sessionFile(systemxDir) {
  return path.join(systemxDir, 'LAN', 'session-current.json')
}

function canListen(port, host) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => {
      server.close(() => resolve(true))
    })
    if (host) server.listen({ port, host, exclusive: true })
    else server.listen({ port, exclusive: true })
  })
}

export async function isPortOpen(port, host = DEFAULT_HOST) {
  if (host !== DEFAULT_HOST) return canListen(port, host)
  // Probe wildcard, IPv4 loopback, and IPv6 loopback sequentially. Some hosts
  // allow a wildcard bind beside a process bound only to 127.0.0.1, while
  // Firebase emulators require their port to be free on every local interface.
  if (!await canListen(port)) return false
  if (!await canListen(port, DEFAULT_HOST)) return false
  return canListen(port, '::1')
}

export async function findOpenPort(startPort, options = {}) {
  const host = options.host || DEFAULT_HOST
  const attempts = options.attempts || 50
  for (let offset = 0; offset < attempts; offset += 1) {
    const port = Number(startPort) + offset
    if (await isPortOpen(port, host)) return port
  }
  throw new Error(`No open local port found from ${startPort} after ${attempts} attempts`)
}

export function readSession(systemxDir) {
  const file = sessionFile(systemxDir)
  if (!existsSync(file)) return null
  return JSON.parse(readFileSync(file, 'utf8'))
}

export function writeSession(systemxDir, session) {
  const file = sessionFile(systemxDir)
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, `${JSON.stringify(session, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
  return session
}

export function clearSession(systemxDir) {
  rmSync(sessionFile(systemxDir), { force: true })
}

export function isPidAlive(pid) {
  if (!pid || !Number.isInteger(Number(pid))) return false
  try {
    process.kill(Number(pid), 0)
    return true
  } catch {
    return false
  }
}

export function stopSession(systemxDir, options = {}) {
  const session = readSession(systemxDir)
  if (!session) return { stopped: [], skipped: [], session: null }

  const stopped = []
  const skipped = []
  const processes = Array.isArray(session.processes) ? session.processes : []
  for (const entry of processes) {
    const pid = Number(entry.pid)
    if (!isPidAlive(pid)) {
      skipped.push({ ...entry, reason: 'not-running' })
      continue
    }
    try {
      process.kill(pid, options.signal || 'SIGTERM')
      stopped.push(entry)
    } catch (error) {
      skipped.push({ ...entry, reason: error.message })
    }
  }
  clearSession(systemxDir)
  return { stopped, skipped, session }
}
