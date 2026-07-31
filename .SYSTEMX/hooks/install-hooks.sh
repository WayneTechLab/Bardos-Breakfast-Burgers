#!/usr/bin/env bash
# macOS/Linux compatibility launcher for cross-platform hook installation.
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
exec node "$ROOT_DIR/.SYSTEMX/cli/systemx.mjs" hooks install "$@"
