import { useState } from 'react'
import { Printer, Search, Star, X } from 'lucide-react'
import { fullMenuCategories } from '@/data/fullMenu'
import { useMenu, type MenuItem } from '@/data/useMenu'
import { money } from '@/lib/business'
import { AppLink } from '@/components/navigation/AppLink'

function description(item: MenuItem) {
  if (item.descriptionApprovalStatus.startsWith('approved'))
    return item.description || item.sourceDescriptionExact
  if (item.description && item.description !== item.displayDescriptionDraft) return item.description
  return item.sourceDescriptionExact
}

export function ServicesPage() {
  const { items, error } = useMenu()
  const [search, setSearch] = useState('')
  const activeItems = items.filter((item) => item.active)
  const matches = (item: MenuItem) =>
    `${item.displayName} ${item.variantLabel} ${item.categoryName}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  const count = activeItems.filter(matches).length
  return (
    <section className="menu-page">
      <div className="public-wrap">
        <header className="menu-toolbar print:hidden">
          <div>
            <p className="eyebrow">Bardo's Breakfast Burgers</p>
            <h1>Full Menu</h1>
          </div>
          <div className="public-actions">
            <AppLink className="public-button" to="/order">
              Order online
            </AppLink>
            <button
              className="public-icon-button"
              title="Print full menu"
              aria-label="Print full menu"
              onClick={() => window.print()}
            >
              <Printer size={20} />
            </button>
          </div>
        </header>
        <div className="menu-filters print:hidden">
          <div className="search-field">
            <Search size={18} aria-hidden="true" />
            <input
              aria-label="Search full menu"
              placeholder="Search the menu"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button title="Clear search" aria-label="Clear search" onClick={() => setSearch('')}>
                <X size={18} />
              </button>
            )}
          </div>
          <label className="sr-only" htmlFor="menu-jump">
            Jump to menu section
          </label>
          <select
            id="menu-jump"
            value=""
            onChange={(e) => {
              setSearch('')
              const target = document.getElementById(e.target.value)
              history.pushState({}, '', `#${e.target.value}`)
              requestAnimationFrame(() => {
                target?.focus({ preventScroll: true })
                target?.scrollIntoView({ block: 'start', behavior: 'instant' })
              })
            }}
          >
            <option value="" disabled>
              Jump to a section
            </option>
            {fullMenuCategories.map((c) => (
              <option key={c.id} value={c.id.replaceAll('_', '-')}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p role="status" className="public-notice print:hidden">
            Live availability is temporarily unavailable. Please confirm prices and availability
            before ordering.
          </p>
        )}
        {search && (
          <p role="status" className="menu-results print:hidden">
            {count ? `${count} matching items` : 'No items match your search.'}
          </p>
        )}
        <div className="menu-print-surface brand-paper">
          <header className="paper-masthead">
            <img
              src="/assets/bardos-logo.png"
              alt="Bardo's, established 2014"
              width="144"
              height="144"
            />
            <div>
              <div className="brand-rule" aria-hidden="true">
                <Star size={16} fill="currentColor" />
              </div>
              <h2>Menu</h2>
              <p className="brand-ribbon">Breakfast &amp; Burgers</p>
              <p className="paper-motto">Good Food. Great Times.</p>
            </div>
          </header>
          <div className="menu-section-grid">
            {fullMenuCategories.map((category, index) => {
              const categoryItems = activeItems.filter((item) => item.categoryId === category.id)
              return (
                <section
                  key={category.id}
                  id={category.id.replaceAll('_', '-')}
                  data-page-section={category.name}
                  className={`menu-category ${categoryItems.some(matches) ? '' : 'menu-filtered'}`}
                >
                  <header className="menu-category-heading">
                    <span className="menu-section-number" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3>{category.name}</h3>
                    <Star size={18} fill="currentColor" aria-hidden="true" />
                  </header>
                  {!categoryItems.length && (
                    <p className="menu-description">No items available in this section.</p>
                  )}
                  <div className="menu-category-items">
                    {categoryItems.map((item) => (
                      <article
                        key={item.sku}
                        data-menu-sku={item.sku}
                        className={matches(item) ? '' : 'menu-filtered'}
                      >
                        <div className="menu-item-line">
                          <h4>
                            {item.displayName}
                            {item.foodSafetyAsterisk && <sup>*</sup>}
                            {item.variantLabel && <small>{item.variantLabel}</small>}
                          </h4>
                          <span className="menu-leader" aria-hidden="true" />
                          <strong>{money(item.priceCents)}</strong>
                        </div>
                        {description(item) && <p className="menu-description">{description(item)}</p>}
                        {!item.available && <span className="sold-out">Sold out</span>}
                      </article>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
          <footer className="paper-footer">
            <p className="paper-signoff">Great food. Great people. Great memories.</p>
            <p>
              * Please ask the restaurant about ingredients and preparation before ordering. Menu
              descriptions are not a complete allergen list.
            </p>
            <p>Prices in USD. Availability may vary.</p>
          </footer>
        </div>
      </div>
    </section>
  )
}
