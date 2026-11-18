# Landing page sources

- `convert-results-light.png`: cropped from our synthetic-cube UI screenshot,
  `~/builds/site-lane/preview-paired-1600-day.png`, bounds `(876, 104, 1558, 536)`.
- `convert-results-dark.png`: cropped from
  `~/builds/site-lane/preview-paired-1280-night.png`, bounds `(703, 104, 1238, 514)`.
  Both crops show only the results column, from the verdict and paired previews
  through the chips. PNG compression is optimised; no content is retouched.
- `formats-0.2.10.json`: output of `dutchman formats --json` from the Linux x86_64
  binary in the GitHub v0.2.10 release. The archive was checked against the
  release's SHA-256 checksum. Labels use both `level` and `converts`; levels
  alone do not promise feature-history support. Onshape is separate preview
  information supplied for the upcoming 0.3.0 release.

NX geometry support for 0.3.0 is based on the review update that it has merged
on main; the archived 0.2.10 format report remains unchanged.
