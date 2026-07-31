import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const SAFE_KEY = /^[A-Z][A-Z0-9_]*$/
const SECRET_KEY = /(SECRET|TOKEN|PASSWORD|PRIVATE_KEY|CREDENTIAL)/i

function parseLegacyEnv(text) {
  const state = {}
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const index = line.indexOf('=')
    const key = line.slice(0, index).trim()
    const value = line.slice(index + 1).trim()
    if (SAFE_KEY.test(key) && !SECRET_KEY.test(key)) state[key] = value
  }
  return state
}

export function readState(stateFile, legacyFile) {
  if (existsSync(stateFile)) {
    try {
      return JSON.parse(readFileSync(stateFile, 'utf8'))
    } catch (error) {
      throw new Error(`Invalid SYSTEMX state file ${stateFile}: ${error.message}`)
    }
  }
  if (legacyFile && existsSync(legacyFile)) return parseLegacyEnv(readFileSync(legacyFile, 'utf8'))
  return {}
}

export function protectLocalFile(file) {
  if (process.platform !== 'win32') return
  const identity = process.env.USERDOMAIN && process.env.USERNAME
    ? `${process.env.USERDOMAIN}\\${process.env.USERNAME}`
    : process.env.USERNAME
  if (identity) spawnSync('icacls.exe', [file, '/inheritance:r', '/grant:r', `${identity}:(R,W)`], { windowsHide: true, stdio: 'ignore' })
}

export function writeState(stateFile, state) {
  const clean = {}
  for (const [key, value] of Object.entries(state)) {
    if (!SAFE_KEY.test(key)) throw new Error(`Invalid SYSTEMX state key: ${key}`)
    if (SECRET_KEY.test(key)) throw new Error(`Secrets are not allowed in SYSTEMX state: ${key}`)
    clean[key] = value
  }
  mkdirSync(path.dirname(stateFile), { recursive: true })
  const temporary = `${stateFile}.${process.pid}.tmp`
  writeFileSync(temporary, `${JSON.stringify(clean, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
  renameSync(temporary, stateFile)
  protectLocalFile(stateFile)
}

export function migrateState(stateFile, legacyFile) {
  if (existsSync(stateFile) || !legacyFile || !existsSync(legacyFile)) return readState(stateFile, legacyFile)
  const state = readState(stateFile, legacyFile)
  writeState(stateFile, state)
  return state
}

export function updateState(stateFile, legacyFile, values) {
  const current = migrateState(stateFile, legacyFile)
  const next = { ...current, ...values }
  writeState(stateFile, next)
  return next
}
