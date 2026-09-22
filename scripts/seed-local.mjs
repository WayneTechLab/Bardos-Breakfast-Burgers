import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fullMenuItems } from '../src/data/fullMenu.ts'
const require = createRequire(new URL('../functions/package.json', import.meta.url))
const { initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')
const state = JSON.parse(
  readFileSync(new URL('../.SYSTEMX/LAN/Temp/restaurant-emulators.json', import.meta.url)),
)
if (state.project !== 'demo-bardos-local') throw new Error('Local demo project required')
process.env.FIREBASE_AUTH_EMULATOR_HOST = `127.0.0.1:${state.ports.auth}`
process.env.FIRESTORE_EMULATOR_HOST = `127.0.0.1:${state.ports.firestore}`
initializeApp({ projectId: state.project })
const auth = getAuth(),
  db = getFirestore()
const password = 'BardosLocal!2026'
const accounts = [
  ['owner', 5],
  ['staff', 4],
  ['diamond', 3],
  ['pro', 2],
  ['member', 1],
]
for (const [name, level] of accounts) {
  const uid = `local-${name}`,
    email = `${name}@bardos.local`
  try {
    await auth.getUser(uid)
  } catch {
    await auth.createUser({
      uid,
      email,
      password,
      displayName: `Local ${name}`,
      emailVerified: true,
    })
  }
  await auth.setCustomUserClaims(uid, { level })
  await db.doc(`roles/${uid}`).set({ level, email, disabled: false }, { merge: true })
}
let added = 0
for (const item of fullMenuItems) {
  const ref = db.doc(`menu/${item.sku}`)
  if (!(await ref.get()).exists) {
    await ref.set({
      ...item,
      id: item.sku,
      available: true,
      description: item.sourceDescriptionExact || item.displayDescriptionDraft,
      revision: 0,
    })
    added++
  }
}
const demos = {
  'employees/local-staff': {
    name: 'Alex Demo',
    email: 'staff@bardos.local',
    jobTitle: 'Shift lead',
    status: 'active',
    hourlyRateCents: 2200,
    notes: 'Fictional local test employee.',
  },
  'customers/demo-customer': {
    name: 'Taylor Demo',
    email: 'taylor@example.test',
    phone: '',
    notes: 'Fictional customer',
    marketingConsent: false,
  },
  'inventory/demo-coffee': { name: 'Coffee beans', unit: 'lb', quantity: 12, reorderAt: 5 },
  'content/home': {
    headline: 'Breakfast, burgers, and good company.',
    body: "Welcome to Bardo's in Salem, Oregon.",
    published: true,
  },
}
for (const [path, values] of Object.entries(demos))
  if (!(await db.doc(path).get()).exists)
    await db
      .doc(path)
      .set({ ...values, createdAt: new Date().toISOString(), userId: 'local-owner' })
console.log(
  `Seeded ${added} new menu rows; existing edits preserved. ${fullMenuItems.length} source rows.\nLocal-only accounts: ${accounts.map(([name]) => `${name}@bardos.local`).join(', ')}\nLocal-only password: ${password}`,
)
