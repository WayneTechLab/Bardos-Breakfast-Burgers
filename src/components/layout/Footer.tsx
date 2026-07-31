import { AppLink } from '@/components/navigation/AppLink'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-stone-200 bg-stone-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-stone-300 sm:flex-row">
        <p>&copy; {year} Bardo's Breakfast Burgers. Salem, Oregon.</p>
        <div className="flex gap-4">
          <AppLink to="/about" className="hover:text-white">
            About
          </AppLink>
          <AppLink to="/services" className="hover:text-white">
            Menu
          </AppLink>
          <AppLink to="/docs" className="hover:text-white">
            Docs
          </AppLink>
          <AppLink to="/contact" className="hover:text-white">
            Contact
          </AppLink>
        </div>
      </div>
    </footer>
  )
}
