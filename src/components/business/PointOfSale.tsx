import { useState } from 'react'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useMenu } from '@/data/useMenu'
import { fullMenuCategories } from '@/data/fullMenu'
import { business, errorMessage, money, type BusinessRecord } from '@/lib/business'
import { isLocalFirebase } from '@/config/firebase'
import { useAccountLevel } from '@/auth/useAccountLevel'

export function PointOfSale({
  onSaved,
  customer = false,
}: {
  onSaved: () => void
  customer?: boolean
}) {
  const { items, connected, error: menuError } = useMenu()
  const account = useAccountLevel()
  const isStaff = account.level >= 4 && !customer
  const [search, setSearch] = useState('')
  const [mobileView, setMobileView] = useState('items')
  const [category, setCategory] = useState('')
  const [cart, setCart] = useState<Record<string, number>>({})
  const [customerName, setCustomerName] = useState('')
  const [service, setService] = useState('takeaway')
  const [table, setTable] = useState('')
  const [notes, setNotes] = useState('')
  const [payment, setPayment] = useState(isStaff ? 'unpaid' : 'stripe')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  const [requestId, setRequestId] = useState(() => crypto.randomUUID())
  const lines = items
    .filter((item) => cart[item.sku])
    .map((item) => ({ ...item, quantity: cart[item.sku] }))
  const total = lines.reduce((sum, item) => sum + item.priceCents * item.quantity, 0)
  const shown = items.filter(
    (item) =>
      item.active &&
      (!category || item.categoryId === category) &&
      `${item.displayName} ${item.sku}`.toLowerCase().includes(search.trim().toLowerCase()),
  )
  const invalidCart =
    lines.some((item) => !item.available || !item.active) ||
    Object.entries(cart).some(
      ([sku, quantity]) => quantity > 0 && !items.some((item) => item.sku === sku),
    )
  const change = (sku: string, quantity: number) => {
    setCart((cart) => ({ ...cart, [sku]: Math.max(0, Math.min(50, quantity)) }))
    setRequestId(crypto.randomUUID())
  }
  async function submit() {
    setBusy(true)
    setMessage('')
    setFailed(false)
    try {
      const order = await business<BusinessRecord>('order.create', {
        requestId,
        lines: lines.map((item) => ({ sku: item.sku, quantity: item.quantity })),
        customerName,
        customerEmail: isStaff ? '' : account.user?.email || '',
        service,
        table,
        notes,
        payment,
      })
      if (payment === 'stripe') {
        setCart({})
        setRequestId(crypto.randomUUID())
        const session = await business<{ url: string }>('checkout', { id: order.id })
        window.location.assign(session.url)
      } else {
        setCart({})
        setRequestId(crypto.randomUUID())
        setMessage(
          `Order ${order.id.slice(0, 8)} created. ${payment === 'simulation' ? 'Simulated payment recorded.' : ''}`,
        )
        onSaved()
      }
    } catch (e) {
      setFailed(true)
      setMessage(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      {!account.orderingEnabled && (
        <p className="ops-notice" role="status">
          Online ordering is currently unavailable.
        </p>
      )}
      {!isStaff && !account.stripeConfigured && (
        <p className="ops-notice" role="status">
          Online payment is currently unavailable. Orders cannot be submitted at this time.
        </p>
      )}
      <div className="pos-mobile-tabs" role="group" aria-label="POS view">
        <button aria-pressed={mobileView === 'items'} onClick={() => setMobileView('items')}>
          Menu items
        </button>
        <button aria-pressed={mobileView === 'cart'} onClick={() => setMobileView('cart')}>
          <ShoppingBag size={16} />
          Order ({lines.reduce((sum, line) => sum + line.quantity, 0)})
        </button>
      </div>
      <div className="pos-layout" data-mobile-view={mobileView}>
        <section>
          <div className="ops-filters">
            <input
              aria-label="Search menu"
              placeholder="Search menu"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              aria-label="Menu category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {fullMenuCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {menuError && <p className="ops-error">Menu is unavailable. {menuError}</p>}
          {!shown.length && (
            <p className="ops-empty" role="status">
              No menu items match your search.
            </p>
          )}
          <div className="pos-items">
            {shown.map((item) => (
              <button
                key={item.sku}
                className="pos-item"
                disabled={!item.available || busy}
                onClick={() => change(item.sku, (cart[item.sku] || 0) + 1)}
              >
                <span>
                  {item.displayName}
                  {item.variantLabel && <small>{item.variantLabel}</small>}
                </span>
                <strong>{item.available ? money(item.priceCents) : 'Sold out'}</strong>
              </button>
            ))}
          </div>
        </section>
        <aside className="pos-cart">
          <h2>
            <ShoppingBag size={20} />
            Current order
          </h2>
          {!lines.length && <p className="ops-empty">No items yet.</p>}
          {lines.map((item) => (
            <div className="cart-line" key={item.sku}>
              <div>
                <strong>{item.displayName}</strong>
                {item.variantLabel && <small>{item.variantLabel}</small>}
                <small>{money(item.priceCents)} each</small>
              </div>
              <div className="ops-actions">
                <button
                  disabled={busy}
                  aria-label={`Remove one ${item.displayName}`}
                  title="Decrease quantity"
                  onClick={() => change(item.sku, item.quantity - 1)}
                >
                  <Minus size={14} />
                </button>
                <span>{item.quantity}</span>
                <button
                  disabled={busy || item.quantity >= 50}
                  aria-label={`Add one ${item.displayName}`}
                  title="Increase quantity"
                  onClick={() => change(item.sku, item.quantity + 1)}
                >
                  <Plus size={14} />
                </button>
                <button
                  disabled={busy}
                  aria-label={`Remove ${item.displayName}`}
                  title="Remove item"
                  onClick={() => change(item.sku, 0)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          <div className="ops-form">
            <label>
              Customer name
              <input
                disabled={busy}
                value={customerName}
                maxLength={100}
                onChange={(e) => {
                  setCustomerName(e.target.value)
                  setRequestId(crypto.randomUUID())
                }}
              />
            </label>
            <label>
              Service
              <select
                disabled={busy}
                value={service}
                onChange={(e) => {
                  setService(e.target.value)
                  setTable('')
                  setRequestId(crypto.randomUUID())
                }}
              >
                <option value="takeaway">Takeaway</option>
                <option value="dine-in">Dine in</option>
              </select>
            </label>
            {service === 'dine-in' && (
              <label>
                Table
                <input
                  disabled={busy}
                  maxLength={20}
                  value={table}
                  onChange={(e) => {
                    setTable(e.target.value)
                    setRequestId(crypto.randomUUID())
                  }}
                />
              </label>
            )}
            <label>
              Order notes
              <textarea
                disabled={busy}
                value={notes}
                maxLength={1000}
                onChange={(e) => {
                  setNotes(e.target.value)
                  setRequestId(crypto.randomUUID())
                }}
              />
            </label>
            <label>
              Payment
              <select
                aria-label="Payment"
                disabled={busy}
                value={payment}
                onChange={(e) => {
                  setPayment(e.target.value)
                  setRequestId(crypto.randomUUID())
                }}
              >
                {isStaff && (
                  <>
                    <option value="unpaid">Pay later</option>
                    <option value="cash">Cash received</option>
                  </>
                )}
                <option value="stripe" disabled={!account.stripeConfigured}>
                  Stripe Checkout{!account.stripeConfigured ? ' (not configured)' : ''}
                </option>
                {isLocalFirebase && isStaff && (
                  <option value="simulation">Local simulated payment</option>
                )}
              </select>
            </label>
            <div className="cart-total">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>
            <button
              className="ops-primary"
              disabled={
                busy ||
                invalidCart ||
                !account.orderingEnabled ||
                !lines.length ||
                !customerName.trim() ||
                !connected ||
                (payment === 'stripe' && !account.stripeConfigured)
              }
              onClick={submit}
            >
              <ShoppingBag size={17} />
              {busy
                ? 'Submitting...'
                : payment === 'stripe'
                  ? 'Continue to payment'
                  : 'Submit order'}
            </button>
            {message && (
              <p role={failed ? 'alert' : 'status'} className={failed ? 'ops-error' : 'ops-notice'}>
                {message}
              </p>
            )}
            {invalidCart && (
              <p className="ops-error" role="alert">
                An item in this order is no longer available. Clear the order and select available
                items.
              </p>
            )}
            {Object.values(cart).some((quantity) => quantity > 0) && (
              <button
                disabled={busy}
                onClick={() => {
                  setCart({})
                  setRequestId(crypto.randomUUID())
                }}
              >
                <Trash2 size={16} />
                Clear order
              </button>
            )}
          </div>
        </aside>
      </div>
    </>
  )
}
