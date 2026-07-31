import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync, appendFileSync } from 'node:fs'
import path from 'node:path'
import { redact } from './logging.mjs'

const ALLOWED_EVENT_TYPES = new Set(['start', 'checkpoint', 'handoff', 'blocked', 'complete', 'archive'])
const ALLOWED_STATUS = new Set(['done', 'partial', 'blocked', 'needs-review', 'in-progress', 'planned'])
const DEFAULT_SCHEMA_VERSION = 1

function rotate(file, maxBytes = 1024 * 1024, keep = 5) {
  if (!existsSync(file) || statSync(file).size < maxBytes) return
  if (existsSync(`${file}.${keep}`)) rmSync(`${file}.${keep}`, { force: true })
  for (let index = keep - 1; index >= 1; index -= 1) {
    const source = `${file}.${index}`
    const target = `${file}.${index + 1}`
    if (existsSync(source)) renameSync(source, target)
  }
  renameSync(file, `${file}.1`)
  writeFileSync(file, '')
}

function normalizeList(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.map((entry) => String(entry).trim()).filter(Boolean)
  return String(value).split(',').map((entry) => entry.trim()).filter(Boolean)
}

function readJsonl(file) {
  if (!existsSync(file)) return []
  const text = readFileSync(file, 'utf8').trim()
  if (!text) return []
  return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line))
}

function writeJsonl(file, rows) {
  mkdirSync(path.dirname(file), { recursive: true })
  const next = rows.map((row) => JSON.stringify(redact(row))).join('\n')
  writeFileSync(file, next ? `${next}\n` : '', { encoding: 'utf8', mode: 0o600 })
}

export function busPaths(systemxDir) {
  const root = path.join(systemxDir, 'state', 'bus')
  return {
    root,
    live: path.join(root, 'live.jsonl'),
    archive: path.join(root, 'archive'),
    summaries: path.join(root, 'summaries'),
  }
}

export function validateBusMessage(input) {
  const message = redact({
    schemaVersion: DEFAULT_SCHEMA_VERSION,
    timestamp: input.timestamp || new Date().toISOString(),
    runId: input.runId || 'manual',
    missionId: String(input.missionId || '').trim(),
    waveId: String(input.waveId || '').trim(),
    lane: String(input.lane || '').trim(),
    sender: String(input.sender || '').trim(),
    eventType: String(input.eventType || '').trim(),
    status: String(input.status || '').trim(),
    scope: String(input.scope || '').trim(),
    files: normalizeList(input.files),
    evidence: String(input.evidence || '').trim(),
    blockers: String(input.blockers || '').trim(),
    nextAction: String(input.nextAction || '').trim(),
    archived: Boolean(input.archived),
  })
  if (!message.missionId) throw new Error('Bus message requires --mission')
  if (!message.waveId) throw new Error('Bus message requires --wave')
  if (!message.lane) throw new Error('Bus message requires --lane')
  if (!message.sender) throw new Error('Bus message requires --sender')
  if (!ALLOWED_EVENT_TYPES.has(message.eventType)) throw new Error(`Unsupported bus event type: ${message.eventType}`)
  if (!ALLOWED_STATUS.has(message.status)) throw new Error(`Unsupported bus status: ${message.status}`)
  if (!message.scope) throw new Error('Bus message requires --scope')
  if (!message.nextAction && !['complete', 'archive'].includes(message.eventType)) throw new Error('Bus message requires --next-action unless eventType is complete or archive')
  return message
}

export function appendBusMessage(systemxDir, input, options = {}) {
  const paths = busPaths(systemxDir)
  mkdirSync(paths.root, { recursive: true })
  rotate(paths.live, options.maxBytes, options.keep)
  const record = validateBusMessage(input)
  appendFileSync(paths.live, `${JSON.stringify(record)}\n`, { encoding: 'utf8', mode: 0o600 })
  return record
}

export function readBusMessages(systemxDir, filters = {}) {
  const rows = readJsonl(busPaths(systemxDir).live)
  return rows.filter((row) => {
    if (filters.missionId && row.missionId !== filters.missionId) return false
    if (filters.waveId && row.waveId !== filters.waveId) return false
    if (filters.lane && row.lane !== filters.lane) return false
    if (filters.sender && row.sender !== filters.sender) return false
    if (filters.eventType && row.eventType !== filters.eventType) return false
    return true
  })
}

export function summarizeBus(messages, options = {}) {
  const now = options.now ? new Date(options.now) : new Date()
  const quietThresholdMs = Number(options.quietThresholdMs ?? 30 * 60 * 1000)
  const byLane = new Map()
  for (const message of messages) {
    const lane = message.lane || 'unassigned'
    const current = byLane.get(lane)
    if (!current || new Date(message.timestamp) > new Date(current.lastTimestamp)) {
      byLane.set(lane, {
        lane,
        missionId: message.missionId,
        waveId: message.waveId,
        sender: message.sender,
        lastEventType: message.eventType,
        lastStatus: message.status,
        lastTimestamp: message.timestamp,
        blockers: message.blockers || 'none',
        nextAction: message.nextAction || 'none',
      })
    }
  }
  const lanes = [...byLane.values()].sort((left, right) => left.lane.localeCompare(right.lane))
  const quietLanes = lanes.filter((lane) => now.getTime() - new Date(lane.lastTimestamp).getTime() > quietThresholdMs).map((lane) => lane.lane)
  const counts = messages.reduce((accumulator, message) => {
    accumulator[message.eventType] = (accumulator[message.eventType] || 0) + 1
    return accumulator
  }, {})
  return {
    totalMessages: messages.length,
    lanes,
    quietLanes,
    counts,
  }
}

export function archiveBusWave(systemxDir, filters, options = {}) {
  if (!filters.missionId || !filters.waveId) throw new Error('Archive requires --mission and --wave')
  const paths = busPaths(systemxDir)
  const liveRows = readJsonl(paths.live)
  const selected = []
  const remaining = []
  for (const row of liveRows) {
    if (row.missionId === filters.missionId && row.waveId === filters.waveId) selected.push({ ...row, archived: true })
    else remaining.push(row)
  }
  if (!selected.length) throw new Error(`No live bus events found for mission ${filters.missionId} wave ${filters.waveId}`)
  mkdirSync(paths.archive, { recursive: true })
  mkdirSync(paths.summaries, { recursive: true })
  const stamp = (options.timestamp || new Date().toISOString().slice(0, 10))
  const archiveFile = path.join(paths.archive, `${stamp}-${filters.missionId}-${filters.waveId}.jsonl`)
  const summaryFile = path.join(paths.summaries, `${filters.missionId}-${filters.waveId}.json`)
  writeJsonl(archiveFile, selected)
  writeJsonl(paths.live, remaining)
  const summary = {
    missionId: filters.missionId,
    waveId: filters.waveId,
    archivedAt: options.archivedAt || new Date().toISOString(),
    ...summarizeBus(selected, options),
  }
  writeFileSync(summaryFile, `${JSON.stringify(redact(summary), null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
  return { archiveFile, summaryFile, archivedCount: selected.length, remainingCount: remaining.length, summary }
}
