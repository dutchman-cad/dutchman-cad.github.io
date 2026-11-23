#!/usr/bin/env bash
# Uploads demo/app's .wasm as the release asset demo/app/wasm-asset.json names (tag web-<version>
# on this repository), if it is not there yet. The Cloudflare Worker serves it at /demo/app/<file>.
set -euo pipefail
cd "$(dirname "$0")/.."
read -r file version sha < <(python3 -c "import json;a=json.load(open('demo/app/wasm-asset.json'));print(a['file'],a['version'],a['sha256'])")
echo "$sha  demo/app/$file" | sha256sum -c --quiet
tag="web-$version"
if gh release view "$tag" >/dev/null 2>&1; then exit 0; fi
gh release create "$tag" "demo/app/$file" --title "SolidCraft $version web app" \
  --notes "The .wasm of SolidCraft $version's web app, from its solidcraft-web-$version.zip release asset. Served by the site at /demo/app/$file." --latest=false
