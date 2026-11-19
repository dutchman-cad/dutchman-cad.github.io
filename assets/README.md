# Landing page sources

- `railcore-solidcraft.webp` and `railcore-solidcraft-mobile.webp`: new real
  SolidCraft 0.44.1 viewport captures of the converted full printer. The
  camera was zoomed out and panned in the app, leaving the complete printer
  above the bottom toolbar and space beside it for the result window.
  Desktop is a native 1008 × 630 crop `(256, 159, 1264, 789)`; mobile is a
  native 720 × 630 crop `(256, 159, 976, 789)` of the same capture. WebP
  compression is lossless, with no painting, retouching or resampling.
- `railcore-summary-light.png` and `railcore-summary-dark.png`: native
  428 × 311 crops `(0, 0, 428, 311)` of the mobile result captures below,
  retaining the title, controls, summary and losses. Desktop displays these
  at 400 CSS pixels wide, keeping the 14 px body text above 13 px.
- `railcore-results-light-mobile.png` and `railcore-results-dark-mobile.png`:
  the complete 428 × 433 result card, captured after resizing the real app
  window. Original capture bounds: `(32, 359, 460, 792)`. Mobile displays
  the whole card below the printer, without overlap; at a 400 px viewport
  its body text is just over 13 px. No text, pixels or counts were retouched.

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

Both runs used the GUI built 2026-11-18 15:32. Its source revision
`7bad9c37` has the same application/conversion code as main's `16f61ba8`;
changes through main `f0748301` were CI/documentation changes.

Capture followed the UI walk kit in a private Xvfb session with browser
stubs and isolated XDG folders. A real Xdnd file drop worked around the
file picker under Xvfb. The refreshed card uses a neutral RailCore folder
for both conversion output and diagnostics. Original captures and reports
are retained outside the published site.

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
