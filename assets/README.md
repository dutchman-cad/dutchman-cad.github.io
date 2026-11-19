# Landing page sources

- `railcore-solidcraft.webp` / `railcore-solidcraft@2x.webp` and the matching
  `-mobile` variants: new real SolidCraft 0.44.1 viewport captures. Xvfb ran
  at 3200 × 2000 with 192 dpi and the app at 2640 × 1680, using 2× UI scale.
  The camera was zoomed and panned in the app; the printer occupies about
  71% of the frame height, fully visible above the toolbar.
  The native desktop 2× crop is `(512, 318, 2528, 1578)`, 2016 × 1260.
  The mobile 2× crop is `(880, 318, 2160, 1578)`, 1280 × 1260.
  1× variants are downsampled by half with Lanczos. All are high-quality
  WebP (desktop quality 98 / 92, mobile 98 / 96), under 200 KB each.
- `railcore-printer-{title,summary,tail,losses}-{light,dark}`, each with
  1× and `@2x` PNGs: fresh real whole-printer conversion captures at 2× UI
  scale. Title crop: `(64, 430, 920, 506)`. First two summary lines:
  `(64, 860, 920, 940)`. Its final word, on the next native line:
  `(64, 940, 190, 980)`. Losses line from the bottom of the same result:
  `(64, 1300, 920, 1348)`. These are separate image elements, retaining
  their native left alignment and scale. The 2× PNGs match the original
  crops pixel for pixel; 1× variants are downsampled by half. No text or
  numbers were edited. Controls, paths and lengthy detail text are omitted.
  Body text remains above 13 px, including at a 400 px viewport.

The input archive is [RailCore II 300ZL - Nov 2019.f3z](https://github.com/railcore/parts/blob/master/F3Z/RailCore%20II%20300ZL%20-%20Nov%202019.f3z),
from the public RailCore/parts repository. SHA-256:
`eb4afd93e0a5bba9159090909532a91862385f8fcf17ee74c4b687fa45b434fe`.
For the fresh whole-printer conversion, the entire unmodified archive was
copied to a neutral folder as `RailCore 300ZL.f3z`. The bed file was not
renamed or used for this result. The input has the same SHA-256 above.
The new run placed 379 of 379 components, with 167 of 506 features rebuilt
and 2 kept and re-applied. The exact card text shown is:

> Converted RailCore 300ZL.f3z
>
> Partial editable history, 167 of 506 features rebuilt, 2 kept and re-applied to the final body; imported final shape visible.
>
> Losses: 1014 Info, 1058 Degraded, 119 Dropped

This run used the newest available GUI, built 2026-11-18 23:33 and labelled
0.2.10. Its detailed report includes unverified or differing retained
features; the hero shows only the first summary sentence and Losses line,
as requested. The 3D view is the same complete printer from this archive.

Capture followed the UI walk kit in a private Xvfb session with browser
stubs and isolated XDG folders. A real Xdnd file drop worked around the
file picker under Xvfb. The refreshed card uses a neutral RailCore folder
for both conversion output and diagnostics. Original captures and reports
are retained outside the published site.

RailCore II is by J. Steve White and Tony Akens, with additional
contributors credited in the source repository, under CC BY-SA 4.0.
The viewport and result card both refer to the complete printer. The card PNGs use lossless compression. Model images use high-quality WebP;
only real viewport captures supply their contents.

- `formats-0.2.10.json`: output of `dutchman formats --json` from the Linux x86_64
  binary in the GitHub v0.2.10 release. The archive was checked against the
  release's SHA-256 checksum. Labels use both `level` and `converts`; levels
  alone do not promise feature-history support. Onshape is separate preview
  information supplied for the upcoming 0.3.0 release.

NX geometry support for 0.3.0 is based on the review update that it has merged
on main; the archived 0.2.10 format report remains unchanged.

Round 3 support audit: reran `formats --json` from the 0.2.10 release binary;
it matches the archived report byte for byte. Cross-checked against
`crates/dutchman/src/formats.rs` and `docs/formats.md` at tag `v0.2.10`.
`.FCStd` is an input, including geometry, components, and mapped history and
joints. Fusion and Inventor part history is conditional on feature mapping.
SolidWorks parts carry geometry; both Inventor and SolidWorks assemblies read
placed parts and sub-assemblies from the project. CATIA, Rhino, Creo View,
ACIS and STEP carry geometry. Creo and NX are not converted in 0.2.10; IGES
must be imported directly in SolidCraft. NX and Onshape future-release labels
are kept separate from current support.

The support table groups Fusion archives, Inventor parts/assemblies, and
SolidWorks parts/assemblies into one row per program. Partial history means
where mapped; components and placed parts populate the Assemblies column.
Geometry-only entries do not claim history or placed assemblies. Onshape
capabilities are n/a because the 0.2.10 report does not list them. NX shape
is marked Yes only alongside its explicit coming-in-0.3.0 status, based on
the review's merged-main update; the archived report is unchanged. IGES is
not converted by Dutchman and instead points to SolidCraft's own importer.
