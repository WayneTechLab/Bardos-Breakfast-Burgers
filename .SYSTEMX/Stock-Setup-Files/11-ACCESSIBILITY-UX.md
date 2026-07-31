# 11 Accessibility And UX Standard

Use this file when an LLM creates or updates UI, forms, navigation, auth, media,
or interactive flows.

## Accessibility Baseline

- Use semantic HTML first.
- Keep keyboard navigation complete.
- Preserve visible focus states.
- Use labels for inputs and accessible names for controls.
- Maintain sufficient color contrast.
- Do not rely on color alone to communicate state.
- Provide alt text for meaningful images.
- Respect reduced-motion preferences for non-essential animation.
- Keep error messages actionable and near the failing field.

## UX Baseline

- Make common workflows obvious and efficient.
- Keep destructive actions explicit and confirmable.
- Keep loading, empty, error, success, and unauthorized states available.
- Use Level 0-5 account logic for access messaging.
- Do not expose admin/private navigation to public users unless the route is
  intentionally public documentation.
- Keep forms recoverable; do not wipe user input after validation errors.

## Required States

For user-facing flows, consider:

- Loading.
- Empty.
- Error.
- Success.
- Unauthorized.
- Offline/degraded.
- Validation failure.
- Permission upgrade required.

## Verification

When possible, run:

```bash
npm run ci:lint
npm run ci:typecheck
npm run ci:build
```

For visual/interactive changes, use browser or Playwright checks at desktop and
mobile widths.
