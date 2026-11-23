#!/usr/bin/env python3
"""Prints the SolidCraft version the demo should carry: the current release.

Rule (settled with SolidCraft): look at the newest release that is not a draft and whose
prerelease flag is not set (a flagged release is skipped). If its notes say "X stays the current
release", the current release is X; otherwise it is that release itself.
Reads the releases JSON (GitHub's list, newest first) from stdin.
"""
import json
import re
import sys

STAYS = re.compile(r"\b(\d+\.\d+\.\d+)\s+stays the current release", re.I)


def current(releases):
    for r in releases:
        if r.get("draft") or r.get("prerelease"):
            continue
        m = STAYS.search(r.get("body") or "")
        return m.group(1) if m else r["tag_name"].lstrip("v")
    return None


if __name__ == "__main__":
    v = current(json.load(sys.stdin))
    if not v:
        sys.exit("no release found")
    print(v)
