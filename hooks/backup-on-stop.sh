#!/bin/sh
# Legacy POSIX/Git Bash entry point; Claude settings use Node exec form.
# Volají ho settings.json z V.03/V.04, kde byla záloha ve výchozím stavu zapnutá
# (AICOS_BACKUP=off ji vypne). Upgrade tak zákazníkovi zálohu potichu nevypne.
# Nová instalace (Node exec form) zůstává opt-in.
NODE=$(command -v node)
if [ -z "$NODE" ]; then
  echo "AI OS hook BLOCKED/NOT VERIFIED — Node missing." >&2
  exit 2
fi
AICOS_BACKUP="${AICOS_BACKUP:-on}"
AICOS_BACKUP_LEGACY=1
export AICOS_BACKUP AICOS_BACKUP_LEGACY
exec "$NODE" "$(dirname "$0")/entry.mjs" backup-on-stop
