import { useLanguage } from '@/i18n/useLanguage'
import { AppLink } from '@/components/navigation/AppLink'

export function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()
  return (
    <footer id="page-end" tabIndex={-1} className="site-footer">
      <div className="site-footer-inner mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-5 py-8 text-sm text-stone-300 sm:flex-row">
        <div>
          <p className="footer-motto">{t('Good Food. Great Times.')}</p>
          <p>&copy; {year} Bardo's Breakfast &amp; Burgers. Salem, Oregon.</p>
        </div>
        <nav aria-label={t('Footer')} className="flex flex-wrap gap-4">
          <AppLink to="/about" className="hover:text-white">
            {t('About')}
          </AppLink>
          <AppLink to="/services" className="hover:text-white">
            {t('Menu')}
          </AppLink>
          <AppLink to="/docs" className="hover:text-white">
            {t('Help')}
          </AppLink>
          <AppLink to="/contact" className="hover:text-white">
            {t('Contact')}
          </AppLink>
        </nav>
      </div>
    </footer>
  )
}
