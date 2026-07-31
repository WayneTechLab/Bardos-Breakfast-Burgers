# Tool Calling And Browser Automation Standard

## Purpose

SYSTEMX supports local-first automation through scripts, Playwright, Chrome
DevTools MCP, platform CLIs, SDKs, and optional desktop control. These tools help
agents work beyond the chat screen while keeping authority clear.

## Tool Routing Order

Use the smallest tool that can prove the result:

1. Read files and logs with local shell tools.
2. Run project scripts from `package.json` or `.SYSTEMX/scripts`.
3. Use SDK or CLI commands for provider state.
4. Use Playwright for repeatable browser checks.
5. Use Chrome DevTools MCP for live browser inspection and console/network
   evidence.
6. Use desktop automation only when browser or CLI access cannot reach the
   required surface.
7. Ask the operator when the next step needs credentials, money, production
   state, or ambiguous account selection.

## Playwright Baseline

Install Chromium once per machine or environment:

```bash
npx playwright install chromium
```

Record or inspect a flow against the local dev server:

```bash
npx playwright codegen http://localhost:5173
```

Run tests after a local server is available:

```bash
npx playwright test
```

Rules:

- Use local or emulator targets by default.
- Keep production credentials out of fixtures.
- Capture trace, screenshot, and console evidence for failures.
- Do not use Playwright to bypass a real user approval or paid-service warning.

## Chrome DevTools MCP Baseline

Chrome DevTools MCP is the live-browser inspection lane. Use it for:

- console errors
- DOM inspection
- network failures
- local popup behavior
- screenshot evidence
- reproducing agent-observed UI bugs

Default launch help:

```bash
npx chrome-devtools-mcp --help
```

Use localhost or staging. Do not point MCP at production accounts containing
real user data unless the operator explicitly approves the session.

## macOS Desktop Automation Notes

On Apple Silicon machines, browser and native-app automation can fail because
of system permissions, keychain prompts, app-signing state, or Accessibility API
shape. The generic template standard is:

- Prefer browser-first auth when native web-auth presentation fails to open.
- Keep UI labels bounded and useful so screen/desktop tools do not recurse
  through an entire dynamic tree.
- Normalize child-process `PATH` for apps launched from Finder or GUI shells.
- Use canonical install paths and terminate the prior process before replacing
  a local app.
- Preserve local auth/session state during normal updates.
- Never let UI automation perform a destructive action without operator review.

## Popup And Apply-Block Handling

If a popup, browser prompt, permission sheet, or code-apply dialog blocks the
main path:

1. Capture current state: URL, visible text, screenshot, command, and logs.
2. Classify the block as `auth`, `permission`, `modal`, `port`, `process`,
   `tool_apply`, `rate_limit`, or `unknown`.
3. Try the lowest-risk alternate route:
   - keyboard navigation
   - browser refresh
   - direct URL revisit
   - local script retry
   - alternate shell launcher
   - headed Playwright reproduction
   - MCP browser inspection
4. If the action is still blocked, record a dead-letter entry with the failed
   command, reason, and next required human decision.

Do not silently click through payment, production, account-transfer, or
permission-escalation prompts.
