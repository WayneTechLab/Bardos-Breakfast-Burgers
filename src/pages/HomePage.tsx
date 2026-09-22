import { ArrowRight, Star, UtensilsCrossed } from 'lucide-react'
import { AppLink } from '@/components/navigation/AppLink'
import { PublishedContent } from '@/components/business/PublishedContent'
import { useMenu } from '@/data/useMenu'
import { money } from '@/lib/business'

const highlights = [
  {
    id: 'breakfast_specials',
    title: 'Breakfast Specials',
    note: 'Start with the breakfast board.',
  },
  { id: 'burgers', title: 'Burgers', note: 'Find your next favorite.' },
  { id: 'lunch', title: 'Lunch', note: 'Something for the rest of the day.' },
]

export function HomePage() {
  const { items } = useMenu()
  return (
    <>
      <section className="brand-masthead brand-paper">
        <img
          src="/assets/bardos-logo.png"
          alt="Bardo's, established 2014"
          width="180"
          height="180"
          fetchPriority="high"
        />
        <div className="brand-rule" aria-hidden="true">
          <Star size={16} fill="currentColor" />
        </div>
        <h1>Breakfast &amp; Burgers</h1>
        <p className="brand-ribbon">Good Food. Great Times.</p>
        <p className="masthead-intro">Great food. Great people. Great memories.</p>
        <div className="public-actions">
          <AppLink to="/services" className="public-button">
            <UtensilsCrossed size={18} />
            Full menu
          </AppLink>
          <AppLink to="/order" className="public-button secondary">
            Order online
            <ArrowRight size={18} />
          </AppLink>
        </div>
      </section>
      <section
        className="public-wrap menu-preview"
        id="on-the-menu"
        data-page-section="On the menu"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">From the menu</p>
            <h2>What sounds good?</h2>
          </div>
          <AppLink to="/services" className="text-link">
            All sections
            <ArrowRight size={17} />
          </AppLink>
        </div>
        <div className="menu-preview-grid">
          {highlights.map((category) => (
            <div key={category.id} className="menu-preview-column">
              <h3>
                <AppLink to={`/services#${category.id.replaceAll('_', '-')}`}>
                  {category.title}
                  <ArrowRight size={18} />
                </AppLink>
              </h3>
              <p>{category.note}</p>
              <ul>
                {items
                  .filter((item) => item.active && item.categoryId === category.id)
                  .slice(0, 3)
                  .map((item) => (
                    <li key={item.sku}>
                      <span>
                        {item.displayName}
                        {item.variantLabel && <small>{item.variantLabel}</small>}
                      </span>
                      <strong>{money(item.priceCents)}</strong>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <PublishedContent />
      <section className="public-band" id="get-in-touch" data-page-section="Get in touch">
        <div className="public-wrap section-heading">
          <div>
            <p className="eyebrow">Questions for Bardo's?</p>
            <h2>Let's talk.</h2>
            <p>Menu questions, order support, or a request for the restaurant team.</p>
          </div>
          <AppLink to="/contact" className="public-button">
            Contact us
            <ArrowRight size={18} />
          </AppLink>
        </div>
      </section>
    </>
  )
}
