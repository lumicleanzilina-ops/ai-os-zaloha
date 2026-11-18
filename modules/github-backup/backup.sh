#!/usr/bin/env bash
# Legacy entry delegates to the same Node implementation as the Stop hook.
set -eu
command -v node >/dev/null 2>&1 || { echo "Backup failed: Node 24 is required" >&2; exit 1; }
exec node "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/backup.mjs" "$@"
