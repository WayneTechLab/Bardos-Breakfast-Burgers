import { useLanguage } from '@/i18n/useLanguage'
import { ArrowRight } from 'lucide-react'
import { AppLink } from '@/components/navigation/AppLink'

export function AboutPage() {
  const { t } = useLanguage()
  return (
    <article className="public-wrap public-page">
      <header className="public-intro">
        <p className="eyebrow">{t('Salem, Oregon')}</p>
        <h1>{t("About Bardo's")}</h1>
        <p>{t('Breakfast specials. Burgers. A menu with plenty to choose from.')}</p>
      </header>
      <section className="editorial-row" id="our-menu" data-page-section={t('Our menu')}>
        <h2>{t('Breakfast to lunch')}</h2>
        <div>
          <p>
            {t(
              'Explore breakfast plates and omelets, burgers and sandwiches, wraps, salads, sides, and something sweet. Drinks range from hot coffee to milkshakes.',
            )}
          </p>
          <AppLink to="/services" className="text-link">
            {t('See the full menu')}
            <ArrowRight size={17} />
          </AppLink>
        </div>
      </section>
      <section
        className="editorial-row"
        id="before-you-visit"
        data-page-section={t('Before you visit')}
      >
        <h2>{t('Plan your visit')}</h2>
        <div>
          <p>
            {t(
              'Current hours, street address, and telephone details are awaiting confirmation. Please check with the restaurant before making a special trip.',
            )}
          </p>
          <AppLink to="/contact" className="text-link">
            {t('Ask the team')}
            <ArrowRight size={17} />
          </AppLink>
        </div>
      </section>
      <section
        className="editorial-row"
        id="dietary-questions"
        data-page-section={t('Dietary questions')}
      >
        <h2>{t('A question about your meal?')}</h2>
        <div>
          <p>
            {t(
              'Please ask the restaurant about ingredients, preparation, and substitutions before ordering. Menu descriptions are not a complete allergen list.',
            )}
          </p>
          <AppLink to="/docs" className="text-link">
            {t('Ordering & help')}
            <ArrowRight size={17} />
          </AppLink>
        </div>
      </section>
    </article>
  )
}
