# Landing page sources

- `convert-results-light.png` and `convert-results-dark.png`: unretouched crops
  `(44, 810, 414, 942)` from fresh screenshots of the released 0.2.10 app,
  `~/builds/site-lane/round4/result-440-day.png` and `result-440-night.png`.
- `convert-title-light.png` and `convert-title-dark.png`: title crops
  `(44, 608, 414, 632)` from the same screenshots. Title and summary are shown
  as separate excerpts to omit the intervening paths and controls.
  The public M3 Parametric FHCS file is the UI walk's `1-full-FHCS.f3d`,
  copied into `~/builds/site-lane/round4/` with its descriptive name. The
  released app converted it with history checking enabled, using SolidCraft
  CLI 0.44.1. Its actual report records `mode: history`,
  `verification.status: verified`, and four of four features rebuilt and
  verified against the original. The screenshot retains the extrude caveat
  and loss counts. Only cropping and PNG compression were applied. The same
  excerpts are used on desktop and mobile; no temporary paths are visible.
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
