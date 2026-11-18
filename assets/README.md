# Landing page sources

- `convert-results-light.png`: cropped from our synthetic-cube UI screenshot,
  `~/builds/site-lane/preview-paired-1600-day.png`, bounds `(884, 462, 1440, 558)`.
- `convert-results-dark.png`: cropped from
  `~/builds/site-lane/preview-paired-1280-night.png`, bounds `(711, 415, 1237, 538)`.
- `convert-results-light-mobile.png` and `convert-results-dark-mobile.png`:
  tighter crops of the same screenshots showing the two main summary chips,
  at `(887, 507, 1115, 535)` and `(714, 458, 941, 485)`, respectively.
  Desktop crops show the result summary; mobile crops keep the main chips
  readable without shrinking them. PNG compression is optimised; no content
  is retouched.
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
