import { useLanguage } from '@/i18n/useLanguage'
import { useEffect, useState, type ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

type LayoutProps = {
  children: ReactNode
  currentPath: string
}

export function Layout({ children, currentPath }: LayoutProps) {
  const { t } = useLanguage()
  const [offline, setOffline] = useState(!navigator.onLine)
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])
  return (
    <div
      className={`site-shell flex min-h-full flex-col ${currentPath.startsWith('/manage') ? 'staff-theme' : 'public-theme'}`}
    >
      <Navbar key={currentPath} currentPath={currentPath} />
      <main id="mainpoints" tabIndex={-1} className="flex-1 page-snap-point">
        {offline && (
          <p className="offline-notice" role="status">
            {t("You're offline. Orders and changes cannot be saved until your connection returns.")}
          </p>
        )}
        {children}
      </main>
      <Footer />
    </div>
  )
}
