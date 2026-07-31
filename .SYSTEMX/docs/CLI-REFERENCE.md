# SYSTEMX CLI and Tooling Reference

The shared Node CLI is the supported command surface. Every `wtl:*` script
works from the repository root and uses OS detection for macOS, Windows,
Ubuntu/Debian, WSL2, and compatible Linux.

| Command | Intent |
| --- | --- |
| `npm run wtl:menu` | Interactive lifecycle menu. |
| `npm run wtl:platform -- --json` | Detected OS, architecture, shell, and support contract. |
| `npm run wtl:doctor -- --strict=false` | Readiness inventory without failing on optional tools. |
| `npm run wtl:setup -- --check` | Safe setup check. Add `--install` only after review. |
| `npm run wtl:local -- start-day [--firebase]` | Owned dynamic-port local Vite or Firebase-emulator session. |
| `npm run wtl:local -- status` | Owned session PIDs, ports, and state. |
| `npm run wtl:local -- end-day` | Stops only recorded SYSTEMX session PIDs. |
| `npm run wtl:quality -- --build` | Typecheck, lint, tests, security, and build. |
| `npm run wtl:audit` | Structure, docs links, adapter/version drift, and npm audit. |
| `npm run wtl:deploy -- --preflight` | Validates release gates without deployment. |
| `npm run wtl:deploy -- --target hosting --dry-run` | Firebase Hosting validation without release. |
| `npm run wtl:packet -- export` | Exports a secret-free, platform-stamped setup packet. |
| `npm run wtl:packet -- import <zip>` | Imports and validates a returned setup packet. |
| `npm run wtl:sync -- --check` | Checks version and generated agent-adapter drift. |
| `npm run wtl:mcp` | Generates opt-in Firebase and Chrome DevTools MCP definitions. |
| `npm run wtl:bus -- summary …` | Reads compact Agent 0/subagent wave state. |

## Browser tools

```bash
npm install
npm run browser:install
npm run wtl:local -- start-day
npm run browser:codegen
npm run mcp:chrome
```

Use Playwright for repeatable local browser flows. Use Chrome DevTools MCP for
live inspection. Neither bypasses approval dialogs, provider permissions, or
production safeguards.

## Platform override

Use an explicit override only for testing or a controlled compatibility case:

```bash
npm run wtl:doctor -- --platform windows-arm64 --strict=false
npm run wtl:doctor -- --platform ubuntu-x64 --strict=false
```

An override changes SYSTEMX behavior for the command; it does not make an
unsupported operating system or architecture supported.

