#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { clearSession, findOpenPort, writeSession } from '../lib/local-session.mjs'

const lanRoot = fileURLToPath(new URL('.', import.meta.url))
const rootDir = path.resolve(lanRoot, '..', '..')
const systemxDir = path.resolve(lanRoot, '..')
const mode = process.argv[2] || 'vite'
const passthrough = process.argv.slice(3)
const children = []
const startedAt = new Date().toISOString()
let generatedFirebaseConfig = null

function start(label, command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: rootDir,
    env: { ...process.env, ...options.env },
    shell: false,
    stdio: options.onOutput ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    windowsHide: true,
  })
  if (options.onOutput) {
    for (const stream of [child.stdout, child.stderr]) {
      stream?.on('data', (chunk) => {
        const text = chunk.toString()
        process.stdout.write(text)
        options.onOutput(text)
      })
    }
  }
  children.push(child)
  child.on('exit', (code, signal) => {
    if (signal) return
    if (code && code !== 0) {
      console.error(`[SYSTEMX LAN] ${label} exited with ${code}`)
      shutdown(code)
    }
  })
  return child
}

function npxCommand(args) {
  return process.platform === 'win32'
    ? { command: 'cmd.exe', args: ['/d', '/s', '/c', 'npx', ...args] }
    : { command: 'npx', args }
}

function npxFirebase(args) {
  return npxCommand(['--yes', 'firebase-tools@15.25.1', ...args])
}

function portFrom(text, expression) {
  const match = text.replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, '').match(expression)
  return match ? Number(match[1]) : null
}

function updateFirebaseSession(session, key, port) {
  if (!port || session.ports[key] === port) return
  session.ports[key] = port
  const firebaseProcess = session.processes.find((entry) => entry.label === 'firebase')
  if (firebaseProcess && key === 'firebaseHosting') firebaseProcess.port = port
  writeSession(systemxDir, session)
  console.log(`[SYSTEMX LAN] Confirmed ${key}: ${port}`)
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM')
  }
  if (generatedFirebaseConfig) rmSync(generatedFirebaseConfig, { force: true })
  clearSession(systemxDir)
  process.exitCode = code
}

function absoluteConfigPath(value) {
  return typeof value === 'string' && !path.isAbsolute(value)
    ? path.resolve(rootDir, value)
    : value
}

async function createLocalFirebaseConfig() {
  const source = JSON.parse(readFileSync(path.join(rootDir, 'firebase.json'), 'utf8'))
  const ports = {
    hosting: await findOpenPort(process.env.SYSTEMX_FIREBASE_HOSTING_PORT || 5000),
    ui: await findOpenPort(process.env.SYSTEMX_FIREBASE_UI_PORT || 4000),
    auth: await findOpenPort(process.env.SYSTEMX_FIREBASE_AUTH_PORT || 9099),
    firestore: await findOpenPort(process.env.SYSTEMX_FIREBASE_FIRESTORE_PORT || 8080),
    storage: await findOpenPort(process.env.SYSTEMX_FIREBASE_STORAGE_PORT || 9199),
  }
  if (source.firestore) {
    source.firestore.rules = absoluteConfigPath(source.firestore.rules)
    source.firestore.indexes = absoluteConfigPath(source.firestore.indexes)
  }
  if (source.storage) source.storage.rules = absoluteConfigPath(source.storage.rules)
  if (source.hosting?.public) source.hosting.public = absoluteConfigPath(source.hosting.public)
  source.emulators = {
    ...(source.emulators || {}),
    auth: { ...(source.emulators?.auth || {}), port: ports.auth },
    firestore: { ...(source.emulators?.firestore || {}), port: ports.firestore },
    storage: { ...(source.emulators?.storage || {}), port: ports.storage },
    hosting: { ...(source.emulators?.hosting || {}), port: ports.hosting },
    ui: { ...(source.emulators?.ui || {}), enabled: true, port: ports.ui },
    singleProjectMode: true,
  }
  const tempDir = path.join(systemxDir, 'LAN', 'Temp')
  mkdirSync(tempDir, { recursive: true })
  generatedFirebaseConfig = path.join(tempDir, `firebase.${process.pid}.json`)
  writeFileSync(generatedFirebaseConfig, `${JSON.stringify(source, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
  return { configFile: generatedFirebaseConfig, ports }
}

const lanPort = await findOpenPort(process.env.SYSTEMX_LAN_PORT || 7331)
const baseSession = {
  startedAt,
  mode,
  host: '127.0.0.1',
  ports: { lan: lanPort },
  processes: [{ label: 'runner', pid: process.pid }],
}

const lan = start('lan', process.execPath, [path.join(lanRoot, 'server.mjs')], {
  env: { SYSTEMX_LAN_PORT: String(lanPort) },
})
baseSession.processes.push({ label: 'lan', pid: lan.pid, port: lanPort })

if (mode === 'lan') {
  writeSession(systemxDir, baseSession)
  console.log(`SYSTEMX LAN: http://127.0.0.1:${lanPort}/`)
} else if (mode === 'vite') {
  const vitePort = await findOpenPort(process.env.SYSTEMX_VITE_PORT || 5173)
  const vite = npxCommand(['--no-install', 'vite', '--host', '127.0.0.1', '--port', String(vitePort)])
  const viteProcess = start('vite', vite.command, vite.args)
  baseSession.ports.vite = vitePort
  baseSession.processes.push({ label: 'vite', pid: viteProcess.pid, port: vitePort })
  writeSession(systemxDir, baseSession)
  console.log(`Public app: http://127.0.0.1:${vitePort}/`)
  console.log(`SYSTEMX LAN: http://127.0.0.1:${lanPort}/`)
} else if (mode === 'firebase') {
  const firebaseConfig = await createLocalFirebaseConfig()
  const firebase = npxFirebase(['emulators:start', '--project', 'demo-systemx', '--config', firebaseConfig.configFile, ...passthrough])
  let firebaseOutputBuffer = ''
  const updateFromFirebaseOutput = (text) => {
    firebaseOutputBuffer += text.replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, '')
    const lines = firebaseOutputBuffer.split(/\r?\n/)
    firebaseOutputBuffer = lines.pop() || ''
    for (const line of lines) {
      updateFirebaseSession(baseSession, 'firebaseHosting', portFrom(line, /Local server:\s*http:\/\/127\.0\.0\.1:(\d+)/))
      updateFirebaseSession(baseSession, 'firebaseUi', portFrom(line, /View Emulator UI at http:\/\/127\.0\.0\.1:(\d+)/))
    }
  }
  const firebaseProcess = start('firebase', firebase.command, firebase.args, {
    env: { VITE_USE_FIREBASE_EMULATORS: 'true' },
    onOutput: updateFromFirebaseOutput,
  })
  baseSession.ports.firebaseHosting = firebaseConfig.ports.hosting
  baseSession.ports.firebaseUi = firebaseConfig.ports.ui
  baseSession.ports.firebaseAuth = firebaseConfig.ports.auth
  baseSession.ports.firebaseFirestore = firebaseConfig.ports.firestore
  baseSession.ports.firebaseStorage = firebaseConfig.ports.storage
  baseSession.processes.push({ label: 'firebase', pid: firebaseProcess.pid, port: firebaseConfig.ports.hosting })
  writeSession(systemxDir, baseSession)
  console.log(`Firebase Hosting emulator: http://127.0.0.1:${firebaseConfig.ports.hosting}/`)
  console.log(`Firebase Emulator UI: http://127.0.0.1:${firebaseConfig.ports.ui}/`)
  console.log(`SYSTEMX LAN: http://127.0.0.1:${lanPort}/`)
} else {
  console.error('Usage: node .SYSTEMX/LAN/runner.mjs lan|vite|firebase')
  shutdown(1)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
