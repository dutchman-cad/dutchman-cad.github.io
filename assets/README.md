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
- `railcore-title-{light,dark}` and `railcore-summary-{light,dark}`, each
  with 1× and `@2x` PNGs: fresh real Dutchman Convert captures at 2× UI
  scale. Title crop: `(64, 734, 920, 812)`, 856 × 78. Summary and Losses
  crop: `(64, 1164, 920, 1344)`, 856 × 180. These are two separate image
  elements; the omitted controls, capability, log and output rows are not
  part of either image. The 2× PNGs match the native crops pixel for pixel;
  the 1× variants are downsampled by half. No text or numbers were edited.
  Displaying the card at 400 CSS pixels wide keeps its body text above
  13 px. At a 400 px viewport, the 398 px card follows the printer without
  overlap and also keeps body text above 13 px.

The input archive is [RailCore II 300ZL - Nov 2019.f3z](https://github.com/railcore/parts/blob/master/F3Z/RailCore%20II%20300ZL%20-%20Nov%202019.f3z),
from the public RailCore/parts repository. SHA-256:
`eb4afd93e0a5bba9159090909532a91862385f8fcf17ee74c4b687fa45b434fe`.
The full conversion placed 379 of 379 components and produced a partial
history (167 of 506 features rebuilt, with 2 kept and re-applied).

For the compact full card, the archive's unmodified
`56626b2f-7382-4b0a-b53e-c9c0ef1f46f1.f3d` member (`300ZL Bed` in
`DesignDescription.json`) was named `RailCore 300ZL Bed.f3d`
and converted again in the app. Its exact displayed outcome is:

> Converted RailCore 300ZL Bed.f3d
>
> Partial editable history, 3 of 8 features rebuilt; imported final shape visible. 1 rebuilt extrude may use the wrong sketch region; it couldn't be checked against the source.
>
> Losses: 36 Info, 20 Degraded

The full-printer conversion used the GUI built 2026-11-18 15:32, source
revision `7bad9c37`, with the same conversion code as main's `16f61ba8`.
The fresh bed conversion and 2× card captures used released v0.2.10;
the earlier main build was no longer available. The displayed result
remains exactly the same, including its unverified-extrude warning.

Capture followed the UI walk kit in a private Xvfb session with browser
stubs and isolated XDG folders. A real Xdnd file drop worked around the
file picker under Xvfb. The refreshed card uses a neutral RailCore folder
for both conversion output and diagnostics. Original captures and reports
are retained outside the published site.

RailCore II is by J. Steve White and Tony Akens, with additional
contributors credited in the source repository, under CC BY-SA 4.0.
The full converted printer and the bed card are distinct, clearly labelled
examples. The card PNGs use lossless compression. Model images use high-quality WebP;
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
