#!/usr/bin/env bash
# Replaces demo/app with the web build of the latest promoted SolidCraft release when it is newer.
# The .wasm stays out of git (over GitHub's 100 MB limit): it is unpacked next to the rest (for
# the load check), ignored by git, and demo/app/wasm-asset.json names the release asset that holds it
# (tag web-<version> on this repository; scripts/upload_wasm_asset.sh uploads it).
# Prints the new version on stdout when it changed, nothing when the demo is current.
set -euo pipefail
cd "$(dirname "$0")/.."
# Promoted = the prerelease flag is false AND the notes do not say "is a prerelease" (SolidCraft's
# flag is not always set: tangency-labs/solidcraft#21078). Drop the notes check once it is.
latest=""
while IFS=$'\t' read -r tag held; do
  if [ "$held" != "ok" ]; then echo "held back: $tag ($held)" >&2; continue; fi
  latest=${tag#v}; break
done < <(gh api "repos/tangency-labs/solidcraft/releases?per_page=30" --jq '.[] | select(.draft|not) | [.tag_name, (if .prerelease then "prerelease flag" elif ((.body // "") | test("is a prerelease"; "i")) then "notes say it is a prerelease" else "ok" end)] | @tsv')
# FORCE_VERSION (a person, deliberately) pins a specific release instead.
latest=${FORCE_VERSION:-$latest}
[ -n "$latest" ] || { echo "no promoted SolidCraft release found" >&2; exit 1; }
current=${FAKE_CURRENT:-$(python3 -c "import json;print(json.load(open('demo/app/build.json'))['version'].split('-')[0])")}
newest=$(printf '%s\n%s\n' "$current" "$latest" | sort -V | tail -1)
# FAKE_CURRENT (a test run) pretends the demo is on that older version.
if [ -z "${FAKE_CURRENT:-}" ] && [ -z "${FORCE_VERSION:-}" ] && [ "$newest" = "$current" ]; then exit 0; fi
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
gh release download "v$latest" -R tangency-labs/solidcraft -p "solidcraft-web-$latest.zip" -D "$tmp"
unzip -q "$tmp/solidcraft-web-$latest.zip" -d "$tmp/x"
rm -rf demo/app
cp -r "$tmp/x/solidcraft-web-$latest" demo/app
python3 - "$latest" <<'PY'
import json, sys, glob, os
v = sys.argv[1]
build = json.load(open('demo/app/build.json'))
wasm = [f for f in build['files'] if f['file'].endswith('.wasm')]
assert len(wasm) == 1, 'expected one .wasm in build.json'
name = wasm[0]['file']
json.dump({'file': name, 'version': v, 'sha256': wasm[0]['sha256'], 'size': os.path.getsize('demo/app/' + name),
           'url': f'https://github.com/dutchman-cad/dutchman-cad.github.io/releases/download/web-{v}/{name}'},
          open('demo/app/wasm-asset.json', 'w'), indent=1)
open('demo/app/wasm-asset.json', 'a').write('\n')
PY
sed -i "s/SolidCraft [0-9][0-9.]*'s \`solidcraft-web-[0-9][0-9.]*\.zip/SolidCraft $latest's \`solidcraft-web-$latest.zip/" demo/README.md
echo "$latest"
