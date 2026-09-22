import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  List,
  Languages,
  Menu,
  Printer,
  Settings,
  X,
} from 'lucide-react'
import { AppLink } from '@/components/navigation/AppLink'
import { isActivePath } from '@/lib/navigation'
import { useAccountLevel } from '@/auth/useAccountLevel'
import { useLanguage } from '@/i18n/useLanguage'

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Menu' },
  { to: '/docs', label: 'Ordering & help' },
  { to: '/contact', label: 'Contact' },
]
type Section = { id: string; label: string; element: HTMLElement }
type Panel = 'sections' | 'site' | 'controls'

export function Navbar({ currentPath }: { currentPath: string }) {
  const { language, setLanguage, t } = useLanguage()
  const account = useAccountLevel()
  const [panel, setPanel] = useState<Panel | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [active, setActive] = useState('mainpoints')
  const root = useRef<HTMLDivElement>(null)
  const header = useRef<HTMLElement>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const main = document.querySelector('main')!
    let all: Section[] = [{ id: 'mainpoints', label: t('Overview'), element: main }]
    let discoveryFrame = 0
    let restoredHash = ''
    let followInitialHash = Boolean(window.location.hash)
    const releaseInitialHash = () => {
      followInitialHash = false
    }
    const discover = () => {
      // Use explicit sections when supplied, or derive anchors from page headings.
      const explicit = Array.from(main.querySelectorAll<HTMLElement>('[data-page-section]'))
      const targets = (
        explicit.length ? explicit : Array.from(main.querySelectorAll<HTMLElement>('h2, h3'))
      ).filter((element) => element.getClientRects().length > 0)
      const used = new Set(
        Array.from(document.querySelectorAll<HTMLElement>('[id]'))
          .filter((element) => !targets.includes(element))
          .map((element) => element.id),
      )
      const discovered = targets.map((element) => {
        const label = element.dataset.pageSection || element.textContent?.trim() || t('Section')
        const base =
          element.id ||
          label
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
        let id = base
        let suffix = 2
        while (used.has(id)) id = `${base}-${suffix++}`
        used.add(id)
        element.id = id
        element.tabIndex = -1
        element.classList.add('page-snap-point')
        return { id, label, element }
      })
      all = [{ id: 'mainpoints', label: t('Overview'), element: main }, ...discovered]
      cancelAnimationFrame(discoveryFrame)
      discoveryFrame = requestAnimationFrame(() => {
        setSections(all)
        if (followInitialHash || window.location.hash !== restoredHash) restoreHash()
      })
    }
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const snapLine = (header.current?.getBoundingClientRect().bottom || 128) + 54
        const reached = all.filter((s) => s.element.getBoundingClientRect().top <= snapLine)
        const last = reached.at(-1) || all[0]
        const linked = all.find((s) => `#${s.id}` === window.location.hash)
        // Adjacent desktop columns share a scroll position; retain the chosen anchor.
        const sameRow =
          linked &&
          Math.abs(
            linked.element.getBoundingClientRect().top - last.element.getBoundingClientRect().top,
          ) < 2
        setActive(sameRow ? linked.id : last.id)
      })
    }
    const restoreHash = () => {
      let id: string
      try {
        id = decodeURIComponent(window.location.hash.slice(1))
      } catch {
        return
      }
      const target = all.find((s) => s.id === id)
      target?.element.scrollIntoView({ behavior: 'instant', block: 'start' })
      if (target) restoredHash = window.location.hash
      update()
    }
    discover()
    const observer = new MutationObserver(discover)
    observer.observe(main, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['data-page-section'],
    })
    const resizeObserver = new ResizeObserver(() => {
      if (followInitialHash) restoreHash()
    })
    resizeObserver.observe(main)
    window.addEventListener('wheel', releaseInitialHash, { passive: true })
    window.addEventListener('touchstart', releaseInitialHash, { passive: true })
    window.addEventListener('pointerdown', releaseInitialHash)
    window.addEventListener('keydown', releaseInitialHash)
    window.addEventListener('resize', discover)
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('hashchange', restoreHash)
    window.addEventListener('popstate', restoreHash)
    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(discoveryFrame)
      observer.disconnect()
      resizeObserver.disconnect()
      window.removeEventListener('wheel', releaseInitialHash)
      window.removeEventListener('touchstart', releaseInitialHash)
      window.removeEventListener('pointerdown', releaseInitialHash)
      window.removeEventListener('keydown', releaseInitialHash)
      window.removeEventListener('resize', discover)
      window.removeEventListener('scroll', update)
      window.removeEventListener('hashchange', restoreHash)
      window.removeEventListener('popstate', restoreHash)
    }
  }, [currentPath, t])

  useEffect(() => {
    if (!panel) return
    root.current
      ?.querySelector<HTMLElement>(
        `#corner-${panel} a, #corner-${panel} select, #corner-${panel} button:not(:disabled)`,
      )
      ?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPanel(null)
        trigger.current?.focus()
      }
    }
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setPanel(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [panel])

  function jump(section: Section) {
    if (window.location.hash !== `#${section.id}`)
      window.history.pushState({}, '', `#${section.id}`)
    section.element.focus({ preventScroll: true })
    section.element.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'start',
    })
    setActive(section.id)
    setPanel(null)
  }

  function toggleButton(kind: Panel, label: string, icon: ReactNode) {
    return (
      <button
        type="button"
        className="corner-button"
        aria-label={t(label)}
        title={t(label)}
        aria-expanded={panel === kind}
        aria-controls={panel === kind ? `corner-${kind}` : undefined}
        onClick={(event) => {
          trigger.current = event.currentTarget
          setPanel(panel === kind ? null : kind)
        }}
      >
        {panel === kind ? <X size={21} /> : icon}
      </button>
    )
  }

  const activeIndex = Math.max(
    0,
    sections.findIndex((s) => s.id === active),
  )
  return (
    <div ref={root} className="site-navigation print:hidden">
      <header ref={header} className="site-header">
        <a className="skip-link" href="#mainpoints">
          {t('Skip to content')}
        </a>
        <div className="corner-brand-stack">
          <AppLink
            to="/"
            className="header-logo"
            aria-label={t('Home')}
            onClick={() => setPanel(null)}
          >
            <img
              src="/assets/bardos-logo.png"
              alt="Bardo's Breakfast & Burgers"
              width="52"
              height="52"
            />
          </AppLink>
        </div>
        <AppLink to="/" className="site-brand" onClick={() => setPanel(null)}>
          <span>
            Bardo's <span className="brand-subtitle">{t('Breakfast & Burgers')}</span>
          </span>
        </AppLink>
        <div className="corner-right">
          {toggleButton('site', 'Site menu', <Menu size={23} />)}
          {panel === 'site' && (
            <nav id="corner-site" className="corner-panel" aria-label={t('Site navigation')}>
              <p className="corner-title">Bardo's</p>
              {links.map((link) => (
                <AppLink
                  key={link.to}
                  to={link.to}
                  aria-current={isActivePath(currentPath, link.to) ? 'page' : undefined}
                  onClick={() => setPanel(null)}
                >
                  {t(link.label)}
                </AppLink>
              ))}
              <AppLink to="/order" onClick={() => setPanel(null)}>
                {t('Order online')}
              </AppLink>
              <AppLink to={account.user ? '/account' : '/login'} onClick={() => setPanel(null)}>
                {t(account.user ? 'My account' : 'Sign in')}
              </AppLink>
              {account.level >= 4 && (
                <AppLink to="/manage" onClick={() => setPanel(null)}>
                  {t('Restaurant workspace')}
                </AppLink>
              )}
            </nav>
          )}
        </div>
      </header>
      <div className="corner-left">
        {toggleButton('sections', 'On this page', <List size={21} />)}
        {panel === 'sections' && (
          <nav id="corner-sections" className="corner-panel" aria-label={t('On this page')}>
            <p className="corner-title">
              {t(currentPath === '/services' ? 'Menu sections' : 'On this page')}
            </p>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-current={active === s.id ? 'location' : undefined}
                onClick={(event) => {
                  if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                    event.preventDefault()
                    jump(s)
                  }
                }}
              >
                {s.label}
              </a>
            ))}
          </nav>
        )}
      </div>
      <div className="corner-bottom">
        <p className="corner-current" aria-hidden="true">
          {sections[activeIndex]?.label || t('Overview')}
        </p>
        {panel === 'controls' && (
          <div
            id="corner-controls"
            className="corner-panel"
            role="group"
            aria-label={t('Page controls')}
          >
            <label className="corner-language" htmlFor="site-language">
              <span>
                <Languages size={18} aria-hidden="true" />
                {t('Language')}
              </span>
              <select
                id="site-language"
                value={language}
                onChange={(event) => setLanguage(event.target.value === 'es' ? 'es' : 'en')}
              >
                <option value="en" lang="en">
                  English
                </option>
                <option value="es" lang="es">
                  Español
                </option>
              </select>
            </label>
            <p className="corner-title">{t('Page controls')}</p>
            <button onClick={() => sections[0] && jump(sections[0])}>
              <ArrowUpToLine size={18} />
              {t('Back to top')}
            </button>
            <button disabled={activeIndex === 0} onClick={() => jump(sections[activeIndex - 1])}>
              <ArrowUp size={18} />
              {t('Previous section')}
            </button>
            <button
              disabled={activeIndex >= sections.length - 1}
              onClick={() => jump(sections[activeIndex + 1])}
            >
              <ArrowDown size={18} />
              {t('Next section')}
            </button>
            <button
              onClick={() => {
                const footer = document.getElementById('page-end')!
                footer.focus({ preventScroll: true })
                footer.scrollIntoView({
                  behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                    ? 'instant'
                    : 'smooth',
                })
                setPanel(null)
              }}
            >
              <ArrowDownToLine size={18} />
              {t('Bottom of page')}
            </button>
            <button
              onClick={() => {
                setPanel(null)
                window.print()
              }}
            >
              <Printer size={18} />
              {t('Print page')}
            </button>
          </div>
        )}
        {toggleButton('controls', 'Page controls', <Settings size={21} />)}
      </div>
    </div>
  )
}
