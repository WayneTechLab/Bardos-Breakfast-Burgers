import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire(new URL('../functions/package.json', import.meta.url))
const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const { getAuth } = require('firebase-admin/auth')
const Stripe = require('stripe')
const state = JSON.parse(
  readFileSync(new URL('../.SYSTEMX/LAN/Temp/restaurant-emulators.json', import.meta.url)),
)
assert.equal(state.project, 'demo-bardos-local')
process.env.FIRESTORE_EMULATOR_HOST = `127.0.0.1:${state.ports.firestore}`
process.env.FIREBASE_AUTH_EMULATOR_HOST = `127.0.0.1:${state.ports.auth}`
initializeApp({ projectId: state.project })
const db = getFirestore()
const endpoint = `http://127.0.0.1:${state.ports.functions}/${state.project}/us-central1`
const authEndpoint = `http://127.0.0.1:${state.ports.auth}/identitytoolkit.googleapis.com/v1`
let checks = 0
async function login(name) {
  const response = await fetch(`${authEndpoint}/accounts:signInWithPassword?key=demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `${name}@bardos.local`,
      password: 'BardosLocal!2026',
      returnSecureToken: true,
    }),
  })
  const value = await response.json()
  assert.ok(value.idToken, JSON.stringify(value.error))
  return value.idToken
}
async function call(token, action, payload = {}, expected = 200) {
  const response = await fetch(`${endpoint}/business`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ data: { action, payload } }),
  })
  const value = await response.json()
  assert.equal(response.status, expected, `${action}: ${JSON.stringify(value)}`)
  checks++
  return value.result
}
const owner = await login('owner'),
  staff = await login('staff'),
  member = await login('member')
await call(null, 'workspace', {}, 401)
for (const [name, level] of [
  ['owner', 5],
  ['staff', 4],
  ['diamond', 3],
  ['pro', 2],
  ['member', 1],
])
  assert.equal((await call(await login(name), 'session')).level, level)
await call(member, 'menu.save', {}, 403)
await call(staff, 'role.set', { uid: 'local-member', level: 5 }, 403)
await call(owner, 'role.set', { uid: 'local-owner', level: 1 }, 400)
await call(member, 'save', { collection: 'employees', values: {} }, 403)
await call(staff, 'save', { collection: 'employees', values: {} }, 403)
const staffView = await call(staff, 'workspace')
assert.equal(staffView.employees, undefined)
assert.equal(staffView.expenses, undefined)
const ownerPersonalView = await call(owner, 'workspace', { customer: true })
assert.equal(ownerPersonalView.employees, undefined)
assert.equal(ownerPersonalView.roles, undefined)
assert.ok(ownerPersonalView.orders.every((order) => order.userId === 'local-owner'))
assert.ok(ownerPersonalView.tickets.every((ticket) => ticket.userId === 'local-owner'))
const localSession = await call(member, 'session')
assert.equal(localSession.orderingEnabled, true)
assert.equal(typeof localSession.billingEnabled, 'boolean')
const menuRef = db.doc('menu/BFS-001'),
  original = (await menuRef.get()).data()
const cleanup = []
const testUid = `role-check-${Date.now()}`
try {
  await getAuth().createUser({
    uid: testUid,
    email: `${testUid}@bardos.local`,
    password: 'BardosLocal!2026',
    emailVerified: true,
  })
  cleanup.push(`roles/${testUid}`)
  await call(owner, 'role.set', { uid: testUid, level: 4 })
  assert.equal((await call(await login(testUid), 'session')).level, 4)
  const staffToken = await login(testUid)
  await call(owner, 'role.disable', { uid: testUid, disabled: true })
  await call(staffToken, 'session', {}, 403)
  await call(owner, 'role.disable', { uid: testUid, disabled: false })
  assert.equal((await call(await login(testUid), 'session')).level, 4)
  await call(member, 'billing.subscribe', { level: 2, requestId: crypto.randomUUID() }, 400)
  const item = {
    id: 'BFS-001',
    displayName: original.displayName,
    description: original.description,
    priceCents: original.priceCents,
    active: true,
    available: true,
    revision: original.revision,
  }
  const createdMenu = await call(owner, 'menu.create', {
    displayName: 'Test seasonal item',
    description: 'Local fixture',
    priceCents: 900,
    active: false,
    available: false,
    categoryId: 'burgers',
  })
  cleanup.push(`menu/${createdMenu.id}`)
  await call(member, 'menu.create', { displayName: 'Forbidden' }, 403)
  await call(owner, 'menu.save', item)
  await call(owner, 'menu.save', item, 409)
  const payload = {
    requestId: crypto.randomUUID(),
    lines: [{ sku: 'BFS-001', quantity: 2 }],
    customerName: 'Automated Test',
    customerEmail: '',
    service: 'takeaway',
    table: '',
    notes: 'Emulator acceptance',
    payment: 'unpaid',
  }
  await call(owner, 'order.create', { ...payload, totalCents: 1 }, 400)
  await call(owner, 'order.create', { ...payload, service: 'delivery' }, 400)
  await call(member, 'order.create', payload, 403)
  const [order, duplicate] = await Promise.all([
    call(owner, 'order.create', payload),
    call(owner, 'order.create', payload),
  ])
  assert.equal(order.id, duplicate.id)
  assert.equal(order.totalCents, original.priceCents * 2)
  cleanup.push(`orders/${order.id}`)
  await call(owner, 'order.create', { ...payload, customerName: 'Changed submission' }, 409)
  await call(staff, 'order.status', { id: order.id, status: 'completed' }, 400)
  await call(staff, 'order.status', { id: order.id, status: 'preparing' })
  await call(staff, 'order.status', { id: order.id, status: 'ready' })
  await call(staff, 'order.status', { id: order.id, status: 'completed' }, 400)
  await call(staff, 'order.cash', { id: order.id })
  await call(staff, 'order.status', { id: order.id, status: 'completed' })
  await call(staff, 'order.refund', { id: order.id }, 403)
  await call(owner, 'order.refund', { id: order.id })
  const memberView = await call(member, 'workspace')
  assert.ok(!memberView.orders.some((o) => o.id === order.id))
  await call(member, 'records', { collection: 'employees', after: 'a' }, 403)
  assert.ok(Array.isArray(await call(owner, 'records', { collection: 'audit', after: 'a' })))
  await call(member, 'checkout', { id: order.id }, 403)
  const ticket = await call(member, 'save', {
    collection: 'tickets',
    values: { subject: 'Test ticket', message: 'Test request', priority: 'normal', status: 'open' },
  })
  cleanup.push(`tickets/${ticket.id}`)
  assert.ok((await call(member, 'workspace')).tickets.some((t) => t.id === ticket.id))
  await call(
    member,
    'save',
    {
      collection: 'tickets',
      id: ticket.id,
      values: { subject: 'Test', message: 'Test', priority: 'normal', status: 'resolved' },
    },
    403,
  )
  await call(staff, 'save', {
    collection: 'tickets',
    id: ticket.id,
    values: {
      subject: 'Test ticket',
      message: 'Resolved locally',
      priority: 'normal',
      status: 'resolved',
    },
  })
  for (const [collection, values] of Object.entries({
    customers: {
      name: 'Test Customer',
      email: 'test@example.test',
      phone: '',
      notes: '',
      marketingConsent: false,
    },
    inventory: { name: 'Test Stock', quantity: 10, unit: 'each', reorderAt: 4 },
    employees: {
      name: 'Test Employee',
      email: 'employee@example.test',
      jobTitle: 'Cook',
      status: 'active',
      hourlyRateCents: 2000,
      notes: '',
    },
    shifts: {
      employeeId: 'local-staff',
      startsAt: '2026-09-23T09:00:00Z',
      endsAt: '2026-09-23T17:00:00Z',
      station: 'Counter',
    },
    expenses: {
      vendor: 'Test Supplier',
      category: 'supplies',
      amountCents: 5000,
      dueDate: '2026-09-30',
      status: 'pending',
      reference: 'TEST',
    },
    content: { headline: 'Test Content', body: 'Test only', published: false },
  })) {
    const row = await call(owner, 'save', { collection, values })
    cleanup.push(`${collection}/${row.id}`)
    assert.ok((await db.doc(`${collection}/${row.id}`).get()).exists)
  }
  const clockBefore = await db.doc('clocks/local-staff').get()
  if (clockBefore.exists) await call(staff, 'clock')
  assert.equal((await call(staff, 'clock')).clockedIn, true)
  assert.equal((await call(staff, 'clock')).clockedIn, false)
  const documents = `http://127.0.0.1:${state.ports.firestore}/v1/projects/${state.project}/databases/(default)/documents`
  assert.equal((await fetch(`${documents}/menu/BFS-001`)).status, 200)
  checks++
  for (const token of [null, member, owner]) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    assert.equal((await fetch(`${documents}/employees/local-staff`, { headers })).status, 403)
    checks++
    assert.equal(
      (
        await fetch(`${documents}/roles/local-member`, {
          method: 'PATCH',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: { level: { integerValue: '5' } } }),
        })
      ).status,
      403,
    )
    checks++
  }
  const fixtureId = 'a'.repeat(32)
  await db.doc(`orders/${fixtureId}`).set({
    ...payload,
    userId: 'local-owner',
    totalCents: 2400,
    currency: 'usd',
    payment: 'stripe',
    paymentStatus: 'unpaid',
    status: 'new',
    stripeSessionId: 'cs_test_fixture',
  })
  cleanup.push(`orders/${fixtureId}`)
  const event = {
    id: `evt_local_${Date.now()}`,
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_fixture',
        client_reference_id: fixtureId,
        metadata: { orderId: fixtureId },
        amount_total: 2400,
        currency: 'usd',
        payment_status: 'paid',
        payment_intent: 'pi_test_fixture',
      },
    },
  }
  cleanup.push(`stripeEvents/${event.id}`)
  const body = JSON.stringify(event)
  assert.equal(
    (
      await fetch(`${endpoint}/stripeWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'stripe-signature': 'forged' },
        body,
      })
    ).status,
    400,
  )
  checks++
  const signature = Stripe.webhooks.generateTestHeaderString({
    payload: body,
    secret: 'whsec_bardos_local_fixture_only',
  })
  for (let retry = 0; retry < 2; retry++) {
    assert.equal(
      (
        await fetch(`${endpoint}/stripeWebhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'stripe-signature': signature },
          body,
        })
      ).status,
      200,
    )
    checks++
  }
  assert.equal((await db.doc(`orders/${fixtureId}`).get()).data().paymentStatus, 'paid')
  const refundBody = JSON.stringify({
    id: `${event.id}_refund`,
    type: 'refund.updated',
    data: {
      object: {
        metadata: { orderId: fixtureId },
        payment_intent: 'pi_test_fixture',
        amount: 2400,
        currency: 'usd',
        status: 'succeeded',
      },
    },
  })
  cleanup.push(`stripeEvents/${event.id}_refund`)
  assert.equal(
    (
      await fetch(`${endpoint}/stripeWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': Stripe.webhooks.generateTestHeaderString({
            payload: refundBody,
            secret: 'whsec_bardos_local_fixture_only',
          }),
        },
        body: refundBody,
      })
    ).status,
    200,
  )
  assert.equal((await db.doc(`orders/${fixtureId}`).get()).data().paymentStatus, 'refunded')
  checks++
  const mismatch = JSON.stringify({
    ...event,
    id: `${event.id}_wrong`,
    data: { object: { ...event.data.object, amount_total: 1 } },
  })
  assert.equal(
    (
      await fetch(`${endpoint}/stripeWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': Stripe.webhooks.generateTestHeaderString({
            payload: mismatch,
            secret: 'whsec_bardos_local_fixture_only',
          }),
        },
        body: mismatch,
      })
    ).status,
    500,
  )
  checks++
  console.log(
    `PASS: ${checks} emulator checks; authentication levels, authorization, pricing, concurrent idempotency, fulfilment, cash/refund, CRUD, clock, Firestore denial, signed/replayed/mismatched Stripe fixtures.`,
  )
} finally {
  await menuRef.set(original)
  for (const path of cleanup) await db.doc(path).delete()
  await getAuth().deleteUser(testUid)
}
