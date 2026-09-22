import { useState, type FormEvent } from 'react'
import { CheckCircle2, Send } from 'lucide-react'
import { business, errorMessage } from '@/lib/business'
import { useAccountLevel } from '@/auth/useAccountLevel'
import { AppLink } from '@/components/navigation/AppLink'

export function ContactPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const account = useAccountLevel()
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setBusy(true)
    setError('')
    try {
      await business('save', {
        collection: 'tickets',
        values: {
          subject: String(data.get('subject')),
          message: String(data.get('message')),
          priority: 'normal',
          status: 'open',
        },
      })
      setSent(true)
    } catch (error) {
      setError(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }
  return (
    <article className="public-wrap public-page">
      <header className="public-intro">
        <p className="eyebrow">Contact Bardo's</p>
        <h1>Talk to the team.</h1>
        <p>Questions about the menu, an order, or a request for the restaurant.</p>
      </header>
      <div className="contact-grid">
        <section id="contact-form" data-page-section="Send a request" className="ops">
          <h2>Send a request</h2>
          {account.loading ? (
            <p role="status">Checking your account...</p>
          ) : !account.user ? (
            <div className="contact-signin">
              <p>Sign in to send a private request to the restaurant.</p>
              <AppLink to="/login" className="public-button">
                Sign in
              </AppLink>
              <AppLink to="/docs" className="text-link">
                Ordering &amp; help
              </AppLink>
            </div>
          ) : sent ? (
            <div className="contact-success" role="status">
              <CheckCircle2 size={28} />
              <h3>Request received</h3>
              <p>Your request is saved in your account.</p>
              <AppLink to="/account" className="text-link">
                View my tickets
              </AppLink>
              <button onClick={() => setSent(false)}>Send another request</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="ops-form">
              <p className="contact-identity">From {account.user.email}</p>
              <label>
                Subject
                <input name="subject" required maxLength={160} disabled={busy} />
              </label>
              <label>
                Message
                <textarea name="message" required rows={6} maxLength={3000} disabled={busy} />
              </label>
              <button type="submit" className="ops-primary" disabled={busy || !!account.error}>
                <Send size={17} />
                {busy ? 'Sending...' : 'Send message'}
              </button>
              {(error || account.error) && (
                <p role="alert" className="ops-error">
                  {error || account.error}
                </p>
              )}
            </form>
          )}
        </section>
        <aside
          id="restaurant-details"
          data-page-section="Restaurant details"
          className="contact-details"
        >
          <p className="eyebrow">Salem, Oregon</p>
          <h2>Before you visit</h2>
          <p>Current hours, street address, and telephone details are awaiting confirmation.</p>
          <hr />
          <h2>About an existing order?</h2>
          <p>Include your order number in your message. Please do not send payment card details.</p>
          <AppLink to="/account" className="text-link">
            My orders
          </AppLink>
        </aside>
      </div>
    </article>
  )
}
