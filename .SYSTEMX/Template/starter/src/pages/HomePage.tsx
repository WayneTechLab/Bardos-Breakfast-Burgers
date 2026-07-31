import { AppLink } from '@/components/navigation/AppLink'

const sections = [
  'Reusable starter pages',
  'Firebase-ready configuration',
  'Unified account levels',
  'Documented setup process',
]

export function HomePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Basic template
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-neutral-950 sm:text-6xl">
          Web Stack Generation
        </h1>
        <p className="mt-6 text-lg leading-8 text-neutral-600">
          Template Provided by Wayne Tech Lab LLC. This is a clean, generic
          starting point for a simple web app with a small page set, neutral
          styling, and setup documentation ready to customize.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <AppLink
            to="/docs"
            className="rounded-md bg-neutral-950 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Read docs
          </AppLink>
          <AppLink
            to="/about"
            className="rounded-md border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
          >
            About template
          </AppLink>
          <AppLink
            to="/login"
            className="rounded-md border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
          >
            Unified Login
          </AppLink>
        </div>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((item) => (
          <div key={item} className="border border-neutral-200 bg-white p-6">
            <h2 className="text-base font-semibold text-neutral-950">{item}</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Replace this text with project-specific copy when generating a new
              app from the stack.
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
