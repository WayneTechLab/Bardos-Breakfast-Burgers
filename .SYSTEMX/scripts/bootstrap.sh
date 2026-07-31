#!/usr/bin/env bash
# macOS/Linux compatibility launcher. Shared behavior lives in the Node CLI.
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
exec node "$ROOT_DIR/.SYSTEMX/cli/systemx.mjs" setup "$@"
