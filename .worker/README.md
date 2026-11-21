# dutchmancad.xyz Worker

`dutchmancad.xyz` and `www.dutchmancad.xyz` are served by the Cloudflare Worker `dutchman-site` (`router.js`):

- GitHub repository routes (`/releases/...`, `/issues/...`, `/pull/...`, `/blob/...`, `/tree/...` and the rest listed in `REPO_ROUTES`) are 301 redirects to the same path and query on `https://github.com/dutchman-cad/dutchman`.
- Short names: `/download` (latest release), `/plugin` (latest plugin zip), `/github` (the repo; `/github/<path>` for a path in it), `/discord` (the invite), and `/releases/X.Y.Z` or `/releases/vX.Y.Z` (that release).
- `www.` is a 301 to the apex, same path and query.
- Everything else is fetched from the GitHub Pages build of this repository at `https://dutchman-cad.github.io`, with its status (404 page included) and headers.

Pages must not have a custom domain (no `CNAME` file in this repository), or github.io would redirect back to the apex.

Tests: `npm test` in this folder. Deploy from aurora with the command at the top of `wrangler.toml`.
