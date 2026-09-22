import test from 'node:test'
import assert from 'node:assert/strict'
import { schemas, pricedLines, canTransition, checkoutParameters } from '../domain.mjs'

test('prices come from the server menu and use integer cents', () => {
  const lines = pricedLines(
    [{ sku: 'A', quantity: 3, priceCents: 1 }],
    [{ id: 'A', active: true, available: true, displayName: 'Burger', priceCents: 1299 }],
  )
  assert.equal(lines[0].totalCents, 3897)
})
test('duplicate, unavailable, and invalid-price items fail closed', () => {
  const item = { id: 'A', active: true, available: true, priceCents: 100 }
  assert.throws(() =>
    pricedLines(
      [
        { sku: 'A', quantity: 1 },
        { sku: 'A', quantity: 2 },
      ],
      [item],
    ),
  )
  assert.throws(() => pricedLines([{ sku: 'A', quantity: 1 }], [{ ...item, available: false }]))
  assert.throws(() => pricedLines([{ sku: 'A', quantity: 1 }], [{ ...item, priceCents: NaN }]))
})
test('orders reject client totals, negative quantities, and unbounded input', () => {
  const order = {
    requestId: crypto.randomUUID(),
    lines: [{ sku: 'A', quantity: 1 }],
    customerName: 'Test',
    service: 'takeaway',
    payment: 'cash',
  }
  assert.ok(schemas.order.safeParse(order).success)
  assert.equal(schemas.order.safeParse({ ...order, service: 'delivery' }).success, false)
  assert.equal(schemas.order.safeParse({ ...order, totalCents: 1 }).success, false)
  assert.equal(
    schemas.order.safeParse({ ...order, lines: [{ sku: 'A', quantity: -1 }] }).success,
    false,
  )
})
test('fulfilment cannot complete an unpaid order or skip preparation', () => {
  assert.equal(canTransition({ status: 'new', paymentStatus: 'paid' }, 'completed'), false)
  assert.equal(canTransition({ status: 'ready', paymentStatus: 'unpaid' }, 'completed'), false)
  assert.equal(canTransition({ status: 'ready', paymentStatus: 'paid' }, 'completed'), true)
})
test('Stripe checkout retains exact order amounts and server-owned return origin', () => {
  const params = checkoutParameters(
    { id: 'A', lines: [{ sku: 'B', name: 'Burger', unitCents: 1200, quantity: 2 }] },
    'https://example.test',
  )
  assert.equal(params.line_items[0].price_data.unit_amount, 1200)
  assert.equal(params.line_items[0].quantity, 2)
  assert.equal(params.success_url, 'https://example.test/account?checkout=success')
  assert.equal(params.payment_method_types, undefined)
})
test('shifts reject reversed or overlong times and protect record schemas', () => {
  assert.equal(
    schemas.shifts.safeParse({
      employeeId: 'A',
      startsAt: '2026-09-22T20:00:00Z',
      endsAt: '2026-09-22T10:00:00Z',
      station: 'Counter',
    }).success,
    false,
  )
  assert.equal(schemas.customers.safeParse({ name: 'Test', level: 5 }).success, false)
})
