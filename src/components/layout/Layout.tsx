import type { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

type LayoutProps = {
  children: ReactNode
  currentPath: string
}

export function Layout({ children, currentPath }: LayoutProps) {
  return (
    <div className="flex min-h-full flex-col bg-white text-neutral-950">
      <Navbar currentPath={currentPath} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
