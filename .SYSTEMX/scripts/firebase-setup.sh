#!/usr/bin/env bash
# Legacy macOS launcher for the shared Firebase configuration/status command.
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
if [[ $# -eq 0 ]]; then set -- status; fi
exec node "$ROOT_DIR/.SYSTEMX/cli/systemx.mjs" firebase "$@"
