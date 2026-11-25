# Converted design gallery

Serve the repository with a static HTTP server (for example, `python3 -m http.server 8000`) and open `/demo/`. No build step, external scripts, or fonts are needed. `gallery.json` is the single entry list for both the gallery and viewer. The SolidCraft web build lives in `app/`: SolidCraft 0.49.1's `solidcraft-web-0.49.1.zip` release asset (the pages read the version from `app/build.json`), unpacked as is, with its licence and notice files. Gallery updates do not require editing it.

## Add a design

Only publish designs whose licence allows redistribution. Credit the author and licence, and meet all licence conditions (including any required notices). Never use private designs, GrabCAD files, or volunteer-private files. Our public fixtures are CC0; that does not make unrelated designs public domain.

Adding an entry requires one JSON object and two files:

1. Convert the permitted source into `demo/designs/<id>.sc`. Use `dutchman convert <source> -o demo/designs/<id>.sc --preset full --json` and read the verification and loss report. For editable-history examples, require verification status `verified`. Describe only the features and joints that survived, including relevant losses. Do not count hidden backup imports or structural tree nodes as editable history steps.
2. Run `solidcraft-cli snapshot --in demo/designs/<id>.sc --out demo/thumbs/<id>.png --width 640 --height 400 --view iso --no-grid --no-axes`. Inspect the PNG; adjust `--view` or `--camera` and repeat if blank or poorly framed.
3. Append an object to `demo/gallery.json`, following this schema:

```json
{
  "id": "unique-url-slug",
  "title": "Design title",
  "source_app": "FreeCAD",
  "what": "One line describing what came through.",
  "stats": "4 editable history steps · verified",
  "design": "designs/unique-url-slug.sc",
  "thumb": "demo/thumbs/unique-url-slug.png",
  "credit": {
    "author": "Author or project",
    "licence": "CC0",
    "licence_link": "Optional: the licence text",
    "link": "https://example.org/public-source"
  },
  "notice": "Optional: a notice the licence requires, such as what changed",
  "hint": "Optional: what to try in the full app, and any conversion limitations."
}
```

A design over 5 MB takes `"heavy": {"size": "13.6 MB", "bodies": 191, "seconds": 150}`: its page shows the thumbnail and loads the viewer only on a click, because SolidCraft's web app blocks the page while it opens a design. `seconds` is the longest freeze measured in a headless browser with software rendering, so a machine with a GPU is faster. Measured so far: robot arm (3.8 MB) 4.5 s, RailCore (13.6 MB) 153 s.

On small screens (a viewport up to 700 px wide, or a touch screen up to 1000 px wide) `view.html` does not auto-load the web app for any design: it shows the thumbnail as a poster, a note that the demo is best on a desktop or laptop, and a button "Open the 3D demo anyway (N MB)" (N from `app/wasm-asset.json`) that loads the app as on desktop.

`design` is relative to `/demo/`; `thumb` is relative to the site root. A design too large for the browser viewer goes up as an asset of this repository's `designs-2026-10-30` release instead: leave out `design` and give `"download": {"url": "<asset URL>", "size": "<size>"}`; the viewer page then shows the thumbnail and a download link. Without a `url`, the page says the download is coming soon. Use local files and unique IDs. Keep credit links separate from the card's viewer link. Check the card at phone width, `view.html?d=<id>`, its full-app and download links, and an unknown ID. Serve over HTTP; browsers may block JSON fetches when opened through `file://`.

## Add a social card

Add a `card` object with `title`, `line`, and `credit` strings to the design's gallery entry. Run `python3 scripts/make_design_cards.py` from the repository root with SolidCraft CLI and headless Chromium installed. For a download-only design, pass a local source, such as `--source voron-2-4=/path/to/voron-2-4r2.sc`; the source stays outside the site. Use `--snapshot <id>=/path/to/render.png` to reuse a render at least 1600 pixels in each dimension. Inspect `demo/d/<id>/og.png`, run `python3 scripts/check_gallery.py`, and share `/demo/d/<id>/`. The static page supplies the social tags and forwards visitors to the viewer. The gallery uses this link for designs with cards.

## Current conversions

All converted with Dutchman Convert 0.2.5 for SolidCraft 0.27.

- Robot arm: Fusion assembly from [Adriaeik/fusion2URDF](https://github.com/Adriaeik/fusion2URDF) (`examples/Assem1_description/Assem1.f3z`), MIT; 41 parts and 39 joints.
- RailCore II 300ZL: Fusion assembly from [railcore/parts](https://github.com/railcore/parts), by J. Steve White and Tony Akens, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). 379 of 379 parts placed; 153 of 416 features editable. The entry credits the authors, links the source and licence, and says what changed (converted to SolidCraft; the design is unchanged).
- Voron 2.4r2: Fusion assembly from [VoronDesign/Voron-2](https://github.com/VoronDesign/Voron-2), by Voron Design, [GPL-3.0](https://www.gnu.org/licenses/gpl-3.0.html). 1,683 of 1,683 parts placed, each body in its own colour. The converted file is a GPL-3.0 derivative; it is too large for the browser viewer, so it goes up as a release asset (download only). Not affiliated with Voron Design.

## Holding a broken release

List a SolidCraft version in `demo/solidcraft-hold.json` (`skip`) to keep the automatic bump from taking it, for example when its web app is broken. The demo stays on its current version until a release outside that list is current. Remove the entry once a fixed release is out.
