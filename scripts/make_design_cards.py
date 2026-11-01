#!/usr/bin/env python3
"""Build static social pages and 1200 × 630 cards for gallery entries.

Requires Python's standard library, solidcraft-cli, and headless Chromium.
Local source overrides use --source ID=/path/to/design.sc; source files are
only read, and are never copied into the site.
"""
import argparse
import base64
import html
import json
from pathlib import Path
import re
import shutil
import struct
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent.parent
DEMO = ROOT / "demo"
SITE = "https://dutchman-cad.github.io/demo/"


def chromium_path():
    for name in ("chromium", "chromium-browser", "google-chrome", "chrome"):
        if path := shutil.which(name):
            return path
    for path in sorted((Path.home() / ".cache/ms-playwright").glob("chromium-*/chrome-linux*/chrome"), reverse=True):
        return str(path)
    raise ValueError("Chromium was not found; pass --chromium /path/to/chrome")


def page(entry):
    card = entry["card"]
    title, line = html.escape(card["title"], quote=True), html.escape(card["line"], quote=True)
    url = SITE + "d/" + entry["id"] + "/"
    image = url + "og.png"
    alt = html.escape(entry["title"] + " beside the words “" + card["title"] + "”", quote=True)
    target = "../../view.html?d=" + entry["id"]
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · Dutchman CAD</title>
<meta name="description" content="{line}">
<meta name="theme-color" content="#1f6f5c">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Dutchman CAD">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{line}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{alt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{image}">
<link rel="canonical" href="{url}">
<meta http-equiv="refresh" content="0; url={target}">
</head><body><p><a href="{target}">Open {html.escape(entry['title'])}</a></p></body></html>
'''


def artwork(entry, snapshot):
    card = entry["card"]
    payload = json.dumps({**card, "image": base64.b64encode(snapshot.read_bytes()).decode("ascii")})
    # Keep JSON safe inside an HTML script, even when a title contains markup.
    payload = payload.replace("<", "\\u003c")
    return '''<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#f4f5f3;color:#1d2321;font-family:system-ui,sans-serif}
.bar{position:absolute;inset:0 auto 0 0;width:14px;background:#1f6f5c}
.label{position:absolute;left:60px;top:64px;font:24px monospace;color:#1f6f5c}
h1{position:absolute;left:60px;top:110px;width:570px;margin:0;font-size:58px;line-height:1.2;font-weight:700;letter-spacing:-.5px}
.line{position:absolute;left:60px;top:302px;width:470px;margin:0;font-size:28px;line-height:1.3;color:#3d4743}
.credit{position:absolute;left:60px;bottom:48px;width:550px;margin:0;font-size:20px;line-height:1.35;color:#63716c}
canvas{position:absolute;left:630px;top:45px;width:520px;height:540px}
</style></head><body><div class="bar"></div><div class="label">dutchman cad · demo</div>
<h1></h1><p class="line"></p><p class="credit"></p><canvas width="1040" height="1080"></canvas>
<script>
const card = ''' + payload + ''';
document.querySelector('h1').textContent = card.title;
document.querySelector('.line').textContent = card.line;
document.querySelector('.credit').textContent = card.credit;
document.querySelector('.line').style.top =
  (document.querySelector('h1').getBoundingClientRect().bottom + 54) + 'px';
const image = new Image();
image.onload = async () => {
  const source = document.createElement('canvas');
  source.width = image.width; source.height = image.height;
  const ctx = source.getContext('2d', {willReadFrequently:true});
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, source.width, source.height);
  const data = pixels.data, w = source.width, h = source.height;
  let x0=w, y0=h, x1=0, y1=0, count=0;
  // The snapshot has a neutral background that can vary vertically. Sample
  // both edges on each row and remove it everywhere, including frame openings.
  for (let y=0; y<h; y++) {
    const left = y*w*4, right = (y*w+w-1)*4;
    const bg = [0,1,2].map(c => (data[left+c]+data[right+c])/2);
    for (let x=0; x<w; x++) {
      const p = (y*w+x)*4;
      const delta = Math.max(...bg.map((v,c) => Math.abs(data[p+c]-v)));
      if (delta <= 6) data[p+3]=0;
      if (data[p+3]) { x0=Math.min(x0,x); x1=Math.max(x1,x); y0=Math.min(y0,y); y1=Math.max(y1,y); count++; }
    }
  }
  if (!count) throw new Error('The design render is empty');
  ctx.putImageData(pixels, 0, 0);
  const canvas = document.querySelector('canvas'), out = canvas.getContext('2d');
  const sw=x1-x0+1, sh=y1-y0+1, scale=Math.min(canvas.width/sw,canvas.height/sh);
  out.drawImage(source,x0,y0,sw,sh,(canvas.width-sw*scale)/2,(canvas.height-sh*scale)/2,sw*scale,sh*scale);
  await document.fonts.ready;
  document.body.dataset.ready='true';
};
image.src='data:image/png;base64,'+card.image;
</script></body></html>'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", action="append", default=[], metavar="ID=PATH", help="local design source override")
    parser.add_argument("--snapshot", action="append", default=[], metavar="ID=PATH", help="reuse a high-resolution snapshot")
    parser.add_argument("--cli", default=shutil.which("solidcraft-cli") or str(Path.home() / ".local/bin/solidcraft-cli"))
    parser.add_argument("--chromium", help="Chromium executable")
    args = parser.parse_args()
    sources, snapshots = {}, {}
    for values, target in ((args.source, sources), (args.snapshot, snapshots)):
        for value in values:
            name, separator, path = value.partition("=")
            if not separator or not path:
                parser.error("expected ID=PATH")
            target[name] = Path(path).expanduser().resolve()
    try:
        chrome = args.chromium or chromium_path()
        entries = json.loads((DEMO / "gallery.json").read_text(encoding="utf-8"))
        for entry in entries:
            if "card" not in entry:
                continue
            name = entry["id"]
            if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", name):
                raise ValueError(f"unsafe design id: {name}")
            for key in ("title", "line", "credit"):
                if not entry["card"].get(key):
                    raise ValueError(f"{name}: card needs {key}")
            with tempfile.TemporaryDirectory(prefix="design-card-") as work:
                work = Path(work)
                shot = snapshots.get(name, work / "snapshot.png")
                if name not in snapshots:
                    source = sources.get(name)
                    if source is None and entry.get("design"):
                        source = DEMO / entry["design"]
                    if source is None or not source.is_file():
                        raise ValueError(f"{name}: supply --source {name}=/path/to/design.sc")
                    print(f"Rendering {name}", flush=True)
                    subprocess.run([args.cli, "snapshot", "--in", str(source), "--out", str(shot), "--width", "1800", "--height", "2000", "--view", "iso", "--no-grid", "--no-axes"], check=True, timeout=1200)
                header = shot.read_bytes()[:24]
                if header[:8] != b"\x89PNG\r\n\x1a\n" or min(struct.unpack(">II", header[16:24])) < 1200:
                    raise ValueError(f"{name}: snapshot must be a PNG at least 1200 pixels in each dimension")
                art = work / "card.html"
                art.write_text(artwork(entry, shot), encoding="utf-8")
                output = work / "og.png"
                driver = Path(__file__).with_name("card_shot.mjs")
                subprocess.run(["node", str(driver), chrome, art.as_uri(), str(output)], check=True, capture_output=True, text=True, timeout=120)
                if not output.is_file():
                    raise ValueError(f"{name}: card rendering did not finish")
                dest = DEMO / "d" / name
                dest.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(output, dest / "og.png")
                (dest / "index.html").write_text(page(entry), encoding="utf-8")
                print(f"Wrote demo/d/{name}/index.html and og.png", flush=True)
    except (ValueError, OSError, subprocess.SubprocessError) as error:
        parser.exit(1, f"{error}\n")


if __name__ == "__main__":
    main()
