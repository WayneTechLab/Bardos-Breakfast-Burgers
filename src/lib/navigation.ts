export const NAVIGATION_EVENT = 'sfwa-wtl:navigation'

export function normalizePath(pathname: string) {
  if (!pathname || pathname === '/') return '/'
  return pathname.replace(/\/+$/, '') || '/'
}

export function isActivePath(currentPath: string, targetPath: string, end = false) {
  const current = normalizePath(currentPath)
  const target = normalizePath(targetPath)

  if (target === '/') return current === '/'
  return end ? current === target : current === target || current.startsWith(`${target}/`)
}

export function navigate(to: string) {
  const target = to.startsWith('/') ? to : `/${to}`
  window.history.pushState({}, '', target)
  window.dispatchEvent(new Event(NAVIGATION_EVENT))
  requestAnimationFrame(() => {
    let id = 'mainpoints'
    try {
      id = decodeURIComponent(window.location.hash.slice(1)) || id
    } catch {
      /* Use the page start for malformed hashes. */
    }
    const target = document.getElementById(id)
    target?.focus({ preventScroll: true })
    target?.scrollIntoView({ block: 'start', behavior: 'instant' })
  })
}
