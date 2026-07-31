const services = [
  {
    name: 'The Bardo Breakfast Burger',
    detail: 'Sausage, egg, American cheese, crispy hash browns, and house sauce on a toasted bun.',
  },
  {
    name: 'Classic Salem Smash',
    detail: 'Double griddled beef, cheese, pickles, onion, lettuce, and Bardo sauce.',
  },
  {
    name: 'Morning Plate',
    detail: 'Eggs, bacon or sausage, breakfast potatoes, toast, and rotating jam.',
  },
  {
    name: 'Catering trays',
    detail: 'Breakfast sandwich boxes, slider packs, coffee add-ons, and event pickup windows.',
  },
]

export function ServicesPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
        Menu
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Breakfast, burgers, and party-ready trays.
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-600">
        This starter menu gives the app real restaurant content while leaving
        room for pricing, modifiers, availability, photos, and online ordering.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <div key={service.name} className="border border-stone-200 p-5">
            <h2 className="font-semibold">{service.name}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {service.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
