import { useSyncExternalStore } from 'react'
import { spanish } from './spanish'

export type Language = 'en' | 'es'
const storageKey = 'bardos.language'
const listeners = new Set<() => void>()

function readLanguage(): Language {
  try {
    return localStorage.getItem(storageKey) === 'es' ? 'es' : 'en'
  } catch {
    return 'en'
  }
}

let language = readLanguage()
document.documentElement.lang = language

function publish(next: Language) {
  language = next
  document.documentElement.lang = next
  listeners.forEach((listener) => listener())
}

function setLanguage(next: Language) {
  try {
    localStorage.setItem(storageKey, next)
  } catch {
    // Private browsing can deny storage; switching still works in this tab.
  }
  publish(next)
}

window.addEventListener('storage', (event) => {
  if (event.key === storageKey || event.key === null) publish(readLanguage())
})

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const translate = (text: string, locale: Language) =>
  locale === 'es' && Object.hasOwn(spanish, text) ? spanish[text] : text
const english = (text: string) => text
const inSpanish = (text: string) => translate(text, 'es')

export function useLanguage() {
  const locale = useSyncExternalStore(
    subscribe,
    () => language,
    () => 'en' as Language,
  )
  return { language: locale, setLanguage, t: locale === 'es' ? inSpanish : english }
}
