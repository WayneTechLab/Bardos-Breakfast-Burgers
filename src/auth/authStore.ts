import { onIdTokenChanged, type User } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { business, errorMessage } from '@/lib/business'
import { normalizeAccountLevel, type AccountLevel } from './accountLevels'

type AuthState = {
  user: User | null
  level: AccountLevel
  loading: boolean
  error: string
  stripeConfigured: boolean
  orderingEnabled: boolean
  billingEnabled: boolean
}
let state: AuthState = {
  user: null,
  level: 0,
  loading: Boolean(auth),
  error: '',
  stripeConfigured: false,
  orderingEnabled: false,
  billingEnabled: false,
}
const listeners = new Set<() => void>()
const publish = (next: AuthState) => {
  state = next
  listeners.forEach((listener) => listener())
}
let revision = 0
if (auth)
  onIdTokenChanged(auth, async (user) => {
    const current = ++revision
    if (!user || state.user?.uid !== user.uid)
      publish({
        user,
        level: 0,
        loading: Boolean(user),
        error: '',
        stripeConfigured: false,
        orderingEnabled: false,
        billingEnabled: false,
      })
    if (!user) return
    try {
      const session = await business<{
        level: number
        stripeConfigured: boolean
        orderingEnabled: boolean
        billingEnabled: boolean
      }>('session')
      if (current === revision)
        publish({
          user,
          level: normalizeAccountLevel(session.level),
          loading: false,
          error: '',
          stripeConfigured: session.stripeConfigured,
          orderingEnabled: session.orderingEnabled,
          billingEnabled: session.billingEnabled,
        })
    } catch (error) {
      if (current === revision)
        publish({
          user,
          level: 0,
          loading: false,
          error: errorMessage(error),
          stripeConfigured: false,
          orderingEnabled: false,
          billingEnabled: false,
        })
    }
  })
export const subscribeAuth = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
export const getAuthSnapshot = () => state
