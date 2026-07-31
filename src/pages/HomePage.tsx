import { AppLink } from '@/components/navigation/AppLink'
import { Clock, MapPin, Star } from 'lucide-react'

const sections = [
  {
    title: 'Breakfast all day',
    body: 'Eggs, sausage, bacon, hash browns, and griddled buns built for early shifts and late starts.',
  },
  {
    title: 'Smash burgers',
    body: 'Crispy edges, melty cheese, house sauce, and local produce where the season allows.',
  },
  {
    title: 'Salem pickup flow',
    body: 'A foundation for online ordering, wait times, loyalty accounts, and catering requests.',
  },
  {
    title: 'Family-friendly counter',
    body: 'Fast casual service with bold branding, simple navigation, and room for specials.',
  },
]

export function HomePage() {
  return (
    <section>
      <div className="bg-stone-950 text-white">
        <div className="mx-auto grid min-h-[calc(100vh-74px)] max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-[1fr_0.78fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-yellow-400">
              Salem, Oregon / Est. 2014
            </p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">
              Bardo's Breakfast Burgers
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-200">
              A local restaurant webapp concept for bold breakfast plates,
              stacked burgers, online pickup, specials, rewards, and catering
              requests from one clean storefront.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <AppLink
                to="/services"
                className="rounded-md bg-red-700 px-5 py-3 text-sm font-semibold text-white hover:bg-red-800"
              >
                View menu
              </AppLink>
              <AppLink
                to="/contact"
                className="rounded-md border border-yellow-400 px-5 py-3 text-sm font-semibold text-yellow-300 hover:bg-yellow-400 hover:text-stone-950"
              >
                Plan a pickup
              </AppLink>
            </div>
            <div className="mt-10 grid gap-4 text-sm text-stone-200 sm:grid-cols-3">
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-400" /> Breakfast, lunch,
                and weekend specials
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-yellow-400" /> Salem, OR
              </p>
              <p className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" /> Rewards-ready
                account flow
              </p>
            </div>
          </div>
          <img
            src="/assets/bardos-logo.png"
            alt="Bardo's Breakfast Burgers logo"
            className="mx-auto aspect-square w-full max-w-md object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
          Webapp concept
        </p>
        <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
          Built for ordering, discovery, and day-to-day restaurant operations.
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-7 text-stone-600">
          This base keeps the Wayne Tech Lab SYSTEMX webapp foundation while
          replacing the generic shell with a restaurant-ready customer
          experience for Bardo's.
        </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((item) => (
          <div key={item.title} className="border border-stone-200 bg-white p-6">
            <h3 className="text-base font-semibold text-stone-950">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              {item.body}
            </p>
          </div>
        ))}
      </div>
      </div>
    </section>
  )
}
