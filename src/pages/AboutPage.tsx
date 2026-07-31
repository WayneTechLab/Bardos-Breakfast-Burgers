export function AboutPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
        About Bardo's
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Breakfast comfort and burger craft for Salem, Oregon.
      </h1>
      <p className="mt-5 text-lg leading-8 text-stone-600">
        Bardo's Breakfast Burgers is shaped as a neighborhood counter-service
        concept: quick enough for a workday pickup, warm enough for weekend
        breakfast, and memorable enough to carry a bold local brand online.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="border border-stone-200 p-5">
          <h2 className="font-semibold">Restaurant direction</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            The webapp centers menu discovery, pickup intent, catering leads,
            specials, and a rewards path that can later connect to Firebase.
          </p>
        </div>
        <div className="border border-stone-200 p-5">
          <h2 className="font-semibold">Brand feel</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Red, black, warm gold, and confident food-forward copy match the
            supplied Bardo's BB breakfast and burger logo.
          </p>
        </div>
      </div>
    </section>
  )
}
