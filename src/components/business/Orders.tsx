import { useState } from 'react'
import { Printer, RefreshCcw } from 'lucide-react'
import { business, dateTime, errorMessage, money, type BusinessRecord } from '@/lib/business'

type Line = { sku: string; name: string; quantity: number; totalCents: number }
export function Orders({
  orders,
  level,
  onSaved,
  kitchen = false,
}: {
  orders: BusinessRecord[]
  level: number
  onSaved: () => void
  kitchen?: boolean
}) {
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  async function act(action: string, order: BusinessRecord, next?: string) {
    if (next === 'cancelled' && !window.confirm(`Cancel order ${order.id.slice(0, 8)}?`)) return
    if (
      action === 'order.refund' &&
      !window.confirm(
        `Refund ${money(order.totalCents)} for order ${order.id.slice(0, 8)}? Cash refunds must be returned at the register.`,
      )
    )
      return
    setBusy(order.id)
    setError('')
    try {
      const result = await business(action, { id: order.id, ...(next ? { status: next } : {}) })
      if (result.url) window.location.assign(String(result.url))
      onSaved()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy('')
    }
  }
  const shown = orders.filter(
    (order) =>
      (!status || order.status === status) &&
      (!kitchen || !['completed', 'cancelled'].includes(String(order.status))),
  )
  return (
    <section>
      <div className="ops-filters">
        <select
          aria-label="Filter order status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {['new', 'preparing', 'ready', 'completed', 'cancelled'].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <button onClick={() => window.print()}>
          <Printer size={16} />
          Print orders
        </button>
      </div>
      {error && (
        <p className="ops-error" role="alert">
          {error}
        </p>
      )}
      {!shown.length && <p className="ops-empty">No orders in this view.</p>}
      <div className={kitchen ? 'kitchen-grid' : 'order-list'}>
        {shown.map((order) => (
          <article className="order-record" key={order.id}>
            <div className="ops-toolbar">
              <div>
                <h2>
                  #{order.id.slice(0, 8)} · {String(order.customerName)}
                </h2>
                <small>
                  {dateTime(order.createdAt)} · {String(order.service)}
                  {order.table ? ` · Table ${String(order.table)}` : ''}
                </small>
              </div>
              <span className={`ops-badge status-${order.status}`}>{String(order.status)}</span>
            </div>
            <ul className="order-lines">
              {(order.lines as Line[]).map((line) => (
                <li key={line.sku}>
                  <span>
                    <b>{line.quantity} ×</b> {line.name}
                  </span>
                  <span>{money(line.totalCents)}</span>
                </li>
              ))}
            </ul>
            {order.notes ? <p className="order-note">{String(order.notes)}</p> : null}
            <div className="ops-toolbar">
              <strong>{money(order.totalCents)}</strong>
              <span>
                {String(order.payment)} · {String(order.paymentStatus)}
              </span>
            </div>
            <div className="ops-actions">
              {level >= 4 && order.status === 'new' && (
                <button disabled={!!busy} onClick={() => act('order.status', order, 'preparing')}>
                  Start preparing
                </button>
              )}
              {level >= 4 && order.status === 'preparing' && (
                <button disabled={!!busy} onClick={() => act('order.status', order, 'ready')}>
                  Mark ready
                </button>
              )}
              {level >= 4 && order.status === 'ready' && (
                <button
                  disabled={!!busy || !['paid', 'simulated'].includes(String(order.paymentStatus))}
                  onClick={() => act('order.status', order, 'completed')}
                >
                  Complete order
                </button>
              )}
              {level >= 4 &&
                ['new', 'preparing'].includes(String(order.status)) &&
                order.payment !== 'stripe' &&
                order.paymentStatus === 'unpaid' && (
                  <button disabled={!!busy} onClick={() => act('order.status', order, 'cancelled')}>
                    Cancel order
                  </button>
                )}
              {order.paymentStatus === 'unpaid' &&
                order.status !== 'cancelled' &&
                (order.payment === 'stripe' || (level >= 4 && order.payment === 'unpaid')) && (
                  <button
                    disabled={!!busy}
                    onClick={() =>
                      act(order.payment === 'stripe' ? 'checkout' : 'order.cash', order)
                    }
                  >
                    {order.payment === 'stripe' ? 'Pay with Stripe' : 'Record cash received'}
                  </button>
                )}
              {level >= 5 && ['paid', 'simulated'].includes(String(order.paymentStatus)) && (
                <button disabled={!!busy} onClick={() => act('order.refund', order)}>
                  <RefreshCcw size={14} />
                  Refund
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
