import { useState } from 'react'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { AppLink } from '@/components/navigation/AppLink'
import { isActivePath } from '@/lib/navigation'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Menu' },
  { to: '/docs', label: 'Docs' },
  { to: '/login', label: 'Rewards' },
  { to: '/contact', label: 'Contact' },
]

type NavbarProps = {
  currentPath: string
}

export function Navbar({ currentPath }: NavbarProps) {
  const [open, setOpen] = useState(false)

  const linkClass = (isActive: boolean) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-neutral-950 text-white'
        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <AppLink to="/" className="flex min-w-0 items-center gap-3 font-bold">
          <img
            src="/assets/bardos-logo.png"
            alt="Bardo's Breakfast Burgers"
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
          <span className="truncate text-base sm:text-lg">Bardo's Breakfast Burgers</span>
        </AppLink>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <AppLink
              key={l.to}
              to={l.to}
              className={linkClass(isActivePath(currentPath, l.to, l.end))}
            >
              {l.label}
            </AppLink>
          ))}
          <AppLink
            to="/contact"
            className="ml-2 inline-flex items-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
          >
            <ShoppingBag className="h-4 w-4" />
            Order
          </AppLink>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-neutral-600 hover:bg-neutral-100 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-stone-200 px-4 pb-3 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 pt-2">
            {links.map((l) => (
              <AppLink
                key={l.to}
                to={l.to}
                className={linkClass(isActivePath(currentPath, l.to, l.end))}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </AppLink>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
