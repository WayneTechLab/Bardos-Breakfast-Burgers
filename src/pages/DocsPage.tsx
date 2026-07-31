const docs = [
  'README.md',
  'wiki/Home.md',
  'wiki/Quick-Start.md',
  'docs/RUNBOOK.md',
]

export function DocsPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
        Project docs
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Bardo's runs on the Wayne Tech Lab webapp standard.
      </h1>
      <p className="mt-5 text-lg leading-8 text-stone-600">
        The restaurant-facing app is customized for Bardo's, while the repo
        keeps SYSTEMX setup, Firebase, security, CI, deployment, and handoff
        documentation for operators.
      </p>
      <ul className="mt-10 divide-y divide-neutral-200 border-y border-neutral-200">
        {docs.map((doc) => (
          <li key={doc} className="py-4 font-mono text-sm text-neutral-700">
            {doc}
          </li>
        ))}
      </ul>
    </section>
  )
}
