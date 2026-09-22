import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { findOpenPort } from '../.SYSTEMX/lib/local-session.mjs'

const root = resolve(import.meta.dirname, '..')
const temp = resolve(root, '.SYSTEMX/LAN/Temp')
mkdirSync(temp, { recursive: true })
const statePath = resolve(temp, 'restaurant-emulators.json')
const command = process.argv[2] || 'start'
const read = () => (existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) : null)
const running = (pid) => {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}
const state = read()
if (command === 'status') {
  const healthy = {}
  if (state && running(state.pid)) {
    for (const [name, path] of Object.entries({
      auth: '/',
      firestore: `/v1/projects/${state.project}/databases/(default)/documents/menu?pageSize=1`,
      functions: `/${state.project}/us-central1/business`,
    })) {
      try {
        const response = await fetch(`http://127.0.0.1:${state.ports[name]}${path}`, {
          signal: AbortSignal.timeout(3000),
        })
        healthy[name] = response.status < 500
      } catch {
        healthy[name] = false
      }
    }
  }
  console.log({ ...state, running: state ? running(state.pid) : false, healthy })
  process.exit(0)
}
if (command === 'stop') {
  if (state && running(state.pid)) process.kill(-state.pid, 'SIGINT')
  console.log(
    'Sent shutdown to the recorded restaurant emulator process; Firebase exports local data on exit.',
  )
  process.exit(0)
}
if (state && running(state.pid)) {
  console.log('Restaurant emulators already running', state.ports)
  process.exit(0)
}
const ports = {}
for (const [name, preferred] of Object.entries({
  auth: 9099,
  firestore: 8080,
  functions: 5001,
  storage: 9199,
  ui: 4000,
  hub: 4400,
  logging: 4500,
  firestoreWebsocket: 9150,
}))
  ports[name] = await findOpenPort(preferred)
const config = {
  functions: { source: relative(temp, resolve(root, 'functions')), runtime: 'nodejs22' },
  firestore: {
    rules: resolve(root, 'firestore.rules'),
    indexes: resolve(root, 'firestore.indexes.json'),
  },
  storage: { rules: resolve(root, 'storage.rules') },
  emulators: Object.fromEntries(
    Object.entries(ports)
      .filter(([name]) => name !== 'firestoreWebsocket')
      .map(([name, port]) => [
        name,
        {
          host: '127.0.0.1',
          port,
          ...(name === 'ui' ? { enabled: true } : {}),
          ...(name === 'firestore' ? { websocketPort: ports.firestoreWebsocket } : {}),
        },
      ]),
  ),
}
const configPath = resolve(temp, 'restaurant-firebase.json')
writeFileSync(configPath, JSON.stringify(config, null, 2))
const localSecrets = resolve(root, 'functions/.secret.local')
if (!existsSync(localSecrets))
  writeFileSync(
    localSecrets,
    'STRIPE_SECRET_KEY=not_configured\nSTRIPE_WEBHOOK_SECRET=whsec_bardos_local_fixture_only\n',
    { mode: 0o600 },
  )
const envPath = resolve(root, '.env.development.local')
const env = existsSync(envPath) ? readFileSync(envPath, 'utf8') : ''
const entries = {
  VITE_USE_EMULATORS: 'true',
  VITE_LOCAL_AUTH_PORT: ports.auth,
  VITE_LOCAL_FIRESTORE_PORT: ports.firestore,
  VITE_LOCAL_FUNCTIONS_PORT: ports.functions,
  VITE_LOCAL_STORAGE_PORT: ports.storage,
}
const lines = env
  .split('\n')
  .filter((line) => !Object.keys(entries).some((key) => line.startsWith(`${key}=`)))
writeFileSync(
  envPath,
  [...lines, ...Object.entries(entries).map(([key, value]) => `${key}=${value}`)].join('\n') + '\n',
)
const exportPath = resolve(root, '.emulator-data/restaurant')
const args = [
  '--yes',
  'firebase-tools@15.25.1',
  'emulators:start',
  '--project',
  'demo-bardos-local',
  '--config',
  configPath,
  '--export-on-exit',
  exportPath,
]
if (existsSync(resolve(exportPath, 'firebase-export-metadata.json')))
  args.push('--import', exportPath)
const log = openSync(resolve(temp, 'restaurant-emulators.log'), 'a')
const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', args, {
  cwd: root,
  detached: true,
  stdio: ['ignore', log, log],
  env: { ...process.env, JAVA_TOOL_OPTIONS: process.env.JAVA_TOOL_OPTIONS || '-Xmx2048m' },
})
child.unref()
writeFileSync(
  statePath,
  JSON.stringify(
    { pid: child.pid, ports, project: 'demo-bardos-local', startedAt: new Date().toISOString() },
    null,
    2,
  ),
)
console.log(
  'Restaurant emulators starting',
  ports,
  '\nLog: .SYSTEMX/LAN/Temp/restaurant-emulators.log',
)
