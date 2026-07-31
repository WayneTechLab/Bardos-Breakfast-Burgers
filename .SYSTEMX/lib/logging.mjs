import { existsSync, mkdirSync, renameSync, rmSync, statSync, writeFileSync, appendFileSync } from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const SENSITIVE_KEY = /(authorization|cookie|credential|password|private.?key|secret|token)/i
const SENSITIVE_VALUE = /((?:api[_-]?key|password|secret|token)\s*[=:]\s*)[^\s,;]+/gi

export function redact(value, key = '') {
  if (SENSITIVE_KEY.test(key)) return '[REDACTED]'
  if (Array.isArray(value)) {
    if (key === 'args') {
      let redactNext = false
      return value.map((entry) => {
        const text = String(entry)
        if (redactNext) {
          redactNext = false
          return '[REDACTED]'
        }
        if (/^--?(?:api[_-]?key|authorization|credential|password|private[_-]?key|secret|token)$/i.test(text)) {
          redactNext = true
          return text
        }
        return redact(text)
      })
    }
    return value.map((entry) => redact(entry))
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, redact(childValue, childKey)]))
  }
  if (typeof value === 'string') return value.replace(SENSITIVE_VALUE, '$1[REDACTED]')
  return value
}

export function createRunId() {
  return `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`
}

function rotate(logFile, maxBytes = 5 * 1024 * 1024, keep = 5) {
  if (!existsSync(logFile) || statSync(logFile).size < maxBytes) return
  if (existsSync(`${logFile}.${keep}`)) rmSync(`${logFile}.${keep}`, { force: true })
  for (let index = keep - 1; index >= 1; index -= 1) {
    const source = `${logFile}.${index}`
    const target = `${logFile}.${index + 1}`
    if (existsSync(source)) renameSync(source, target)
  }
  renameSync(logFile, `${logFile}.1`)
  writeFileSync(logFile, '')
}

export function writeOperationalLog(logDir, event, options = {}) {
  mkdirSync(logDir, { recursive: true })
  const logFile = path.join(logDir, options.file || 'operations.jsonl')
  rotate(logFile, options.maxBytes, options.keep)
  const record = redact({ timestamp: new Date().toISOString(), ...event })
  appendFileSync(logFile, `${JSON.stringify(record)}\n`, { encoding: 'utf8', mode: 0o600 })
  return record
}
