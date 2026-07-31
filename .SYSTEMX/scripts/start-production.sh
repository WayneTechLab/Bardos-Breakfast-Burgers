#!/usr/bin/env bash
# Legacy macOS launcher for the shared setup lifecycle.
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
exec node "$ROOT_DIR/.SYSTEMX/cli/systemx.mjs" setup "$@"
