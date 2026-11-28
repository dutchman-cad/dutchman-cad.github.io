// Opens every design in the gallery in the embedded SolidCraft web app and fails if one does not load.
// Usage: node scripts/check_demo_load.mjs [--out DIR] [--wait SECONDS] [--only ID] [--no-heavy | --heavy-only]
// Heavy designs (a gallery entry with `heavy`, such as RailCore at about 12 minutes in software rendering) are
// left to the nightly run: the per-release run passes --no-heavy.
// --base URL checks a running copy of the site (for example the Worker in front of dutchmancad.xyz) instead of serving this checkout; the .wasm then
// comes from whatever that site serves.
// Needs playwright-core (PLAYWRIGHT_MODULE=/path/to/playwright-core/index.mjs, or resolvable) and
// Chromium (CHROME=/path/to/chrome, or Playwright's own). Serves the repository itself on a free port.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
import crypto from 'node:crypto';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const out = path.resolve(arg('--out', 'demo-load-shots'));
const waitSec = Number(arg('--wait', '60'));
const only = arg('--only', '');
const noHeavy = process.argv.includes('--no-heavy'), heavyOnly = process.argv.includes('--heavy-only');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.wasm': 'application/wasm', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.sc': 'application/octet-stream', '.webmanifest': 'application/manifest+json' };


// Decodes an 8-bit RGB or RGBA PNG (what Chromium writes) into { w, h, bpp, px }.
function decodePng(buf) {
  let o = 8, w = 0, h = 0, bpp = 4; const idat = [];
  while (o < buf.length) {
    const len = buf.readUInt32BE(o), type = buf.toString('latin1', o + 4, o + 8), d = buf.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); bpp = d[9] === 6 ? 4 : 3; }
    if (type === 'IDAT') idat.push(d);
    o += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp, px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0, b = y ? px[(y - 1) * stride + x] : 0, c = x >= bpp && y ? px[(y - 1) * stride + x - bpp] : 0;
      const pr = Math.abs(b - c) < Math.abs(a - c) && Math.abs(b - c) < Math.abs(a + b - 2 * c) ? b : Math.abs(a - c) <= Math.abs(a + b - 2 * c) ? a : c;
      px[y * stride + x] = (line[x] + (f === 0 ? 0 : f === 1 ? a : f === 2 ? b : f === 3 ? (a + b) >> 1 : pr)) & 255;
    }
  }
  return { w, h, bpp, px };
}
// A design counts as open when the viewport (not the browser panel, toolbars or the progress
// toast) shows lit model faces: an empty scene is only the dark grid and the origin planes.
function modelVisible(png) {
  const { w, h, bpp, px } = decodePng(png);
  let lit = 0, chroma = 0, total = 0;
  for (let y = Math.floor(h * 0.12); y < h * 0.82; y += 2) for (let x = Math.floor(w * 0.3); x < w * 0.8; x += 2) {
    const i = (y * w + x) * bpp; total++;
    if (0.3 * px[i] + 0.6 * px[i + 1] + 0.1 * px[i + 2] > 150) lit++;
    // A saturated colour (a green part) counts too: SolidCraft 0.51 shades the same parts darker, so
    // the robot arm's green no longer reaches the brightness above. An empty scene has about 0.2 % of
    // such pixels (the origin planes), an open design 2 % or more.
    if (Math.max(px[i], px[i + 1], px[i + 2]) - Math.min(px[i], px[i + 1], px[i + 2]) > 100) chroma++;
  }
  return lit / total > 0.004 || chroma / total > 0.01;
}

const server = http.createServer((req, res) => {
  let p = path.normalize(path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
  if (p.startsWith(root) && fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = arg('--base', '') || `http://127.0.0.1:${server.address().port}`;
const external = !!arg('--base', '');
const liveSite = external && new URL(base).hostname === 'dutchmancad.xyz';
// The .wasm (over 200 MB) is not in git. Download the release asset the manifest names to disk
// once, checking its SHA-256, so the local server streams it: passing it through Playwright's
// route.fetch buffered the whole file and the page died.
if (!external) {
  const a = JSON.parse(fs.readFileSync(path.join(root, 'demo/app/wasm-asset.json'), 'utf8'));
  const local = path.join(root, 'demo/app', a.file);
  const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  if (!fs.existsSync(local) || sha(local) !== a.sha256) {
    const r = await fetch(a.url);
    if (!r.ok) throw new Error(`could not download ${a.url}: ${r.status}`);
    const tmp = local + '.part';
    await pipeline(Readable.fromWeb(r.body), fs.createWriteStream(tmp));
    if (sha(tmp) !== a.sha256) { fs.rmSync(tmp); throw new Error(`${a.file}: SHA-256 differs from wasm-asset.json`); }
    fs.renameSync(tmp, local);
  }
}

const spec = process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright-core';
const { chromium } = await import(spec);
const browser = await chromium.launch({
  executablePath: process.env.CHROME || undefined,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--disable-features=WebGPU'],
});
fs.mkdirSync(out, { recursive: true });
const entries = JSON.parse(fs.readFileSync(path.join(root, 'demo/gallery.json'), 'utf8')).filter(e => (!only || e.id === only) && !(noHeavy && e.heavy) && !(heavyOnly && !e.heavy));
const version = JSON.parse(fs.readFileSync(path.join(root, 'demo/app/build.json'), 'utf8')).version;
console.log(`SolidCraft web app ${version}`);

let failed = 0;
for (const e of entries) {
  if (!e.design) { console.log(`SKIP ${e.id}: download only, no embedded design`); continue; }
  const start0 = Date.now();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const problems = [];
  let designOk = false;
  page.on('pageerror', x => problems.push('page error: ' + String(x).slice(0, 200)));
  // "Failed to load resource" names no URL; failed requests are judged by URL below instead, so a
  // third-party beacon a network blocks (Cloudflare's analytics) is not a failure of the demo.
  page.on('console', m => { if (m.type() === 'error' && !/status of 404|Failed to load resource/.test(m.text())) problems.push('console error: ' + m.text().slice(0, 200)); });
  page.on('requestfailed', r => {
    const u = new URL(r.url()), why = (r.failure() && r.failure().errorText) || '';
    const firstParty = u.hostname === 'dutchmancad.xyz' || r.url().startsWith(base);
    if (firstParty && why !== 'net::ERR_ABORTED') problems.push(`request failed: ${u.pathname} (${why})`);
  });
  page.on('response', r => { if (r.status() === 404) problems.push('404: ' + r.url()); });
  page.on('response', r => { if (r.url().endsWith(e.design.replace(/^.*\//, ''))) designOk = r.ok(); });
  // The viewer page asks for the design at its production address; serve it from this checkout.
  // (Checking the live site itself needs no rerouting.)
  if (!liveSite) await page.route('https://dutchmancad.xyz/**', async route => {
    const r = await route.fetch({ url: base + new URL(route.request().url()).pathname });
    await route.fulfill({ response: r });
  });
  await page.goto(`${base}/demo/view.html?d=${e.id}`);
  const gate = page.locator('#gate-load');
  if (await gate.isVisible().catch(() => false)) await gate.click();
  const limit = waitSec * 1000 * (e.heavy ? 8 : 1), start = Date.now();
  const frame = page.locator('#viewer');
  await frame.scrollIntoViewIfNeeded().catch(() => {});
  let opened = 0;
  while (Date.now() - start < limit && opened < 3) {
    await page.waitForTimeout(3000);
    // The app blocks the page while it opens a big design, so a screenshot may time out meanwhile.
    const shot = await frame.screenshot({ timeout: 20000 }).catch(() => null);
    opened = shot && modelVisible(shot) ? opened + 1 : 0;
  }
  await page.screenshot({ path: path.join(out, `${e.id}.png`), timeout: 60000 }).catch(() => problems.push('no screenshot: the page is frozen'));
  // A page frozen while a big design opens may only answer once it is done: one last look.
  if (opened < 3) { const last = await frame.screenshot({ timeout: 120000 }).catch(() => null); if (last && modelVisible(last)) opened = 3; }
  if (opened < 3) problems.push(`the design was not open after ${waitSec * (e.heavy ? 8 : 1)} s (see ${e.id}.png)`);
  if (!designOk) problems.push('the design file was not fetched');
  console.log(`${problems.length ? 'FAIL' : 'ok  '} ${e.id} (${Math.round((Date.now() - start0) / 1000)} s)${problems.length ? ': ' + problems.slice(0, 5).join(' | ') : ''}`);
  if (problems.length) failed++;
  await page.close();
}
await browser.close();
server.close();
if (failed) { console.error(`${failed} design(s) did not load`); process.exit(1); }
