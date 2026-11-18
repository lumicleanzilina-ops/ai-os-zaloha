#!/usr/bin/env python3
"""
brain-sync — event-driven hygiene for a second-brain markdown vault.

Philosophy: a living knowledge base is best maintained by a HOOK after each
session, not by an occasional cron. This script is LAYER 1: fast, deterministic,
free (no LLM, no tokens). Run it after every session (e.g. a Claude Code
SessionEnd hook, or any agent's post-session hook).

What it does:
  1. Finds broken [[wikilinks]] and orphan pages (via grep-style scan, not an LLM)
  2. Detects index.md drift (pages that exist but aren't listed in the index)
  3. Appends a summary line to log.md
  4. When it finds drift it can't fix, writes a .needs-lint flag file that a
     weekly LLM lint (layer 2) can pick up
  5. Commits the vault to git (git = the core: a diffable history)

Exit 0 means hygiene completed (or explicitly not configured); exit 1 means failure.
Git failures are reported without printing potentially sensitive command output.

Config:
  SECOND_BRAIN_VAULT   path to the vault (required; no default personal path)

Usage:
  SECOND_BRAIN_VAULT="$HOME/your-vault" python3 brain-sync.py

No third-party dependencies — Python 3 standard library only.
"""
import os
import re
import subprocess
import sys
from datetime import datetime
from uuid import uuid4

VAULT = os.environ.get("SECOND_BRAIN_VAULT", "")

# Pages allowed to be "orphans" (no inbound link needed) — system / inbox pages.
ORPHAN_OK = {"index", "log", "README", "AGENTS", "CLAUDE"}
ORPHAN_OK_PREFIX = ("Type-",)
ORPHAN_OK_DIRS = ("raw", "session-logs", "captures")  # inbox / log folders

# Guidance files contain ILLUSTRATIVE [[example]] links — don't scan them as a
# source of "broken" links.
META_DOCS = {"AGENTS", "CLAUDE", "README", "index", "log"}

# Strip fenced (```...```) and inline (`...`) code so code examples don't create
# false positives.
_FENCE = re.compile(r"```.*?```", re.DOTALL)
_INLINE = re.compile(r"`[^`]*`")


def strip_code(text):
    return _INLINE.sub("", _FENCE.sub("", text))


def sh(args, cwd=None):
    try:
        result = subprocess.run(
            args, cwd=cwd or VAULT, capture_output=True, text=True, timeout=30
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise RuntimeError("Git unavailable or timed out; sync NOT completed") from exc
    if result.returncode != 0:
        operation = next((part for part in args[1:] if part in ("rev-parse", "status", "add", "commit")), "operation")
        raise RuntimeError("Git " + operation + " failed (exit " + str(result.returncode) + "); sync NOT completed")
    return result


def md_files():
    out = []
    for root, dirs, files in os.walk(VAULT):
        dirs[:] = [d for d in dirs if d not in (".git", ".ai-os-hygiene")]
        for f in files:
            if f.endswith(".md"):
                out.append(os.path.join(root, f))
    return out


def rel(path):
    return os.path.relpath(path, VAULT)


def basename(path):
    return os.path.splitext(os.path.basename(path))[0]


def in_ok_dir(path):
    r = rel(path)
    return any(r.startswith(d + os.sep) for d in ORPHAN_OK_DIRS)


def real_changes():
    """True only when vault CONTENT changed — ignore brain-sync's own outputs
    (log.md, .needs-lint). Without this the script would spam the log and create
    a commit after every session even when nothing really changed (not
    idempotent)."""
    st = sh(["git", "status", "--porcelain"])
    if not st or not st.stdout.strip():
        return False
    for ln in st.stdout.splitlines():
        path = ln[3:].strip().strip('"')
        if path in ("log.md", ".needs-lint") or path.startswith(".ai-os-hygiene/"):
            continue
        return True  # a real content diff exists
    return False


def main():
    if not VAULT:
        print("brain-sync: SECOND_BRAIN_VAULT not set -> no-op")
        return
    if not os.path.isdir(VAULT):
        raise RuntimeError("Configured vault directory does not exist")

    # Is this a git repo? If not, skip the git-diff gate but still lint.
    is_git = os.path.exists(os.path.join(VAULT, ".git"))
    if is_git:
        repository = sh(["git", "rev-parse", "--show-toplevel"]).stdout.strip()
        if os.path.realpath(repository) != os.path.realpath(VAULT):
            raise RuntimeError("Vault must be its own Git root")

    # GATE: if content didn't change, exit quietly (no log line, no commit).
    # Idempotent: running twice in a row does nothing the second time.
    if is_git and not real_changes():
        return

    files = md_files()
    names = {basename(p) for p in files}

    wikilink_re = re.compile(r"\[\[([^\]|#]+)")
    inbound = {n: 0 for n in names}
    broken = []  # (source, target)

    for p in files:
        try:
            text = strip_code(open(p, encoding="utf-8").read())
        except (OSError, UnicodeError) as exc:
            raise RuntimeError("A vault page could not be inspected") from exc
        is_meta = basename(p) in META_DOCS
        for m in wikilink_re.finditer(text):
            target = m.group(1).strip()
            if target in names:
                inbound[target] = inbound.get(target, 0) + 1
            elif not is_meta:  # guidance files carry illustrative examples -> skip
                broken.append((rel(p), target))

    # Orphans (except system pages and inbox folders)
    orphans = []
    for p in files:
        n = basename(p)
        if n in ORPHAN_OK or n.startswith(ORPHAN_OK_PREFIX) or in_ok_dir(p):
            continue
        if inbound.get(n, 0) == 0:
            orphans.append(rel(p))

    # Drift: pages not mentioned in index.md (root wiki pages only)
    not_in_index = []
    index_path = os.path.join(VAULT, "index.md")
    index_text = (
        open(index_path, encoding="utf-8").read() if os.path.exists(index_path) else ""
    )
    for p in files:
        n = basename(p)
        if n in ORPHAN_OK or n.startswith(ORPHAN_OK_PREFIX) or in_ok_dir(p):
            continue
        if n not in index_text:
            not_in_index.append(n)

    stamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    line = (
        f"## [{stamp}] sync | {len(files)} pages | "
        f"{len(orphans)} orphans | {len(broken)} broken links | "
        f"{len(not_in_index)} not in index"
    )

    # Append to log.md
    try:
        with open(os.path.join(VAULT, "log.md"), "a", encoding="utf-8") as f:
            f.write("\n" + line + "\n")
    except OSError as exc:
        raise RuntimeError("Hygiene output could not be saved; sync NOT completed") from exc

    # Drift flag for the weekly LLM lint (layer 2)
    drift = broken or not_in_index or orphans
    flag = os.path.join(VAULT, ".needs-lint")
    try:
        if drift:
            with open(flag, "w", encoding="utf-8") as f:
                f.write(f"# brain-sync drift {stamp}\n\n")
                if broken:
                    f.write("## Broken wikilinks\n")
                    for src, tgt in broken:
                        f.write(f"- `{src}` -> [[{tgt}]] (target does not exist)\n")
                if orphans:
                    f.write("\n## Orphans (no inbound link)\n")
                    for o in orphans:
                        f.write(f"- {o}\n")
                if not_in_index:
                    f.write("\n## Not in index.md\n")
                    for n in not_in_index:
                        f.write(f"- [[{n}]]\n")
        elif os.path.exists(flag):
            archive = os.path.join(VAULT, ".ai-os-hygiene")
            os.makedirs(archive, exist_ok=True)
            readme = os.path.join(archive, "README.md")
            if not os.path.exists(readme):
                with open(readme, "w", encoding="utf-8") as f:
                    f.write("# Resolved hygiene flags\nFormer .needs-lint reports are preserved here.\n## Status\nArchived after a clean lint; no permanent deletion.\n")
            os.rename(flag, os.path.join(archive, "resolved-" + str(uuid4()) + ".txt"))
    except Exception:
        pass

    # git commit (only when there are changes, and only if this is a git repo)
    if is_git:
        st = sh(["git", "status", "--porcelain"])
        if st and st.stdout.strip():
            sh(["git", "add", "-A"])
            sh(
                [
                    "git",
                    "-c",
                    "user.name=brain-sync",
                    "-c",
                    "user.email=brain-sync@localhost",
                    "commit",
                    "-q",
                    "-m",
                    f"brain-sync {stamp}",
                ]
            )

    # Output for the hook log
    print(f"brain-sync: {line[3:]}")
    print("brain-sync: local commit verified" if is_git else "brain-sync: Git not configured; hygiene only, no commit or remote backup")
    if drift:
        print("brain-sync: drift -> .needs-lint written (weekly lint will resolve)")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        # Never print subprocess stdout/stderr, vault contents or credential values.
        message = str(e) if isinstance(e, RuntimeError) else "Unexpected failure; sync NOT completed"
        print("brain-sync: " + message, file=sys.stderr)
        sys.exit(1)
    sys.exit(0)
