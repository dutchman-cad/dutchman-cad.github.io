# Landing page sources

- `railcore-results-light.png` and `railcore-results-dark.png`: complete, native
  567 × 361 app-card crops `(729, 104, 1296, 465)` from the new real GUI
  screenshots `~/builds/site-lane/round5/shots/bed-result-day.png` and
  `bed-status.png`. No text, pixels or counts were retouched or rescaled.
  The card is displayed at its native CSS dimensions on desktop and scaled
  down as one whole image on mobile.
- `railcore-solidcraft.png`: unretouched native 570 × 327 viewport crop
  `(292, 159, 862, 486)` from `round5/shots/railcore-model-clean.png`.
  This is the newly converted full printer open in a private SolidCraft
  0.44.1 window, rather than a preview inside Dutchman Convert. The page
  labels the full printer view and its bed's conversion card separately.

The input archive is [RailCore II 300ZL - Nov 2019.f3z](https://github.com/railcore/parts/blob/master/F3Z/RailCore%20II%20300ZL%20-%20Nov%202019.f3z),
from the public RailCore/parts repository, saved as
`~/RailCore/RailCore II 300ZL.f3z`. SHA-256:
`eb4afd93e0a5bba9159090909532a91862385f8fcf17ee74c4b687fa45b434fe`.
The full conversion placed 379 of 379 components and produced a partial
history (167 of 506 features rebuilt, with 2 kept and re-applied).

For the compact full card, the archive's unmodified
`56626b2f-7382-4b0a-b53e-c9c0ef1f46f1.f3d` member (`300ZL Bed` in
`DesignDescription.json`) was saved as `~/RailCore/RailCore 300ZL Bed.f3d`
and converted again in the app. Its exact displayed outcome is:

> Converted RailCore 300ZL Bed.f3d
>
> Partial editable history, 3 of 8 features rebuilt; imported final shape visible. 1 rebuilt extrude may use the wrong sketch region; it couldn't be checked against the source.
>
> Losses: 36 Info, 20 Degraded

Both runs used the newest available GUI under `~/builds`,
`buildq-target/dutchman/dm-ci-audit-check-4485e3d5/debug/dutchman-gui`
(built 2026-11-18 15:32). Its source revision `7bad9c37` has the same
application/conversion code as main's `16f61ba8`; later changes through
main `f0748301` were CI/documentation changes. Output remains in the clean
`~/RailCore/RailCore II 300ZL (SolidCraft)/` folder.

Capture followed the UI walk kit in a private Xvfb :89 session with browser
stubs and private XDG folders. A real Xdnd file drop worked around the
newer build's file picker under Xvfb. The source captures, conversion
reports, helper scripts and full-printer result are retained outside the
site under `~/builds/site-lane/round5/` and `~/RailCore/`.

RailCore II is by J. Steve White and Tony Akens, with additional
contributors credited in the source repository, under CC BY-SA 4.0.
The full converted printer and the bed card are distinct, clearly labelled
examples. PNG compression is lossless; only window/viewport crops were made.

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
