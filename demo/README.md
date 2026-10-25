# Converted design gallery

Serve the repository with a static HTTP server (for example, `python3 -m http.server 8000`) and open `/demo/`. No build step, external scripts, or fonts are needed. `gallery.json` is the single entry list for both the gallery and viewer. The SolidCraft web build lives in `app/`; gallery updates do not require editing it.

## Add a design

Only publish designs whose licence allows redistribution. Credit the author and licence, and meet all licence conditions (including any required notices). Never use private designs, GrabCAD files, or volunteer-private files. Our public fixtures are CC0; that does not make unrelated designs public domain.

Adding an entry requires one JSON object and two files:

1. Convert the permitted source into `demo/designs/<id>.solidcraft`. Use `dutchman convert <source> <output> --solidcraft <path-to-solidcraft-cli> --json` and read the verification and loss report. For editable-history examples, require verification status `verified`. Describe only the features and joints that survived, including relevant losses. Do not count hidden backup imports or structural tree nodes as editable history steps.
2. Run `solidcraft-cli snapshot --in demo/designs/<id>.solidcraft --out demo/thumbs/<id>.png --width 640 --height 400 --view iso --no-grid --no-axes`. Inspect the PNG; adjust `--view` or `--camera` and repeat if blank or poorly framed.
3. Append an object to `demo/gallery.json`, following this schema:

```json
{
  "id": "unique-url-slug",
  "title": "Design title",
  "source_app": "FreeCAD",
  "what": "One line describing what came through.",
  "stats": "4 editable history steps · verified",
  "design": "designs/unique-url-slug.solidcraft",
  "thumb": "demo/thumbs/unique-url-slug.png",
  "credit": {
    "author": "Author or project",
    "licence": "CC0",
    "link": "https://example.org/public-source"
  },
  "hint": "Optional: what to try in the full app, and any conversion limitations."
}
```

`design` is relative to `/demo/`; `thumb` is relative to the site root. Use local files and unique IDs. Keep credit links separate from the card's viewer link. Check the card at phone width, `view.html?d=<id>`, its full-app and download links, and an unknown ID. Serve over HTTP; browsers may block JSON fetches when opened through `file://`.

## Current conversions

- Robot arm: Fusion assembly from [Adriaeik/fusion2URDF](https://github.com/Adriaeik/fusion2URDF), MIT; 41 parts and 36 joints. Existing design retained.
- History block: Dutchman CAD CC0 Fusion fixture; sketch, extrude, and fillet. Existing design retained.
- Counterbored block: [FreeCAD 1.1.4 F04b](https://github.com/dutchman-cad/fixtures/blob/main/files/freecad/1.1.4/F04b.FCStd), Dutchman CAD fixtures, CC0. Conversion status `verified`; two sketches, Pad, and Hole become four editable history steps. One symmetry constraint was omitted; geometry matched the source.
- Raised pad: [FreeCAD 1.1.4 F21a](https://github.com/dutchman-cad/fixtures/blob/main/files/freecad/1.1.4/F21a.FCStd), Dutchman CAD fixtures, CC0. Conversion status `verified`; two sketches and two additive extrudes become four editable history steps. One symmetry constraint per sketch was omitted; four parameters were renamed. Geometry matched the source.

Source licensing and fixture details: [FreeCAD fixture README](https://github.com/dutchman-cad/fixtures/blob/main/files/freecad/1.1.4/README.md) and [manifest](https://github.com/dutchman-cad/fixtures/blob/main/files/freecad/1.1.4/manifest.json).

## Next: RailCore II

Add the RailCore II printer once Dutchman converts it fully. Its licence is CC BY 3.0: credit RailCore and the authors, link the original source and licence, and identify conversion changes. Confirm and preserve the source's required attribution when preparing the entry.
