import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldPath } from 'firebase-admin/firestore'
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { createHash, randomUUID } from 'node:crypto'
import Stripe from 'stripe'
import { z } from 'zod'
import { schemas, pricedLines, canTransition, checkoutParameters } from './domain.mjs'

initializeApp()
const db = getFirestore()
const auth = getAuth()
const local =
  process.env.FUNCTIONS_EMULATOR === 'true' && process.env.GCLOUD_PROJECT === 'demo-bardos-local'
const stripeKey = defineSecret('STRIPE_SECRET_KEY')
const webhookKey = defineSecret('STRIPE_WEBHOOK_SECRET')
const stripeConfigured = () =>
  /^(sk|rk)_(test|live)_/.test(stripeKey.value() || '') &&
  (!local || /^(sk|rk)_test_/.test(stripeKey.value()))
const now = () => new Date().toISOString()
const fail = (code, message) => {
  throw new HttpsError(code, message)
}
const levels = {
  menu: 4,
  customers: 4,
  tickets: 1,
  inventory: 4,
  employees: 5,
  shifts: 5,
  expenses: 5,
  content: 4,
}
const docId = z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/)
const origin = () => {
  const value = process.env.APP_ORIGIN || (local ? 'http://127.0.0.1:5173' : '')
  if (!value || (!local && !value.startsWith('https://')))
    fail('failed-precondition', 'APP_ORIGIN must be configured')
  return value
}
function stripe() {
  const key = stripeKey.value()
  if (!stripeConfigured())
    fail(
      'failed-precondition',
      'A Stripe sandbox key is required. Local simulation is available in the POS.',
    )
  return new Stripe(key)
}
function audit(tx, actor, action, target) {
  tx.set(db.collection('audit').doc(), { actorId: actor.uid, action, target, at: now() })
}
async function identity(request) {
  if (!request.auth) fail('unauthenticated', 'Sign in to continue')
  const user = await auth.getUser(request.auth.uid)
  if (user.disabled) fail('permission-denied', 'Account disabled')
  if (
    user.tokensValidAfterTime &&
    request.auth.token.auth_time * 1000 < Date.parse(user.tokensValidAfterTime)
  )
    fail('unauthenticated', 'Please sign in again')
  const role = await db.doc(`roles/${user.uid}`).get()
  if (!role.exists) {
    try {
      await db
        .doc(`roles/${user.uid}`)
        .create({ level: 1, email: user.email || '', disabled: false, createdAt: now() })
    } catch (error) {
      if (error.code !== 6) throw error
    }
  }
  const level = role.exists ? role.data().level : 1
  if (role.data()?.disabled) fail('permission-denied', 'Account disabled')
  if (level >= 4 && !local && !request.auth.token.firebase?.sign_in_second_factor)
    fail('permission-denied', 'Staff access requires multi-factor authentication')
  return { uid: user.uid, email: user.email || '', level }
}
function requireLevel(actor, level) {
  if (actor.level < level) fail('permission-denied', 'Your account cannot perform this action')
}
async function rows(collection, actor, after) {
  let query = db.collection(collection)
  if (actor.level < 4 || (collection === 'timeEntries' && actor.level < 5))
    query = query.where('userId', '==', actor.uid)
  query = query.orderBy(FieldPath.documentId())
  if (after) query = query.startAfter(after)
  const snapshot = await query.limit(500).get()
  return snapshot.docs
    .map((doc) => ({ ...doc.data(), id: doc.id }))
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
}

export const business = onCall(
  {
    region: 'us-central1',
    secrets: [stripeKey],
    cors: true,
    enforceAppCheck: !local,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const actor = await identity(request)
      const { action, payload = {} } = request.data || {}
      if (JSON.stringify(request.data).length > 32768)
        fail('invalid-argument', 'Request is too large')
      if (action === 'session')
        return {
          ...actor,
          local,
          stripeConfigured: stripeConfigured(),
          orderingEnabled: local || process.env.CHECKOUT_ENABLED === 'true',
          billingEnabled: Boolean(
            stripeConfigured() &&
            process.env.STRIPE_PRO_PRICE_ID &&
            process.env.STRIPE_DIAMOND_PRICE_ID,
          ),
        }
      if (!local && !request.auth.token.email_verified)
        fail('permission-denied', 'Verify your email before using your account')
      if (!local) {
        await db.runTransaction(async (tx) => {
          const ref = db.doc(`rateLimits/${actor.uid}`),
            snapshot = await tx.get(ref)
          const bucket = Math.floor(Date.now() / 60000)
          const count = snapshot.data()?.bucket === bucket ? snapshot.data().count : 0
          if (count >= 120) fail('resource-exhausted', 'Too many requests. Please wait a minute.')
          tx.set(ref, { bucket, count: count + 1 })
        })
      }
      if (action === 'records') {
        const { collection, after, customer } = z
          .object({
            collection: z.enum([
              'orders',
              'customers',
              'tickets',
              'inventory',
              'employees',
              'shifts',
              'expenses',
              'content',
              'audit',
              'timeEntries',
              'roles',
            ]),
            after: docId,
            customer: z.boolean().optional(),
          })
          .strict()
          .parse(payload)
        requireLevel(
          actor,
          ['employees', 'expenses', 'audit', 'roles'].includes(collection)
            ? 5
            : ['orders', 'tickets', 'timeEntries'].includes(collection)
              ? 1
              : 4,
        )
        return rows(collection, customer ? { ...actor, level: 1 } : actor, after)
      }
      if (action === 'workspace') {
        const scopedActor = payload.customer === true ? { ...actor, level: 1 } : actor
        const collections =
          scopedActor.level >= 5
            ? [
                'orders',
                'customers',
                'tickets',
                'inventory',
                'employees',
                'shifts',
                'expenses',
                'content',
                'audit',
                'timeEntries',
                'roles',
              ]
            : scopedActor.level >= 4
              ? ['orders', 'customers', 'tickets', 'inventory', 'shifts', 'content', 'timeEntries']
              : ['orders', 'tickets', 'timeEntries']
        const result = {}
        for (const name of collections) result[name] = await rows(name, scopedActor)
        return result
      }
      if (action === 'save') {
        const { collection, id, values } = payload
        if (!(collection in levels) || collection === 'menu')
          fail('invalid-argument', 'Unknown collection')
        requireLevel(actor, levels[collection])
        const parsed = schemas[collection].parse(values)
        if (collection === 'tickets' && actor.level < 4 && parsed.status !== 'open')
          fail('permission-denied', 'Only staff can change ticket status')
        const ref = id
          ? db.doc(`${collection}/${docId.parse(id)}`)
          : db.collection(collection).doc()
        await db.runTransaction(async (tx) => {
          const previous = await tx.get(ref)
          if (previous.exists && actor.level < 4)
            fail('permission-denied', 'Only staff can edit existing tickets')
          if (collection === 'shifts') {
            const employee = await tx.get(db.doc(`employees/${parsed.employeeId}`))
            if (!employee.exists || employee.data().status !== 'active')
              fail('failed-precondition', 'Choose an active employee')
            const shifts = await tx.get(
              db.collection('shifts').where('employeeId', '==', parsed.employeeId),
            )
            if (
              shifts.docs.some(
                (shift) =>
                  shift.id !== ref.id &&
                  Date.parse(shift.data().startsAt) < Date.parse(parsed.endsAt) &&
                  Date.parse(shift.data().endsAt) > Date.parse(parsed.startsAt),
              )
            )
              fail('already-exists', 'This employee already has an overlapping shift')
          }
          const data = { ...parsed, updatedAt: now(), updatedBy: actor.uid }
          if (!previous.exists) Object.assign(data, { createdAt: now(), userId: actor.uid })
          tx.set(ref, data, { merge: true })
          tx.set(db.collection('recordHistory').doc(), {
            collection,
            recordId: ref.id,
            before: previous.exists ? previous.data() : null,
            after: parsed,
            actorId: actor.uid,
            at: now(),
          })
          audit(tx, actor, `${collection}.save`, ref.id)
        })
        return { id: ref.id }
      }
      if (action === 'menu.create') {
        requireLevel(actor, 4)
        const values = schemas.menu
          .omit({ id: true, revision: true })
          .extend({ categoryId: docId })
          .parse(payload)
        const category = await db
          .collection('menu')
          .where('categoryId', '==', values.categoryId)
          .limit(1)
          .get()
        if (category.empty) fail('invalid-argument', 'Choose an existing menu category')
        const id = `CUSTOM-${randomUUID().slice(0, 8).toUpperCase()}`
        const ref = db.doc(`menu/${id}`)
        const source = category.docs[0].data()
        await db.runTransaction(async (tx) => {
          tx.set(ref, {
            ...values,
            id,
            sku: id,
            itemId: id,
            variantId: '',
            variantLabel: '',
            categoryName: source.categoryName,
            sourcePage: '',
            sourceNameExact: '',
            sourceDescriptionExact: '',
            displayDescriptionDraft: '',
            descriptionApprovalStatus: 'approved_from_source',
            foodSafetyAsterisk: false,
            sortOrder: Date.now(),
            priceUsd: (values.priceCents / 100).toFixed(2),
            revision: 0,
            createdAt: now(),
          })
          audit(tx, actor, 'menu.create', id)
        })
        return { id }
      }
      if (action === 'menu.save') {
        requireLevel(actor, 4)
        const values = schemas.menu.parse(payload)
        const ref = db.doc(`menu/${values.id}`)
        await db.runTransaction(async (tx) => {
          const snap = await tx.get(ref)
          if (!snap.exists) fail('not-found', 'Menu item not found')
          if ((snap.data().revision || 0) !== values.revision)
            fail('aborted', 'This item changed. Reload before saving.')
          tx.update(ref, {
            ...values,
            revision: values.revision + 1,
            priceUsd: (values.priceCents / 100).toFixed(2),
            updatedAt: now(),
          })
          tx.set(db.collection('recordHistory').doc(), {
            collection: 'menu',
            recordId: ref.id,
            before: snap.data(),
            after: values,
            actorId: actor.uid,
            at: now(),
          })
          audit(tx, actor, 'menu.save', ref.id)
        })
        return { ok: true }
      }
      if (action === 'order.create') {
        if (!local && process.env.CHECKOUT_ENABLED !== 'true')
          fail('failed-precondition', 'Ordering is not enabled for this restaurant yet')
        const values = schemas.order.parse(payload)
        if (actor.level < 4 && values.payment !== 'stripe')
          fail('permission-denied', 'Customers must pay with Stripe')
        if (values.payment === 'simulation' && !local)
          fail('permission-denied', 'Simulation is local only')
        if (values.payment === 'stripe') stripe()
        const id = createHash('sha256')
          .update(`${actor.uid}:${values.requestId}`)
          .digest('hex')
          .slice(0, 32)
        const ref = db.doc(`orders/${id}`)
        const result = await db.runTransaction(async (tx) => {
          const existing = await tx.get(ref)
          if (existing.exists) {
            if (
              existing.data().requestFingerprint !==
              createHash('sha256').update(JSON.stringify(values)).digest('hex')
            )
              fail('already-exists', 'This submission ID was already used for a different order')
            return { ...existing.data(), id }
          }
          const menu = await tx.getAll(...values.lines.map((line) => db.doc(`menu/${line.sku}`)))
          let lines
          try {
            lines = pricedLines(
              values.lines,
              menu.map((s) => ({ ...s.data(), id: s.id })),
            )
          } catch (e) {
            fail('failed-precondition', e.message)
          }
          const totalCents = lines.reduce((sum, line) => sum + line.totalCents, 0)
          if (totalCents < 50 || totalCents > 1000000)
            fail('invalid-argument', 'Order total must be between $0.50 and $10,000')
          const data = {
            ...values,
            requestFingerprint: createHash('sha256').update(JSON.stringify(values)).digest('hex'),
            lines,
            userId: actor.uid,
            totalCents,
            subtotalCents: totalCents,
            taxCents: 0,
            currency: 'usd',
            status: 'new',
            paymentStatus:
              values.payment === 'cash'
                ? 'paid'
                : values.payment === 'simulation'
                  ? 'simulated'
                  : 'unpaid',
            createdAt: now(),
            updatedAt: now(),
            local,
          }
          tx.set(ref, data)
          audit(tx, actor, 'order.create', id)
          return { ...data, id }
        })
        return result
      }
      if (action === 'order.status') {
        requireLevel(actor, 4)
        const { id, status } = z
          .object({ id: docId, status: z.enum(['preparing', 'ready', 'completed', 'cancelled']) })
          .parse(payload)
        await db.runTransaction(async (tx) => {
          const ref = db.doc(`orders/${id}`)
          const snap = await tx.get(ref)
          if (!snap.exists || !canTransition(snap.data(), status))
            fail(
              'failed-precondition',
              'Invalid order status transition; completed orders must be paid',
            )
          if (status === 'cancelled' && ['paid', 'simulated'].includes(snap.data().paymentStatus))
            fail('failed-precondition', 'Refund the order before cancelling')
          if (
            status === 'cancelled' &&
            snap.data().payment === 'stripe' &&
            snap.data().paymentStatus === 'unpaid'
          )
            fail(
              'failed-precondition',
              'An unpaid Stripe checkout must be expired before cancelling',
            )
          tx.update(ref, { status, updatedAt: now() })
          audit(tx, actor, 'order.status', id)
        })
        return { ok: true }
      }
      if (action === 'order.cash') {
        requireLevel(actor, 4)
        const id = docId.parse(payload.id)
        await db.runTransaction(async (tx) => {
          const ref = db.doc(`orders/${id}`)
          const snap = await tx.get(ref)
          if (
            !snap.exists ||
            snap.data().paymentStatus !== 'unpaid' ||
            snap.data().payment !== 'unpaid' ||
            snap.data().status === 'cancelled'
          )
            fail('failed-precondition', 'Order cannot accept cash')
          tx.update(ref, { payment: 'cash', paymentStatus: 'paid', updatedAt: now() })
          audit(tx, actor, 'order.cash', id)
        })
        return { ok: true }
      }
      if (action === 'checkout') {
        const id = docId.parse(payload.id)
        const ref = db.doc(`orders/${id}`)
        const snap = await ref.get()
        const order = snap.data()
        if (!order || (order.userId !== actor.uid && actor.level < 4))
          fail('permission-denied', 'Order unavailable')
        if (
          order.paymentStatus !== 'unpaid' ||
          order.payment !== 'stripe' ||
          order.status === 'cancelled'
        )
          fail('failed-precondition', 'Order is not awaiting Stripe checkout')
        const session = await stripe().checkout.sessions.create(
          checkoutParameters({ ...order, id }, origin()),
          { idempotencyKey: `order-${id}` },
        )
        await ref.update({ stripeSessionId: session.id })
        return { url: session.url }
      }
      if (action === 'billing.subscribe') {
        const level = z.union([z.literal(2), z.literal(3)]).parse(payload.level)
        if (actor.level >= 4) fail('failed-precondition', 'Staff roles are managed by the owner')
        const price =
          level === 2 ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_DIAMOND_PRICE_ID
        if (!price?.startsWith('price_'))
          fail('failed-precondition', 'Membership pricing has not been configured')
        const billing = await db.doc(`billing/${actor.uid}`).get()
        if (billing.data()?.subscriptionId)
          fail('failed-precondition', 'Use Manage billing to change your current subscription')
        const customer =
          billing.data()?.customerId ||
          (
            await stripe().customers.create(
              { email: actor.email, metadata: { userId: actor.uid } },
              { idempotencyKey: `customer-${actor.uid}` },
            )
          ).id
        await db.doc(`billing/${actor.uid}`).set({ customerId: customer }, { merge: true })
        const session = await stripe().checkout.sessions.create(
          {
            mode: 'subscription',
            customer,
            integration_identifier: 'bardos-membership-qhktmznv',
            client_reference_id: actor.uid,
            line_items: [{ price, quantity: 1 }],
            subscription_data: { metadata: { userId: actor.uid, level: String(level) } },
            success_url: `${origin()}/account`,
            cancel_url: `${origin()}/account`,
          },
          {
            idempotencyKey: `membership-${actor.uid}-${level}-${z.uuid().parse(payload.requestId)}`,
          },
        )
        return { url: session.url }
      }
      if (action === 'billing.portal') {
        const billing = await db.doc(`billing/${actor.uid}`).get()
        if (!billing.data()?.customerId)
          fail('failed-precondition', 'No Stripe billing account exists yet')
        const session = await stripe().billingPortal.sessions.create({
          customer: billing.data().customerId,
          return_url: `${origin()}/account`,
        })
        return { url: session.url }
      }
      if (action === 'order.refund') {
        requireLevel(actor, 5)
        const id = docId.parse(payload.id)
        const ref = db.doc(`orders/${id}`)
        const snap = await ref.get()
        const order = snap.data()
        if (!order || !['paid', 'simulated'].includes(order.paymentStatus))
          fail('failed-precondition', 'Order is not refundable')
        let paymentStatus = 'refunded'
        if (order.payment === 'stripe') {
          if (!order.stripePaymentIntent)
            fail('failed-precondition', 'Payment confirmation is pending')
          const refund = await stripe().refunds.create(
            { payment_intent: order.stripePaymentIntent, metadata: { orderId: id } },
            { idempotencyKey: `refund-${id}` },
          )
          paymentStatus = refund.status === 'succeeded' ? 'refunded' : 'refund-pending'
        }
        await db.runTransaction(async (tx) => {
          const current = await tx.get(ref)
          if (current.data().paymentStatus === 'refunded') return
          tx.update(ref, { paymentStatus, updatedAt: now() })
          audit(tx, actor, 'order.refund', id)
        })
        return { ok: true }
      }
      if (action === 'clock') {
        requireLevel(actor, 4)
        const ref = db.doc(`clocks/${actor.uid}`)
        return db.runTransaction(async (tx) => {
          const active = await tx.get(ref)
          if (active.exists) {
            const entry = db.doc(`timeEntries/${active.data().entryId}`)
            tx.update(entry, { endedAt: now() })
            tx.delete(ref)
            audit(tx, actor, 'clock.out', entry.id)
            return { clockedIn: false }
          }
          const entry = db.collection('timeEntries').doc()
          tx.set(entry, {
            userId: actor.uid,
            email: actor.email,
            startedAt: now(),
            endedAt: null,
            createdAt: now(),
          })
          tx.set(ref, { entryId: entry.id })
          audit(tx, actor, 'clock.in', entry.id)
          return { clockedIn: true }
        })
      }
      if (action === 'role.set') {
        requireLevel(actor, 5)
        const { uid, level } = schemas.role.parse(payload)
        if (uid === actor.uid) fail('failed-precondition', 'You cannot change your own owner role')
        const user = await auth.getUser(uid)
        if (!local && !user.emailVerified)
          fail('failed-precondition', 'The user must verify their email first')
        await db.runTransaction(async (tx) => {
          tx.set(db.doc(`roles/${uid}`), {
            level,
            email: user.email || '',
            updatedAt: now(),
            disabled: user.disabled,
          })
          audit(tx, actor, 'role.set', uid)
        })
        await auth.setCustomUserClaims(uid, { level })
        await auth.revokeRefreshTokens(uid)
        return { ok: true }
      }
      if (action === 'role.disable') {
        requireLevel(actor, 5)
        const { uid, disabled } = z
          .object({ uid: docId, disabled: z.boolean() })
          .strict()
          .parse(payload)
        if (uid === actor.uid)
          fail('failed-precondition', 'You cannot disable your own owner account')
        await auth.getUser(uid)
        await db.runTransaction(async (tx) => {
          tx.set(db.doc(`roles/${uid}`), { disabled, updatedAt: now() }, { merge: true })
          audit(tx, actor, disabled ? 'account.disabled' : 'account.enabled', uid)
        })
        await auth.updateUser(uid, { disabled })
        await auth.revokeRefreshTokens(uid)
        return { ok: true }
      }
      fail('invalid-argument', 'Unknown action')
    } catch (error) {
      if (error instanceof HttpsError) throw error
      if (error instanceof z.ZodError)
        throw new HttpsError(
          'invalid-argument',
          error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        )
      console.error('Business operation failed', { code: error.code || error.type || 'internal' })
      throw new HttpsError(
        'internal',
        'The operation could not be completed. Try again or contact the owner.',
      )
    }
  },
)

export const stripeWebhook = onRequest(
  { region: 'us-central1', secrets: [stripeKey, webhookKey], maxInstances: 10 },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed')
      return
    }
    let event
    try {
      event = Stripe.webhooks.constructEvent(
        req.rawBody,
        req.headers['stripe-signature'],
        webhookKey.value(),
      )
    } catch {
      res.status(400).send('Invalid webhook signature')
      return
    }
    if (event.type === 'refund.updated') {
      const refund = event.data.object,
        id = refund.metadata?.orderId
      if (!id || !/^[a-f0-9]{32}$/.test(id)) {
        res.json({ received: true })
        return
      }
      try {
        await db.runTransaction(async (tx) => {
          const ref = db.doc(`orders/${id}`),
            eventRef = db.doc(`stripeEvents/${event.id}`)
          const [snap, seen] = await Promise.all([tx.get(ref), tx.get(eventRef)])
          if (seen.exists) return
          const order = snap.data()
          if (
            !order ||
            refund.payment_intent !== order.stripePaymentIntent ||
            refund.amount !== order.totalCents ||
            refund.currency !== order.currency
          )
            throw new Error('Refund mismatch')
          const status =
            refund.status === 'succeeded'
              ? 'refunded'
              : ['failed', 'canceled'].includes(refund.status)
                ? 'refund-failed'
                : 'refund-pending'
          if (order.paymentStatus !== 'refunded')
            tx.update(ref, { paymentStatus: status, updatedAt: now() })
          tx.set(eventRef, { type: event.type, orderId: id, receivedAt: now() })
          audit(tx, { uid: 'stripe' }, 'refund.updated', id)
        })
        res.json({ received: true })
      } catch {
        res.status(500).send('Refund reconciliation failed')
      }
      return
    }
    if (
      [
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
      ].includes(event.type)
    ) {
      const subscription = event.data.object
      const uid = subscription.metadata?.userId
      const priceId = subscription.items?.data?.[0]?.price?.id
      const paidLevel =
        priceId && priceId === process.env.STRIPE_DIAMOND_PRICE_ID
          ? 3
          : priceId && priceId === process.env.STRIPE_PRO_PRICE_ID
            ? 2
            : 0
      if (!uid || !docId.safeParse(uid).success || !paidLevel) {
        res.status(400).send('Unknown subscription')
        return
      }
      try {
        // Fetch current state so out-of-order webhook delivery cannot restore old entitlements.
        const current = await stripe().subscriptions.retrieve(subscription.id)
        const currentPrice = current.items?.data?.[0]?.price?.id
        const currentLevel =
          currentPrice === process.env.STRIPE_DIAMOND_PRICE_ID
            ? 3
            : currentPrice === process.env.STRIPE_PRO_PRICE_ID
              ? 2
              : 0
        if (!currentLevel) throw new Error('Unknown current subscription price')
        const level = ['active', 'trialing'].includes(current.status) ? currentLevel : 1
        await db.runTransaction(async (tx) => {
          const billingRef = db.doc(`billing/${uid}`),
            roleRef = db.doc(`roles/${uid}`),
            eventRef = db.doc(`stripeEvents/${event.id}`)
          const [billing, role, seen] = await Promise.all([
            tx.get(billingRef),
            tx.get(roleRef),
            tx.get(eventRef),
          ])
          if (seen.exists) return
          if (billing.data()?.customerId !== current.customer) throw new Error('Customer mismatch')
          tx.set(
            billingRef,
            {
              subscriptionId: current.status === 'canceled' ? null : current.id,
              status: current.status,
              updatedAt: now(),
            },
            { merge: true },
          )
          if ((role.data()?.level || 1) < 4) tx.set(roleRef, { level }, { merge: true })
          tx.set(eventRef, { type: event.type, receivedAt: now() })
          audit(tx, { uid: 'stripe' }, 'subscription.updated', uid)
        })
        res.json({ received: true })
      } catch {
        res.status(500).send('Subscription reconciliation failed')
      }
      return
    }
    if (
      !['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(
        event.type,
      )
    ) {
      res.json({ received: true })
      return
    }
    const session = event.data.object
    if (session.payment_status !== 'paid') {
      res.json({ received: true })
      return
    }
    const id = session.metadata?.orderId
    if (!id || !/^[a-f0-9]{32}$/.test(id)) {
      res.status(400).send('Invalid order')
      return
    }
    try {
      await db.runTransaction(async (tx) => {
        const eventRef = db.doc(`stripeEvents/${event.id}`)
        const orderRef = db.doc(`orders/${id}`)
        const [seen, snap] = await Promise.all([tx.get(eventRef), tx.get(orderRef)])
        if (seen.exists) return
        const order = snap.data()
        if (
          !order ||
          order.payment !== 'stripe' ||
          session.client_reference_id !== id ||
          session.amount_total !== order.totalCents ||
          session.currency !== order.currency ||
          (order.stripeSessionId && order.stripeSessionId !== session.id)
        )
          throw new Error('Payment mismatch')
        if (order.paymentStatus === 'unpaid')
          tx.update(orderRef, {
            paymentStatus: 'paid',
            stripeSessionId: session.id,
            stripePaymentIntent: session.payment_intent,
            updatedAt: now(),
          })
        tx.set(eventRef, { type: event.type, orderId: id, receivedAt: now() })
        audit(tx, { uid: 'stripe' }, 'payment.confirmed', id)
      })
      res.json({ received: true })
    } catch {
      res.status(500).send('Payment reconciliation failed')
    }
  },
)
