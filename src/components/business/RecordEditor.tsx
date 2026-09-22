import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Save, X } from 'lucide-react'
import { business, errorMessage, type BusinessRecord } from '@/lib/business'
import { fullMenuCategories } from '@/data/fullMenu'

type Field = { key: string; label: string; type?: string; options?: string[]; optional?: boolean }
const recordFields: Record<string, Field[]> = {
  customers: [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email', type: 'email', optional: true },
    { key: 'phone', label: 'Phone', optional: true },
    { key: 'notes', label: 'Notes', type: 'textarea', optional: true },
    { key: 'marketingConsent', label: 'Marketing consent received', type: 'checkbox' },
  ],
  tickets: [
    { key: 'subject', label: 'Subject' },
    { key: 'message', label: 'Message', type: 'textarea' },
    { key: 'priority', label: 'Priority', options: ['normal', 'high'] },
    { key: 'status', label: 'Status', options: ['open', 'in-progress', 'resolved'] },
  ],
  inventory: [
    { key: 'name', label: 'Item name' },
    { key: 'unit', label: 'Unit', options: ['each', 'kg', 'lb', 'litre', 'case'] },
    { key: 'quantity', label: 'On hand', type: 'number' },
    { key: 'reorderAt', label: 'Reorder at', type: 'number' },
  ],
  employees: [
    { key: 'name', label: 'Employee name' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'jobTitle', label: 'Job title' },
    { key: 'status', label: 'Status', options: ['active', 'on-leave', 'inactive'] },
    { key: 'hourlyRateCents', label: 'Hourly rate ($)', type: 'money' },
    { key: 'notes', label: 'Private HR notes', type: 'textarea', optional: true },
  ],
  shifts: [
    { key: 'employeeId', label: 'Employee' },
    { key: 'startsAt', label: 'Starts', type: 'datetime-local' },
    { key: 'endsAt', label: 'Ends', type: 'datetime-local' },
    { key: 'station', label: 'Station' },
  ],
  expenses: [
    { key: 'vendor', label: 'Vendor' },
    {
      key: 'category',
      label: 'Category',
      options: ['supplies', 'rent', 'utilities', 'payroll', 'other'],
    },
    { key: 'amountCents', label: 'Amount ($)', type: 'money' },
    { key: 'dueDate', label: 'Due date', type: 'date' },
    { key: 'status', label: 'Status', options: ['pending', 'paid'] },
    { key: 'reference', label: 'Invoice / reference', optional: true },
  ],
  content: [
    { key: 'headline', label: 'Headline' },
    { key: 'body', label: 'Body', type: 'textarea' },
    { key: 'published', label: 'Published', type: 'checkbox' },
  ],
  menu: [
    { key: 'displayName', label: 'Menu name' },
    { key: 'description', label: 'Description', type: 'textarea', optional: true },
    { key: 'priceCents', label: 'Price ($)', type: 'money' },
    { key: 'active', label: 'Published on menu', type: 'checkbox' },
    { key: 'available', label: 'Available to order', type: 'checkbox' },
  ],
}
function localDate(value: unknown) {
  if (!value) return ''
  const date = new Date(String(value))
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
export function RecordEditor({
  collection,
  record,
  employees = [],
  isStaff = true,
  onClose,
  onSaved,
}: {
  collection: string
  record?: BusinessRecord
  employees?: BusinessRecord[]
  isStaff?: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)
  function close() {
    if (busy || (dirty && !window.confirm('Discard your unsaved changes?'))) return
    onClose()
  }
  useEffect(() => {
    dialog.current?.showModal()
  }, [])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const values: Record<string, unknown> = {}
    for (const field of recordFields[collection]) {
      const raw = form.get(field.key)
      values[field.key] =
        field.type === 'checkbox'
          ? raw === 'on'
          : field.type === 'money'
            ? Math.round(Number(raw) * 100)
            : field.type === 'number'
              ? Number(raw)
              : field.type === 'datetime-local'
                ? new Date(String(raw)).toISOString()
                : String(raw || '')
    }
    setBusy(true)
    setError('')
    try {
      if (collection === 'menu') {
        if (record)
          await business('menu.save', { ...values, id: record.id, revision: record.revision || 0 })
        else await business('menu.create', { ...values, categoryId: form.get('categoryId') })
      } else await business('save', { collection, id: record?.id, values })
      onSaved()
      onClose()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <dialog
      ref={dialog}
      className="ops-dialog ops"
      aria-labelledby="record-editor-title"
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
    >
      <div className="ops-toolbar">
        <h2 id="record-editor-title">
          {record ? 'Edit' : 'New'}{' '}
          {collection === 'menu' ? 'menu item' : collection.replace(/s$/, '')}
        </h2>
        <button
          type="button"
          disabled={busy}
          onClick={close}
          aria-label="Close editor"
          title="Close"
        >
          <X size={20} />
        </button>
      </div>
      <form onSubmit={submit} onChange={() => setDirty(true)}>
        <fieldset disabled={busy} className="ops-form">
          {collection === 'menu' && !record && (
            <label>
              Category
              <select name="categoryId" required>
                {fullMenuCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {recordFields[collection].map((field) => {
            let value = record?.[field.key] ?? field.options?.[0] ?? ''
            if (field.type === 'money' && value !== '') value = Number(value) / 100
            if (field.type === 'datetime-local') value = localDate(value)
            return (
              <label key={field.key} className={field.type === 'checkbox' ? 'ops-check' : ''}>
                {field.label}
                {field.type === 'checkbox' ? (
                  <input type="checkbox" name={field.key} defaultChecked={Boolean(value)} />
                ) : field.key === 'employeeId' ? (
                  <select required name={field.key} defaultValue={String(value)}>
                    <option value="">Choose employee</option>
                    {employees
                      .filter((e) => e.status === 'active' || e.id === value)
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {String(e.name)}
                        </option>
                      ))}
                  </select>
                ) : field.options ? (
                  <select
                    name={field.key}
                    defaultValue={String(value)}
                    disabled={!isStaff && field.key === 'status'}
                  >
                    {field.options.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    name={field.key}
                    rows={4}
                    maxLength={collection === 'content' ? 2000 : 3000}
                    required={!field.optional}
                    defaultValue={String(value)}
                  />
                ) : (
                  <input
                    name={field.key}
                    type={field.type === 'money' ? 'number' : field.type || 'text'}
                    min={field.type === 'money' || field.type === 'number' ? 0 : undefined}
                    step={field.type === 'money' || field.type === 'number' ? '.01' : undefined}
                    required={!field.optional}
                    defaultValue={String(value)}
                  />
                )}
              </label>
            )
          })}
          {!isStaff && collection === 'tickets' && (
            <input type="hidden" name="status" value="open" />
          )}
          {error && (
            <p className="ops-error" role="alert">
              {error}
            </p>
          )}
          <button className="ops-primary" disabled={busy}>
            <Save size={16} />
            {busy ? 'Saving...' : 'Save'}
          </button>
        </fieldset>
      </form>
    </dialog>
  )
}
