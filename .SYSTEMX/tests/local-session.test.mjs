import assert from 'node:assert/strict'
import { createServer } from 'node:net'
import { mkdtempSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { clearSession, findOpenPort, isPidAlive, isPortOpen, readSession, writeSession } from '../lib/local-session.mjs'

function listen(server, port) {
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, '127.0.0.1', resolve)
  })
}

function close(server) {
  return new Promise((resolve) => server.close(resolve))
}

test('detects an occupied port and selects the next open port', async () => {
  const server = createServer()
  await listen(server, 0)
  try {
    const occupied = server.address().port
    assert.equal(await isPortOpen(occupied), false)
    assert.equal(await findOpenPort(occupied, { attempts: 1 }).catch((error) => error.message), `No open local port found from ${occupied} after 1 attempts`)
    const next = await findOpenPort(occupied, { attempts: 10 })
    assert.ok(next > occupied)
  } finally {
    await close(server)
  }
})

test('writes, reads, and clears owned local session state', () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'systemx-local-session-'))
  try {
    const session = writeSession(directory, {
      mode: 'vite',
      host: '127.0.0.1',
      ports: { lan: 7331, vite: 5173 },
      processes: [{ label: 'lan', pid: process.pid, port: 7331 }],
    })
    assert.equal(session.ports.lan, 7331)
    assert.equal(readSession(directory).processes[0].pid, process.pid)
    assert.equal(isPidAlive(process.pid), true)
    clearSession(directory)
    assert.equal(readSession(directory), null)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
