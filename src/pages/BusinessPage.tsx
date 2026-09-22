import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ClipboardList,
  Clock,
  CookingPot,
  CreditCard,
  Download,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth, isLocalFirebase } from '@/config/firebase'
import { useAccountLevel } from '@/auth/useAccountLevel'
import { AppLink } from '@/components/navigation/AppLink'
import {
  business,
  dateTime,
  errorMessage,
  money,
  type BusinessRecord,
  type Workspace,
} from '@/lib/business'
import { useMenu } from '@/data/useMenu'
import { PointOfSale } from '@/components/business/PointOfSale'
import { Orders } from '@/components/business/Orders'
import { RecordEditor } from '@/components/business/RecordEditor'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { navigate } from '@/lib/navigation'
import { MembershipBilling } from '@/components/business/MembershipBilling'

const editable = new Set([
  'menu',
  'customers',
  'tickets',
  'inventory',
  'employees',
  'shifts',
  'expenses',
  'content',
])

const modules = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, level: 4 },
  { id: 'pos', label: 'Point of sale', icon: ShoppingBag, level: 4 },
  { id: 'orders', label: 'Orders', icon: ClipboardList, level: 4 },
  { id: 'kitchen', label: 'Kitchen', icon: CookingPot, level: 4 },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed, level: 4 },
  { id: 'customers', label: 'Customers', icon: Users, level: 4 },
  { id: 'tickets', label: 'Tickets', icon: Ticket, level: 4 },
  { id: 'inventory', label: 'Inventory', icon: Package, level: 4 },
  { id: 'employees', label: 'Staff & HR', icon: Users, level: 5 },
  { id: 'shifts', label: 'Schedule', icon: Clock, level: 4 },
  { id: 'timeEntries', label: 'Time clock', icon: Clock, level: 4 },
  { id: 'expenses', label: 'Billing & expenses', icon: CreditCard, level: 5 },
  { id: 'content', label: 'Website CMS', icon: FileText, level: 4 },
  { id: 'roles', label: 'Account access', icon: ShieldCheck, level: 5 },
  { id: 'audit', label: 'Audit log', icon: ShieldCheck, level: 5 },
]
const columns: Record<string, string[]> = {
  menu: ['displayName', 'categoryName', 'priceCents', 'active', 'available'],
  customers: ['name', 'email', 'phone', 'marketingConsent'],
  tickets: ['subject', 'priority', 'status', 'message'],
  inventory: ['name', 'quantity', 'unit', 'reorderAt'],
  employees: ['name', 'email', 'jobTitle', 'status', 'hourlyRateCents'],
  shifts: ['employeeId', 'startsAt', 'endsAt', 'station'],
  expenses: ['vendor', 'category', 'amountCents', 'dueDate', 'status'],
  content: ['headline', 'body', 'published'],
  roles: ['email', 'level', 'disabled', 'id'],
  audit: ['at', 'actorId', 'action', 'target'],
  timeEntries: ['email', 'startedAt', 'endedAt', 'hours'],
}
const labels: Record<string, string> = {
  displayName: 'Item',
  categoryName: 'Category',
  priceCents: 'Price',
  active: 'Published',
  available: 'Available',
  marketingConsent: 'Marketing consent',
  reorderAt: 'Reorder at',
  jobTitle: 'Job title',
  hourlyRateCents: 'Hourly rate',
  employeeId: 'Employee',
  startsAt: 'Starts',
  endsAt: 'Ends',
  amountCents: 'Amount',
  dueDate: 'Due',
  actorId: 'Actor',
  startedAt: 'Clock in',
  endedAt: 'Clock out',
  at: 'Date',
}

function exportCsv(name: string, rows: BusinessRecord[]) {
  const keys = columns[name] || Object.keys(rows[0] || {})
  const escape = (value: unknown) =>
    `"${String(value ?? '')
      .replace(/^[\s]*[=+@-]|^[\t\r\n]/, "'$&")
      .replaceAll('"', '""')}"`
  const text = [
    keys.join(','),
    ...rows.map((row) => keys.map((key) => escape(row[key])).join(',')),
  ].join('\r\n')
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `bardos-${name}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function BusinessPage({
  module = 'overview',
  customer = false,
}: {
  module?: string
  customer?: boolean
}) {
  const account = useAccountLevel()
  if (account.loading)
    return (
      <div className="ops ops-gate" role="status">
        Checking access...
      </div>
    )
  if (!account.user || account.error || account.level < (customer ? 1 : 4))
    return (
      <div className="ops ops-gate">
        <ShieldCheck size={36} />
        <h1>{account.user ? 'Access restricted' : 'Sign in to continue'}</h1>
        <p>
          {account.error ||
            (customer
              ? 'Your orders and account are private.'
              : 'Restaurant operations require a staff or owner account.')}
        </p>
        <AppLink to="/login" className="ops-primary">
          Open sign in
        </AppLink>
      </div>
    )
  const definition = modules.find((item) => item.id === module)
  if (!customer && !definition) return <NotFoundPage />
  if (!customer && (!definition || definition.level > account.level))
    return (
      <div className="ops ops-gate">
        <h1>Owner access required</h1>
        <AppLink to="/manage">Return to overview</AppLink>
      </div>
    )
  return <WorkspaceView module={module} customer={customer} />
}

function WorkspaceView({ module, customer }: { module: string; customer: boolean }) {
  const account = useAccountLevel()
  const { items: menu, connected: menuConnected, error: menuError } = useMenu(account.level >= 4)
  const [data, setData] = useState<Workspace>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState<{ collection: string; record?: BusinessRecord } | null>(null)
  const [busy, setBusy] = useState(false)
  const [exhausted, setExhausted] = useState<Record<string, boolean>>({})
  const paging = useRef(false)
  const refresh = useCallback(async () => {
    paging.current = false
    setExhausted({})
    try {
      setData(await business<Workspace>('workspace', { customer }))
      setError('')
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [customer])
  useEffect(() => {
    const initial = setTimeout(() => {
      void refresh()
    }, 0)
    const interval = setInterval(() => {
      if (!paging.current) void refresh()
    }, 15000)
    return () => {
      clearTimeout(initial)
      clearInterval(interval)
    }
  }, [refresh])
  const selected = modules.find((item) => item.id === module)
  const orders = data.orders || []
  const records = module === 'menu' ? (menu as unknown as BusinessRecord[]) : data[module] || []
  const shown = records.filter((record) =>
    JSON.stringify(record).toLowerCase().includes(search.toLowerCase()),
  )
  const paid = orders.filter((order) => order.paymentStatus === 'paid')
  const total = paid.reduce((sum, order) => sum + Number(order.totalCents), 0)
  const openOrders = orders.filter(
    (order) => !['completed', 'cancelled'].includes(String(order.status)),
  )
  const ownClock = (data.timeEntries || []).find(
    (entry) => entry.userId === account.user?.uid && !entry.endedAt,
  )
  async function clock() {
    setBusy(true)
    try {
      await business('clock')
      await refresh()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  async function setRole(record: BusinessRecord, level: string) {
    if (
      !window.confirm(
        `Change ${String(record.email)} to level ${level}? Their next sign-in will use the new permissions.`,
      )
    )
      return
    setBusy(true)
    try {
      await business('role.set', { uid: record.id, level: Number(level) })
      await refresh()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  async function toggleAccount(record: BusinessRecord) {
    if (
      !window.confirm(
        `${record.disabled ? 'Enable' : 'Disable'} access for ${String(record.email)}?`,
      )
    )
      return
    setBusy(true)
    try {
      await business('role.disable', { uid: record.id, disabled: !record.disabled })
      await refresh()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  async function loadMore() {
    paging.current = true
    const collection = module === 'kitchen' ? 'orders' : module
    const current = data[collection] || []
    setBusy(true)
    try {
      const extra = await business<BusinessRecord[]>('records', {
        collection,
        customer,
        after: current
          .map((record) => record.id)
          .sort()
          .at(-1),
      })
      setData((data) => ({
        ...data,
        [collection]: [
          ...(data[collection] || []),
          ...extra.filter((row) => !data[collection]?.some((existing) => existing.id === row.id)),
        ],
      }))
      setExhausted((exhausted) => ({ ...exhausted, [collection]: extra.length < 500 }))
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  function value(record: BusinessRecord, key: string) {
    if (key.endsWith('Cents')) return money(record[key])
    if (key === 'hours')
      return record.endedAt
        ? (
            (Date.parse(String(record.endedAt)) - Date.parse(String(record.startedAt))) /
            3600000
          ).toFixed(2)
        : 'On shift'
    if (key === 'employeeId')
      return String(
        data.employees?.find((e) => e.id === record.employeeId)?.name || record.employeeId,
      )
    if (
      ['startsAt', 'endsAt', 'startedAt', 'endedAt', 'createdAt', 'updatedAt', 'at'].includes(key)
    )
      return dateTime(record[key])
    return typeof record[key] === 'boolean'
      ? record[key]
        ? 'Yes'
        : 'No'
      : String(record[key] ?? '-')
  }
  return (
    <div className={`ops ops-shell ${customer ? 'customer-shell' : ''}`}>
      {!customer && (
        <aside className="ops-sidebar">
          <p className="ops-sidebar-title">Restaurant</p>
          <label className="ops-mobile-nav">
            <span className="sr-only">Restaurant workspace</span>
            <select aria-label="Restaurant workspace" value={module} onChange={(event) => navigate(`/manage/${event.target.value}`)}>
              {modules
                .filter((item) => item.level <= account.level)
                .map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.label}
                  </option>
                ))}
            </select>
          </label>
          <nav aria-label="Restaurant workspace">
            {modules
              .filter((item) => item.level <= account.level)
              .map((item) => (
                <AppLink
                  to={`/manage/${item.id}`}
                  key={item.id}
                  aria-current={module === item.id ? 'page' : undefined}
                >
                  <item.icon size={18} />
                  {item.label}
                </AppLink>
              ))}
          </nav>
          <div className="ops-sidebar-account">
            <strong>
              Level {account.level} · {account.level === 5 ? 'Owner' : 'Staff'}
            </strong>
            <small>{account.user?.email}</small>
            <button onClick={() => auth && signOut(auth)}>
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>
      )}
      <div className="ops-main">
        <div className="ops-toolbar">
          <div>
            <p className="ops-eyebrow">Bardo's Breakfast Burgers</p>
            <h1>
              {customer ? (module === 'pos' ? 'Order online' : 'My account') : selected?.label}
            </h1>
          </div>
          <button
            title="Refresh workspace"
            aria-label="Refresh workspace"
            disabled={loading || busy}
            onClick={() => {
              void refresh()
            }}
          >
            <RefreshCw size={18} />
          </button>
        </div>
        {isLocalFirebase && (
          <p className="ops-environment">
            Local Firebase · Test business data ·{' '}
            {account.stripeConfigured
              ? 'Stripe sandbox configured'
              : 'Stripe sandbox key not configured'}
          </p>
        )}
        {error && (
          <p className="ops-error" role="alert">
            {error}
          </p>
        )}
        {module === 'menu' && menuError && (
          <p role="alert" className="ops-error">
            Menu changes are unavailable. Refresh to reconnect.
          </p>
        )}
        {module === 'menu' && !menuConnected && !menuError && (
          <p role="status">Connecting to the live menu...</p>
        )}
        {customer && new URLSearchParams(window.location.search).get('checkout') === 'success' && (
          <p className="ops-notice" role="status">
            Payment submitted. Your order status updates after payment confirmation.
          </p>
        )}
        {customer &&
          new URLSearchParams(window.location.search).get('checkout') === 'cancelled' && (
            <p className="ops-notice" role="status">
              Checkout closed. Check your order's payment status below before trying again.
            </p>
          )}
        {orders.length >= 500 && (
          <p className="ops-notice">
            Sales totals cover loaded orders. Open Orders to load earlier records.
          </p>
        )}
        {loading && <p role="status">Loading restaurant records...</p>}
        {module === 'pos' ? (
          <PointOfSale onSaved={refresh} customer={customer} />
        ) : customer ? (
          <>
            <div className="ops-actions">
              <AppLink className="ops-primary" to="/order">
                <ShoppingBag size={16} />
                New order
              </AppLink>
              <button onClick={() => setEditor({ collection: 'tickets' })}>
                <Ticket size={16} />
                Open support ticket
              </button>
              <AppLink to="/login">Account settings</AppLink>
            </div>
            <MembershipBilling />
            <h2>My orders</h2>
            <Orders orders={orders} level={1} onSaved={refresh} />
            <h2>My tickets</h2>
            {!loading && !data.tickets?.length && (
              <p className="ops-empty">No support requests yet.</p>
            )}
            {(data.tickets || []).map((ticket) => (
              <article className="order-record" key={ticket.id}>
                <strong>{String(ticket.subject)}</strong>
                <p>{String(ticket.message)}</p>
                <span className="ops-badge">{String(ticket.status)}</span>
              </article>
            ))}
          </>
        ) : module === 'overview' ? (
          <>
            <div className="ops-metrics">
              <div>
                <span>Paid sales</span>
                <strong>{money(total)}</strong>
              </div>
              <div>
                <span>Open orders</span>
                <strong>{openOrders.length}</strong>
              </div>
              <div>
                <span>Open tickets</span>
                <strong>
                  {(data.tickets || []).filter((t) => t.status !== 'resolved').length}
                </strong>
              </div>
              <div>
                <span>Low stock</span>
                <strong>
                  {
                    (data.inventory || []).filter((i) => Number(i.quantity) <= Number(i.reorderAt))
                      .length
                  }
                </strong>
              </div>
            </div>
            <div className="ops-actions">
              <AppLink className="ops-primary" to="/manage/pos">
                <Plus size={16} />
                New order
              </AppLink>
              <AppLink to="/manage/kitchen">Open kitchen</AppLink>
            </div>
            <h2>Active orders</h2>
            <Orders orders={openOrders} level={account.level} onSaved={refresh} />
          </>
        ) : ['orders', 'kitchen'].includes(module) ? (
          <Orders
            orders={orders}
            level={account.level}
            onSaved={refresh}
            kitchen={module === 'kitchen'}
          />
        ) : (
          <>
            {module === 'timeEntries' && (
              <div className="ops-actions">
                <button className="ops-primary" disabled={busy} onClick={clock}>
                  <Clock size={17} />
                  {ownClock ? 'Clock out' : 'Clock in'}
                </button>
                {ownClock && <span>Since {dateTime(ownClock.startedAt)}</span>}
              </div>
            )}
            {module === 'expenses' && (
              <div className="ops-metrics">
                <div>
                  <span>Paid order revenue</span>
                  <strong>{money(total)}</strong>
                </div>
                <div>
                  <span>Pending expenses</span>
                  <strong>
                    {money(
                      records
                        .filter((r) => r.status === 'pending')
                        .reduce((sum, r) => sum + Number(r.amountCents), 0),
                    )}
                  </strong>
                </div>
              </div>
            )}
            {module === 'menu' && (
              <div className="ops-actions">
                <button
                  disabled={!menuConnected}
                  className="ops-primary"
                  onClick={() => setEditor({ collection: 'menu' })}
                >
                  <Plus size={16} />
                  New menu item
                </button>
              </div>
            )}
            <div className="ops-toolbar">
              <input
                aria-label={`Search ${module}`}
                placeholder="Search records"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="ops-actions">
                <button title="Export CSV" onClick={() => exportCsv(module, shown)}>
                  <Download size={16} />
                  CSV
                </button>
                {editable.has(module) &&
                  module !== 'menu' &&
                  (module !== 'shifts' || account.level === 5) && (
                    <button
                      className="ops-primary"
                      onClick={() => setEditor({ collection: module })}
                    >
                      <Plus size={16} />
                      New record
                    </button>
                  )}
              </div>
            </div>
            <div
              className="ops-table-wrap"
              role="region"
              aria-label={`${selected?.label || module} records`}
              tabIndex={0}
            >
              <table>
                <thead>
                  <tr>
                    {columns[module]?.map((key) => (
                      <th scope="col" key={key}>
                        {labels[key] || key}
                      </th>
                    ))}
                    {(editable.has(module) || module === 'roles') && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {shown.map((record) => (
                    <tr key={record.id}>
                      {columns[module]?.map((key) => (
                        <td key={key}>{value(record, key)}</td>
                      ))}
                      {editable.has(module) && (
                        <td>
                          <button
                            disabled={
                              (module === 'shifts' && account.level < 5) ||
                              (module === 'menu' && !menuConnected)
                            }
                            aria-label={`Edit ${String(record.name || record.displayName || record.subject || record.id)}`}
                            title="Edit record"
                            onClick={() => setEditor({ collection: module, record })}
                          >
                            <Pencil size={16} />
                          </button>
                        </td>
                      )}
                      {module === 'roles' && (
                        <td>
                          <div className="role-actions">
                            <select
                              aria-label={`Account level for ${String(record.email)}`}
                              disabled={busy || record.id === account.user?.uid}
                              value={String(record.level)}
                              onChange={(e) => setRole(record, e.target.value)}
                            >
                              {[1, 2, 3, 4, 5].map((level) => (
                                <option key={level} value={level}>
                                  Level {level} -{' '}
                                  {['', 'Member', 'Pro', 'Diamond', 'Employee', 'Owner'][level]}
                                </option>
                              ))}
                            </select>
                            <button
                              disabled={busy || record.id === account.user?.uid}
                              onClick={() => toggleAccount(record)}
                            >
                              {record.disabled ? 'Enable access' : 'Disable access'}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!shown.length && !loading && (
              <p className="ops-empty">
                {search
                  ? 'No records match your search.'
                  : `No ${selected?.label.toLowerCase() || 'records'} yet.`}
              </p>
            )}
            <p className="ops-count" role="status">
              {shown.length} {shown.length === 1 ? 'record' : 'records'}
              {search ? ` of ${records.length}` : ''}
            </p>
          </>
        )}
        {(data[module === 'kitchen' ? 'orders' : module]?.length || 0) >= 500 &&
          !exhausted[module === 'kitchen' ? 'orders' : module] && (
            <button disabled={busy} onClick={loadMore}>
              Load more records
            </button>
          )}
        {(data[module === 'kitchen' ? 'orders' : module]?.length || 0) >= 500 && (
          <p className="ops-count">Totals and exports include currently loaded records.</p>
        )}
      </div>
      {editor && (
        <RecordEditor
          collection={editor.collection}
          record={editor.record}
          employees={data.employees}
          isStaff={account.level >= 4}
          onClose={() => setEditor(null)}
          onSaved={refresh}
        />
      )}
    </div>
  )
}
