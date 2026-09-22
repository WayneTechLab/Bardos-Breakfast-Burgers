import { ArrowRight } from 'lucide-react'
import { AppLink } from '@/components/navigation/AppLink'

export function AboutPage() {
  return (
    <article className="public-wrap public-page">
      <header className="public-intro">
        <p className="eyebrow">Salem, Oregon</p>
        <h1>About Bardo's</h1>
        <p>Breakfast specials. Burgers. A menu with plenty to choose from.</p>
      </header>
      <section className="editorial-row" id="our-menu" data-page-section="Our menu">
        <h2>Breakfast to lunch</h2>
        <div>
          <p>
            Explore breakfast plates and omelets, burgers and sandwiches, wraps, salads, sides, and
            something sweet. Drinks range from hot coffee to milkshakes.
          </p>
          <AppLink to="/services" className="text-link">
            See the full menu
            <ArrowRight size={17} />
          </AppLink>
        </div>
      </section>
      <section className="editorial-row" id="before-you-visit" data-page-section="Before you visit">
        <h2>Plan your visit</h2>
        <div>
          <p>
            Current hours, street address, and telephone details are awaiting confirmation. Please
            check with the restaurant before making a special trip.
          </p>
          <AppLink to="/contact" className="text-link">
            Ask the team
            <ArrowRight size={17} />
          </AppLink>
        </div>
      </section>
      <section
        className="editorial-row"
        id="dietary-questions"
        data-page-section="Dietary questions"
      >
        <h2>A question about your meal?</h2>
        <div>
          <p>
            Please ask the restaurant about ingredients, preparation, and substitutions before
            ordering. Menu descriptions are not a complete allergen list.
          </p>
          <AppLink to="/docs" className="text-link">
            Ordering &amp; help
            <ArrowRight size={17} />
          </AppLink>
        </div>
      </section>
    </article>
  )
}
