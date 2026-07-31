import assert from 'node:assert/strict'
import test from 'node:test'
import { buildDeployArguments, selectDeployTargets } from '../lib/firebase.mjs'

const config = {
  hosting: {},
  firestore: { rules: 'firestore.rules', indexes: 'firestore.indexes.json' },
  storage: { rules: 'storage.rules' },
}

test('constructs Firebase target sets without shell interpolation', () => {
  assert.deepEqual(selectDeployTargets(config, 'hosting'), ['hosting'])
  assert.deepEqual(selectDeployTargets(config, 'rules'), ['firestore:rules', 'firestore:indexes', 'storage'])
  assert.deepEqual(selectDeployTargets(config, 'functions', { functionsPresent: true }), ['functions'])
})

test('constructs project and dry-run argument arrays', () => {
  assert.deepEqual(buildDeployArguments(['hosting'], { project: 'demo-project', dryRun: true }), [
    'deploy', '--only', 'hosting', '--project', 'demo-project', '--dry-run',
  ])
})
