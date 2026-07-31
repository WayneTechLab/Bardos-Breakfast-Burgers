#!/usr/bin/env bash
# Legacy macOS launcher for a platform-stamped setup packet export.
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
exec node "$ROOT_DIR/.SYSTEMX/cli/systemx.mjs" packet export "$@"
