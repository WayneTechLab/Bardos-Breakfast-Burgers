import { z } from 'zod'

export const text = (max = 200) => z.string().trim().min(1).max(max)
const optionalText = (max = 1000) => z.string().trim().max(max).default('')
const id = z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/)
export const schemas = {
  order: z
    .object({
      requestId: z.uuid(),
      lines: z
        .array(z.object({ sku: id, quantity: z.number().int().min(1).max(50) }).strict())
        .min(1)
        .max(60),
      customerName: text(100),
      customerEmail: z.union([z.email(), z.literal('')]).default(''),
      service: z.enum(['dine-in', 'takeaway']),
      table: optionalText(20),
      notes: optionalText(),
      payment: z.enum(['unpaid', 'cash', 'stripe', 'simulation']),
    })
    .strict(),
  menu: z
    .object({
      id,
      displayName: text(150),
      description: optionalText(1000),
      priceCents: z.number().int().min(0).max(100000),
      active: z.boolean(),
      available: z.boolean(),
      revision: z.number().int().min(0),
    })
    .strict(),
  customers: z
    .object({
      name: text(100),
      email: z.union([z.email(), z.literal('')]).default(''),
      phone: optionalText(40),
      notes: optionalText(),
      marketingConsent: z.boolean().default(false),
    })
    .strict(),
  tickets: z
    .object({
      subject: text(160),
      message: text(3000),
      priority: z.enum(['normal', 'high']),
      status: z.enum(['open', 'in-progress', 'resolved']).default('open'),
    })
    .strict(),
  inventory: z
    .object({
      name: text(100),
      unit: z.enum(['each', 'kg', 'lb', 'litre', 'case']),
      quantity: z.number().min(0).max(100000),
      reorderAt: z.number().min(0).max(100000),
    })
    .strict(),
  employees: z
    .object({
      name: text(100),
      email: z.email(),
      jobTitle: text(100),
      status: z.enum(['active', 'on-leave', 'inactive']),
      hourlyRateCents: z.number().int().min(0).max(100000),
      notes: optionalText(),
    })
    .strict(),
  shifts: z
    .object({
      employeeId: id,
      startsAt: z.iso.datetime(),
      endsAt: z.iso.datetime(),
      station: text(80),
    })
    .strict()
    .refine(
      (v) =>
        Date.parse(v.endsAt) > Date.parse(v.startsAt) &&
        Date.parse(v.endsAt) - Date.parse(v.startsAt) <= 86400000,
      'Shift must end after it starts, within 24 hours',
    ),
  expenses: z
    .object({
      vendor: text(120),
      category: z.enum(['supplies', 'rent', 'utilities', 'payroll', 'other']),
      amountCents: z.number().int().min(1).max(100000000),
      dueDate: z.iso.date(),
      status: z.enum(['pending', 'paid']),
      reference: optionalText(200),
    })
    .strict(),
  content: z.object({ headline: text(160), body: text(2000), published: z.boolean() }).strict(),
  role: z.object({ uid: id, level: z.number().int().min(1).max(5) }).strict(),
}

export function pricedLines(lines, menu) {
  const skus = new Set()
  return lines.map((line) => {
    if (skus.has(line.sku)) throw new Error('Duplicate menu item')
    skus.add(line.sku)
    const item = menu.find((item) => item.id === line.sku)
    if (!item?.active || item.available === false) throw new Error(`Item unavailable: ${line.sku}`)
    if (!Number.isSafeInteger(item.priceCents) || item.priceCents < 0)
      throw new Error('Invalid menu price')
    return {
      sku: line.sku,
      name: item.displayName,
      quantity: line.quantity,
      unitCents: item.priceCents,
      totalCents: item.priceCents * line.quantity,
    }
  })
}

export const transitions = {
  new: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed'],
  completed: [],
  cancelled: [],
}
export function canTransition(order, next) {
  return (
    transitions[order.status]?.includes(next) &&
    (next !== 'completed' || ['paid', 'simulated'].includes(order.paymentStatus))
  )
}

export function checkoutParameters(order, origin) {
  return {
    mode: 'payment',
    client_reference_id: order.id,
    integration_identifier: 'bardos-checkout-qhktmznv',
    metadata: { orderId: order.id },
    line_items: order.lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: 'usd',
        unit_amount: line.unitCents,
        product_data: { name: line.name, metadata: { sku: line.sku } },
      },
    })),
    success_url: `${origin}/account?checkout=success`,
    cancel_url: `${origin}/account?checkout=cancelled`,
    ...(order.customerEmail ? { customer_email: order.customerEmail } : {}),
  }
}
