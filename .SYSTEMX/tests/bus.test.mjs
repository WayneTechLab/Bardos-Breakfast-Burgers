import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { appendBusMessage, archiveBusWave, busPaths, readBusMessages, summarizeBus, validateBusMessage } from '../lib/bus.mjs'

test('validates and records a bus message', () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'systemx-bus-'))
  try {
    appendBusMessage(directory, {
      runId: 'run-1',
      missionId: 'message-bus',
      waveId: 'wave-01',
      lane: 'Coordinator',
      sender: 'Agent-0',
      eventType: 'start',
      status: 'planned',
      scope: 'Open the mission',
      nextAction: 'Assign bounded lanes',
      files: ['.SYSTEMX/status/MASTERPLAN.md'],
    })
    const rows = readBusMessages(directory, { missionId: 'message-bus' })
    assert.equal(rows.length, 1)
    assert.equal(rows[0].sender, 'Agent-0')
    assert.deepEqual(rows[0].files, ['.SYSTEMX/status/MASTERPLAN.md'])
  } finally { rmSync(directory, { recursive: true, force: true }) }
})

test('summarizes lanes and flags quiet lanes', () => {
  const summary = summarizeBus([
    validateBusMessage({
      timestamp: '2026-07-17T00:00:00.000Z',
      runId: 'run-1',
      missionId: 'message-bus',
      waveId: 'wave-01',
      lane: 'Setup/docs',
      sender: 'agent-a',
      eventType: 'checkpoint',
      status: 'in-progress',
      scope: 'Update docs',
      nextAction: 'Publish docs',
    }),
    validateBusMessage({
      timestamp: '2026-07-17T01:00:00.000Z',
      runId: 'run-2',
      missionId: 'message-bus',
      waveId: 'wave-01',
      lane: 'Verification',
      sender: 'agent-b',
      eventType: 'complete',
      status: 'done',
      scope: 'Run checks',
      nextAction: '',
    }),
  ], {
    now: '2026-07-17T02:00:00.000Z',
    quietThresholdMs: 45 * 60 * 1000,
  })
  assert.equal(summary.totalMessages, 2)
  assert.equal(summary.counts.checkpoint, 1)
  assert.equal(summary.counts.complete, 1)
  assert.deepEqual(summary.quietLanes.sort(), ['Setup/docs', 'Verification'])
})

test('archives a mission wave and writes a compact summary', () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'systemx-bus-'))
  try {
    appendBusMessage(directory, {
      runId: 'run-1',
      missionId: 'message-bus',
      waveId: 'wave-01',
      lane: 'Coordinator',
      sender: 'Agent-0',
      eventType: 'start',
      status: 'planned',
      scope: 'Open mission',
      nextAction: 'Assign lanes',
    })
    appendBusMessage(directory, {
      runId: 'run-2',
      missionId: 'message-bus',
      waveId: 'wave-02',
      lane: 'Verification',
      sender: 'Agent-2',
      eventType: 'start',
      status: 'planned',
      scope: 'Run checks',
      nextAction: 'Execute test suite',
    })
    const result = archiveBusWave(directory, { missionId: 'message-bus', waveId: 'wave-01' }, {
      timestamp: '2026-07-17',
      now: '2026-07-17T03:00:00.000Z',
      archivedAt: '2026-07-17T03:00:00.000Z',
      quietThresholdMs: 30 * 60 * 1000,
    })
    const paths = busPaths(directory)
    const remaining = readBusMessages(directory, {})
    const summary = JSON.parse(readFileSync(result.summaryFile, 'utf8'))
    assert.equal(result.archivedCount, 1)
    assert.equal(remaining.length, 1)
    assert.equal(remaining[0].waveId, 'wave-02')
    assert.equal(summary.missionId, 'message-bus')
    assert.match(result.archiveFile, new RegExp(paths.archive.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  } finally { rmSync(directory, { recursive: true, force: true }) }
})
