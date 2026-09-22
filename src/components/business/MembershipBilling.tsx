import { useState } from 'react'
import { CreditCard } from 'lucide-react'
import { business, errorMessage } from '@/lib/business'
import { useAccountLevel } from '@/auth/useAccountLevel'

export function MembershipBilling() {
  const account = useAccountLevel()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function open(action: string, level?: number) {
    setBusy(true)
    setError('')
    try {
      const result = await business<{ url: string }>(action, {
        level,
        requestId: crypto.randomUUID(),
      })
      window.location.assign(result.url)
    } catch (error) {
      setError(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }
  return (
    <section>
      <h2>Membership & billing</h2>
      <p>
        Level {account.level} · {account.definition.label}
      </p>
      {!account.billingEnabled && (
        <p className="ops-count">Paid memberships are not currently available.</p>
      )}
      <div className="ops-actions">
        {[2, 3].map((level) => (
          <button
            key={level}
            disabled={busy || !account.billingEnabled || account.level >= 2}
            onClick={() => open('billing.subscribe', level)}
          >
            <CreditCard size={16} />
            {level === 2 ? 'Pro membership' : 'Diamond membership'}
          </button>
        ))}
        <button disabled={busy || !account.stripeConfigured} onClick={() => open('billing.portal')}>
          Manage billing
        </button>
      </div>
      {error && (
        <p className="ops-error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
