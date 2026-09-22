import { httpsCallable } from 'firebase/functions'
import { functions } from '@/config/firebase'

export async function business<T = Record<string, unknown>>(
  action: string,
  payload: unknown = {},
): Promise<T> {
  if (!functions) throw new Error('Firebase is not configured.')
  const result = await httpsCallable<unknown, T>(functions, 'business')({ action, payload })
  return result.data
}
export type BusinessRecord = { id: string; [key: string]: unknown }
export type Workspace = Record<string, BusinessRecord[]>
export const money = (cents: unknown) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    Number(cents || 0) / 100,
  )
export const dateTime = (value: unknown) => {
  const date = value ? new Date(String(value)) : null
  return date && Number.isFinite(date.getTime()) ? date.toLocaleString() : '-'
}
export const errorMessage = (error: unknown) => {
  const code = (error as { code?: string })?.code || ''
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'Email or password is incorrect. Please try again.',
    'auth/wrong-password': 'Email or password is incorrect. Please try again.',
    'auth/user-not-found': 'Email or password is incorrect. Please try again.',
    'auth/email-already-in-use':
      'Unable to create this account. Try signing in or resetting your password.',
    'auth/weak-password': 'Choose a stronger password with at least 12 characters.',
    'auth/popup-closed-by-user': 'Google sign-in was closed. You can try again.',
    'auth/popup-blocked': 'Your browser blocked sign-in. Allow popups for this site and try again.',
    'auth/network-request-failed': 'Connection unavailable. Check your network and try again.',
    'auth/too-many-requests': 'Too many attempts. Please wait before trying again.',
    'functions/unavailable': 'The service is temporarily unavailable. Please try again.',
    'functions/internal': 'The request could not be completed. Please try again.',
    'functions/deadline-exceeded':
      'The request timed out. Check your records before submitting again.',
  }
  return (
    messages[code] ||
    (error instanceof Error ? error.message : 'The operation failed. Please try again.')
  )
}
