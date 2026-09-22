import { Component, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { AppLink } from '@/components/navigation/AppLink'

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <section className="ops ops-gate" role="alert">
        <h1>This page couldn't load</h1>
        <p>Please reload the page. Any saved records will still be available.</p>
        <button onClick={() => window.location.reload()}>
          <RefreshCw size={17} />
          Reload
        </button>
        <AppLink to="/">Back to home</AppLink>
      </section>
    )
  }
}
