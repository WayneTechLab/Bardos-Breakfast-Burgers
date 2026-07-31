import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { AppLink } from '@/components/navigation/AppLink'
import { isActivePath } from '@/lib/navigation'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/docs', label: 'Docs' },
  { to: '/login', label: 'Login' },
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
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <AppLink to="/" className="flex items-center gap-2 font-bold">
          <span className="grid h-8 w-8 place-items-center rounded border border-neutral-950 bg-neutral-950 text-xs font-semibold text-white">
            W
          </span>
          <span>Web Stack Generation</span>
        </AppLink>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-neutral-600 hover:bg-neutral-100"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-neutral-200 px-4 pb-3">
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
