#!/bin/sh
# Legacy POSIX/Git Bash entry point; Claude settings use Node exec form.
NODE=$(command -v node)
if [ -z "$NODE" ]; then
  echo "AI OS hook BLOCKED/NOT VERIFIED — Node missing." >&2
  exit 2
fi
exec "$NODE" "$(dirname "$0")/entry.mjs" skill-usage
