import { useLanguage } from '@/i18n/useLanguage'
import { useState, type FormEvent } from 'react'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  getMultiFactorResolver,
  TotpMultiFactorGenerator,
  type MultiFactorError,
  type MultiFactorResolver,
} from 'firebase/auth'
import { Eye, EyeOff, LogIn, LogOut, Mail, RefreshCw } from 'lucide-react'
import { auth, isLocalFirebase } from '@/config/firebase'
import { useAccountLevel } from '@/auth/useAccountLevel'
import { AppLink } from '@/components/navigation/AppLink'
import { errorMessage } from '@/lib/business'
import { MfaSettings } from '@/components/business/MfaSettings'

export function LoginPage() {
  const { t } = useLanguage()
  const account = useAccountLevel()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [register, setRegister] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resolver, setResolver] = useState<MultiFactorResolver | null>(null)
  const [otp, setOtp] = useState('')
  async function run(task: () => Promise<unknown>) {
    setBusy(true)
    setMessage('')
    setFailed(false)
    try {
      await task()
    } catch (e) {
      if ((e as MultiFactorError).code === 'auth/multi-factor-auth-required')
        setResolver(getMultiFactorResolver(auth!, e as MultiFactorError))
      else {
        setFailed(true)
        setMessage(errorMessage(e))
      }
    } finally {
      setBusy(false)
    }
  }
  function submit(e: FormEvent) {
    e.preventDefault()
    if (!auth) return
    void run(async () => {
      if (register) {
        const result = await createUserWithEmailAndPassword(auth!, email, password)
        await sendEmailVerification(result.user)
      } else await signInWithEmailAndPassword(auth!, email, password)
    })
  }
  return (
    <section className="login-page ops">
      <img src="/assets/bardos-logo.png" alt="Bardo's" width="112" height="112" />
      <h1>{t(account.user ? 'Your account' : register ? 'Create an account' : 'Welcome back')}</h1>
      {isLocalFirebase && <p className="ops-notice">{t('Local Firebase development')}</p>}
      {(message || account.error) && (
        <p
          role={failed || account.error ? 'alert' : 'status'}
          className={failed || account.error ? 'ops-error' : 'ops-notice'}
        >
          {t(message || account.error || '')}
        </p>
      )}
      {resolver && (
        <div className="ops-form">
          <label>
            {t('Authenticator code')}
            <input
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </label>
          <button
            disabled={busy || otp.length !== 6}
            onClick={() =>
              run(async () => {
                const hint = resolver.hints.find(
                  (hint) => hint.factorId === TotpMultiFactorGenerator.FACTOR_ID,
                )
                if (!hint)
                  throw new Error(
                    'This account requires a different second factor. Contact the owner.',
                  )
                await resolver.resolveSignIn(
                  TotpMultiFactorGenerator.assertionForSignIn(hint.uid, otp),
                )
                setResolver(null)
                setOtp('')
              })
            }
          >
            {t('Verify and sign in')}
          </button>
        </div>
      )}
      {!auth ? (
        <p role="status">{t('Sign-in is currently unavailable. Please try again later.')}</p>
      ) : account.loading ? (
        <p role="status">{t('Checking your account...')}</p>
      ) : account.user ? (
        <>
          <p>{account.user.email}</p>
          <p>
            {t('Level')} {account.level} · {t(account.definition.label)}
          </p>
          <div className="ops-actions">
            <AppLink className="ops-primary" to={account.level >= 4 ? '/manage' : '/account'}>
              {t(account.level >= 4 ? 'Open restaurant workspace' : 'Open my orders')}
            </AppLink>
            <button disabled={busy} onClick={() => run(() => signOut(auth!))}>
              <LogOut size={16} />
              {t('Sign out')}
            </button>
          </div>
          {!account.user.emailVerified && (
            <button
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await sendEmailVerification(account.user!)
                  setMessage('Verification email requested.')
                })
              }
            >
              <Mail size={16} />
              {t('Verify email')}
            </button>
          )}
          <MfaSettings user={account.user} />
          {(account.error || !account.user.emailVerified) && (
            <button
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await account.user!.reload()
                  await account.user!.getIdToken(true)
                  setMessage('Account status refreshed.')
                })
              }
            >
              <RefreshCw size={16} />
              {t('Recheck account')}
            </button>
          )}
        </>
      ) : !resolver ? (
        <>
          <form onSubmit={submit} className="ops-form">
            <label>
              {t('Email')}
              <input
                required
                disabled={busy}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              {t('Password')}
              <span className="password-field">
                <input
                  required
                  disabled={busy}
                  minLength={register ? 12 : 1}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={register ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  disabled={busy}
                  aria-label={t(showPassword ? 'Hide password' : 'Show password')}
                  title={t(showPassword ? 'Hide password' : 'Show password')}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
              {register && <small>{t('At least 12 characters.')}</small>}
            </label>
            <button className="ops-primary" disabled={busy}>
              <LogIn size={16} />
              {t(busy ? 'Please wait...' : register ? 'Create account' : 'Sign in')}
            </button>
          </form>
          <button
            disabled={busy}
            onClick={() => run(() => signInWithPopup(auth!, new GoogleAuthProvider()))}
          >
            {t('Continue with Google')}
          </button>
          <div className="ops-actions">
            <button
              disabled={busy}
              onClick={() => {
                setRegister(!register)
                setMessage('')
              }}
            >
              {t(register ? 'Use existing account' : 'Create account')}
            </button>
            <button
              disabled={!email || busy}
              onClick={() =>
                run(async () => {
                  await sendPasswordResetEmail(auth!, email)
                  setMessage('If the account exists, a reset email has been requested.')
                })
              }
            >
              {t('Reset password')}
            </button>
          </div>
        </>
      ) : (
        <button
          disabled={busy}
          onClick={() => {
            setResolver(null)
            setOtp('')
            setMessage('')
          }}
        >
          {t('Back to sign in')}
        </button>
      )}
    </section>
  )
}
