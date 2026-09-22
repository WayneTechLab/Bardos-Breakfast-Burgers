import { useState } from 'react'
import { multiFactor, TotpMultiFactorGenerator, type TotpSecret, type User } from 'firebase/auth'
import { ShieldCheck } from 'lucide-react'
import { errorMessage } from '@/lib/business'
import { isLocalFirebase } from '@/config/firebase'

export function MfaSettings({ user }: { user: User }) {
  const [secret, setSecret] = useState<TotpSecret | null>(null)
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  async function setup() {
    setBusy(true)
    setMessage('')
    try {
      setSecret(await TotpMultiFactorGenerator.generateSecret(await multiFactor(user).getSession()))
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }
  async function enroll() {
    if (!secret) return
    setBusy(true)
    setMessage('')
    try {
      await multiFactor(user).enroll(
        TotpMultiFactorGenerator.assertionForEnrollment(secret, code),
        'Authenticator',
      )
      setSecret(null)
      setCode('')
      setMessage('Authenticator enrolled. Sign out, then sign in with your new second factor.')
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }
  if (isLocalFirebase)
    return (
      <p className="ops-notice" lang="en">
        MFA is bypassed only for this local emulator project. Staff and owner access require MFA in
        production.
      </p>
    )
  return (
    <section className="ops-form" lang="en">
      <h2>
        <ShieldCheck size={18} />
        Account security
      </h2>
      <p>
        {multiFactor(user).enrolledFactors.length
          ? 'Authenticator enrolled.'
          : 'No authenticator enrolled.'}
      </p>
      {!multiFactor(user).enrolledFactors.length && (
        <button disabled={busy || !user.emailVerified} onClick={setup}>
          Set up authenticator
        </button>
      )}
      {secret && (
        <>
          <p>Enter this key into your authenticator app:</p>
          <code className="break-all">{secret.secretKey}</code>
          <label>
            Authenticator code
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              maxLength={6}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>
          <button disabled={busy || code.length !== 6} onClick={enroll}>
            Confirm authenticator
          </button>
        </>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  )
}
