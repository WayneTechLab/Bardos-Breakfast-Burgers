import { AppLink } from '@/components/navigation/AppLink'

const questions = [
  {
    id: 'ordering',
    title: 'Ordering',
    entries: [
      [
        'Is online ordering available?',
        'Online checkout is available only when payment services are enabled. A basket is not an accepted order until submission succeeds.',
      ],
      [
        'Where can I check my order?',
        'Your account lists the orders placed while signed in, including payment and preparation status. A return from the payment page alone does not confirm payment.',
      ],
      [
        'Can I have an order delivered?',
        'Delivery is not currently available through this website.',
      ],
    ],
  },
  {
    id: 'menu-questions',
    title: 'Menu questions',
    entries: [
      [
        'What about allergies or substitutions?',
        'Please confirm ingredients and preparation directly with the restaurant before ordering. Menu descriptions may not list every ingredient.',
      ],
      ['Can I print the menu?', 'A printable menu is available on the full menu page.'],
      [
        'Are all items always available?',
        'Availability can change. Items marked sold out cannot be added to an order.',
      ],
    ],
  },
  {
    id: 'account-support',
    title: 'Account & support',
    entries: [
      [
        'Do I need an account?',
        'The menu is open to everyone. An account is required to place online orders or send a support request.',
      ],
      [
        'How do I reset my password?',
        'Enter your email on the sign-in page and select Reset password. Google sign-in accounts use their Google credentials.',
      ],
      [
        'How do I ask about a charge or order?',
        'Contact the restaurant through your account. Include the order number, but never send a password or card number. Refunds require review by the restaurant.',
      ],
    ],
  },
]
export function DocsPage() {
  return (
    <article className="public-wrap public-page help-page">
      <header className="public-intro">
        <p className="eyebrow">Bardo's support</p>
        <h1>Ordering &amp; help</h1>
        <p>A few answers before you order.</p>
      </header>
      {questions.map((section) => (
        <section
          key={section.id}
          id={section.id}
          data-page-section={section.title}
          className="faq-section"
        >
          <h2>{section.title}</h2>
          {section.entries.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </section>
      ))}
      <div className="public-actions">
        <AppLink to="/contact" className="public-button">
          Contact the team
        </AppLink>
        <AppLink to="/account" className="public-button secondary">
          My orders
        </AppLink>
      </div>
    </article>
  )
}
