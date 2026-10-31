#!/usr/bin/env python3
"""Check demo/gallery.json: every entry is complete and every file it names exists."""
import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
demo = root / "demo"
entries = json.loads((demo / "gallery.json").read_text(encoding="utf-8"))
problems = []
ids = [entry.get("id") for entry in entries]
if len(ids) != len(set(ids)):
    problems.append("duplicate ids")
for entry in entries:
    name = entry.get("id", "?")
    for key in ("id", "title", "source_app", "what", "stats", "thumb", "credit"):
        if not entry.get(key):
            problems.append(f"{name}: missing {key}")
    credit = entry.get("credit", {})
    for key in ("author", "licence", "link"):
        if not credit.get(key):
            problems.append(f"{name}: credit has no {key}")
    if not (root / entry.get("thumb", "missing")).is_file():
        problems.append(f"{name}: no thumbnail {entry.get('thumb')}")
    design = entry.get("design")
    if design:
        if not (demo / design).is_file():
            problems.append(f"{name}: no design {design}")
        elif (demo / design).stat().st_size > 5_000_000:
            heavy = entry.get("heavy", {})
            if not all(heavy.get(key) for key in ("size", "bodies", "seconds")):
                problems.append(f"{name}: over 5 MB without heavy size, bodies, and seconds")
    elif not entry.get("download", {}).get("size"):
        problems.append(f"{name}: neither a design nor a download")
for page in ("index.html", "view.html", "gallery.css"):
    if not (demo / page).is_file():
        problems.append(f"no demo/{page}")
app = demo / "app"
for needed in ("index.html", "LICENSE-MIT", "LICENSE-APACHE", "NOTICE"):
    if not (app / needed).is_file():
        problems.append(f"no demo/app/{needed}")
if not list(app.glob("*_bg.wasm")):
    problems.append("no wasm in demo/app")
for problem in problems:
    print(problem)
print(f"{len(entries)} gallery entries, {len(problems)} problems")
sys.exit(1 if problems else 0)
