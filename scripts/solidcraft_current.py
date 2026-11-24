#!/usr/bin/env python3
"""Prints the SolidCraft version the demo should carry: the current release.

Rule: look at the newest release that is not a draft and whose prerelease flag is not set (a
flagged release is skipped). If its notes say "X stays the current release", the current release
is X; otherwise it is that release itself. A release GitHub marks Latest (not a draft, not
flagged) that is newer than that choice is current anyway: SolidCraft announces a release as
current before its notes drop the "stays" line.
Reads the releases JSON (GitHub's list, newest first) from stdin; the Latest tag, when known, is
the first argument.
"""
import json
import re
import sys

STAYS = re.compile(r"\b(\d+\.\d+\.\d+)\s+stays the current release", re.I)


def _key(version):
    return tuple(int(p) for p in re.findall(r"\d+", version)[:3])


def current(releases, latest=None):
    choice = None
    for r in releases:
        if r.get("draft") or r.get("prerelease"):
            continue
        m = STAYS.search(r.get("body") or "")
        choice = m.group(1) if m else r["tag_name"].lstrip("v")
        break
    if latest:
        for r in releases:
            if r.get("tag_name") == latest and not r.get("draft") and not r.get("prerelease"):
                tag = latest.lstrip("v")
                if choice is None or _key(tag) > _key(choice):
                    choice = tag
                break
    return choice


if __name__ == "__main__":
    v = current(json.load(sys.stdin), sys.argv[1] if len(sys.argv) > 1 else None)
    if not v:
        sys.exit("no release found")
    print(v)
