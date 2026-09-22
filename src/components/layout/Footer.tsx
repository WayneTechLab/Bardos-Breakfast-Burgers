import { AppLink } from '@/components/navigation/AppLink'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer id="page-end" tabIndex={-1} className="site-footer">
      <div className="site-footer-inner mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-5 py-8 text-sm text-stone-300 sm:flex-row">
        <div>
          <p className="footer-motto">Good Food. Great Times.</p>
          <p>&copy; {year} Bardo's Breakfast &amp; Burgers. Salem, Oregon.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-4">
          <AppLink to="/about" className="hover:text-white">
            About
          </AppLink>
          <AppLink to="/services" className="hover:text-white">
            Menu
          </AppLink>
          <AppLink to="/docs" className="hover:text-white">
            Help
          </AppLink>
          <AppLink to="/contact" className="hover:text-white">
            Contact
          </AppLink>
        </nav>
      </div>
    </footer>
  )
}
