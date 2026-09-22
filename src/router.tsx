import { useEffect, useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { NAVIGATION_EVENT, normalizePath } from '@/lib/navigation'
import { HomePage } from '@/pages/HomePage'
import { AboutPage } from '@/pages/AboutPage'
import { ServicesPage } from '@/pages/ServicesPage'
import { DocsPage } from '@/pages/DocsPage'
import { ContactPage } from '@/pages/ContactPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { BusinessPage } from '@/pages/BusinessPage'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useLanguage } from '@/i18n/useLanguage'

function getPathname() {
  return normalizePath(window.location.pathname)
}

function renderPage(pathname: string) {
  if (pathname === '/manage' || /^\/manage\/[^/]+$/.test(pathname))
    return <BusinessPage key={pathname} module={pathname.split('/')[2] || 'overview'} />
  if (pathname === '/account') return <BusinessPage customer module="orders" />
  if (pathname === '/order') return <BusinessPage customer module="pos" />
  switch (pathname) {
    case '/':
      return <HomePage />
    case '/about':
      return <AboutPage />
    case '/services':
      return <ServicesPage />
    case '/docs':
      return <DocsPage />
    case '/login':
      return <LoginPage />
    case '/contact':
      return <ContactPage />
    default:
      return <NotFoundPage />
  }
}

export function AppRouter() {
  const { t } = useLanguage()
  const [pathname, setPathname] = useState(getPathname)

  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Home',
      '/about': 'About',
      '/services': 'Full Menu',
      '/docs': 'Ordering & Help',
      '/contact': 'Contact',
      '/login': 'Account Settings',
      '/order': 'Order Online',
      '/account': 'My Account',
    }
    const moduleNames: Record<string, string> = {
      overview: 'Overview',
      pos: 'Point of Sale',
      orders: 'Orders',
      kitchen: 'Kitchen',
      menu: 'Menu Management',
      customers: 'Customers',
      tickets: 'Tickets',
      inventory: 'Inventory',
      employees: 'Staff & HR',
      shifts: 'Schedule',
      timeEntries: 'Time Clock',
      expenses: 'Billing & Expenses',
      content: 'Website CMS',
      roles: 'Account Access',
      audit: 'Audit Log',
    }
    const title =
      titles[pathname] ||
      (pathname.startsWith('/manage') ? moduleNames[pathname.split('/')[2] || 'overview'] : '') ||
      'Page Not Found'
    document.title = `${t(title)} | Bardo's Breakfast Burgers`
    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute(
        'content',
        pathname.startsWith('/manage') || ['/login', '/account', '/order'].includes(pathname)
          ? 'noindex,nofollow'
          : 'index,follow',
      )
  }, [pathname, t])

  useEffect(() => {
    const handleNavigation = () => setPathname(getPathname())

    window.addEventListener('popstate', handleNavigation)
    window.addEventListener(NAVIGATION_EVENT, handleNavigation)

    return () => {
      window.removeEventListener('popstate', handleNavigation)
      window.removeEventListener(NAVIGATION_EVENT, handleNavigation)
    }
  }, [])

  return (
    <Layout currentPath={pathname}>
      <ErrorBoundary key={pathname}>{renderPage(pathname)}</ErrorBoundary>
    </Layout>
  )
}
