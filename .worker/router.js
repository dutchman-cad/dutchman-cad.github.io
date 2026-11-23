// dutchmancad.xyz: real 301 short links to GitHub, everything else served from the GitHub Pages site.
// Ray 11-21: dutchmancad.xyz links are real, consistent redirects, "from now on and always".
export const APEX = "dutchmancad.xyz";
export const REPO = "https://github.com/dutchman-cad/dutchman";
export const PAGES = "https://dutchman-cad.github.io";
export const PAGES_REPO = "https://github.com/dutchman-cad/dutchman-cad.github.io";
export const DISCORD = "https://discord.gg/yTcseBEdeu";
// First path segments that are GitHub repository routes: /<route>/... mirrors github.com/dutchman-cad/dutchman/<route>/...
export const REPO_ROUTES = new Set(["releases", "issues", "pull", "pulls", "blob", "tree", "raw", "commit", "commits",
  "compare", "actions", "tags", "discussions", "wiki", "security", "labels", "milestones"]);
// The SolidCraft web app's .wasm is too big for git: demo/app/wasm-asset.json names the release asset that holds it.
const WASM = /^\/demo\/app\/([A-Za-z0-9._-]+\.wasm)$/;
const VERSION = /^v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/;

// Where a request goes: {redirect: url} for a 301, or {proxy: url} to fetch from GitHub Pages.
export function route(url) {
  const u = new URL(url);
  const q = u.search;
  if (u.hostname === "www." + APEX) return { redirect: `https://${APEX}${u.pathname}${q}` };
  const segs = u.pathname.split("/").filter(Boolean);
  const first = segs[0] || "";
  const wasm = u.pathname.match(WASM);
  if (wasm) return { wasm: wasm[1] };
  if (segs.length === 1 || (segs.length === 0 && first)) {
    switch (first) {
      case "download": return { redirect: `${REPO}/releases/latest${q}` };
      case "plugin": return { redirect: `${REPO}/releases/latest/download/dutchman-plugin.zip${q}` };
      case "github": return { redirect: `${REPO}${q}` };
      case "discord": return { redirect: `${DISCORD}${q}` };
    }
  }
  if (first === "github" && segs.length > 1) return { redirect: `${REPO}/${segs.slice(1).join("/")}${trail(u)}${q}` };
  if (first === "releases" && segs.length === 2 && VERSION.test(segs[1]))
    return { redirect: `${REPO}/releases/tag/v${segs[1].match(VERSION)[1]}${q}` };
  if (REPO_ROUTES.has(first)) return { redirect: `${REPO}/${segs.join("/")}${trail(u)}${q}` };
  return { proxy: `${PAGES}${u.pathname}${q}` };
}
// Keep a trailing slash only where GitHub's path had one beyond the first segment (GitHub ignores it either way).
const trail = (u) => (u.pathname.length > 1 && u.pathname.endsWith("/") && u.pathname.split("/").filter(Boolean).length > 1 ? "/" : "");

// Serves the web app's .wasm from the release asset that demo/app/wasm-asset.json (on Pages) names; any other file name is a 404.
async function wasmAsset(req, file) {
  const none = () => new Response("Not found", { status: 404, headers: { "x-site-worker": "2" } });
  const m = await fetch(`${PAGES}/demo/app/wasm-asset.json?_w=2`, { cf: { cacheTtl: 300 } });
  if (!m.ok) return none();
  const a = await m.json().catch(() => null);
  if (!a || a.file !== file || !String(a.url).startsWith(`${PAGES_REPO}/releases/download/`)) return none();
  const res = await fetch(a.url, { method: req.method, redirect: "follow", cf: { cacheTtl: 31536000, cacheEverything: true } });
  if (!res.ok) return new Response("The web app file is not available", { status: 502, headers: { "x-site-worker": "2" } });
  const h = new Headers({ "content-type": "application/wasm", "cache-control": "public, max-age=31536000, immutable", "x-site-worker": "2" });
  for (const k of ["content-length", "etag"]) if (res.headers.get(k)) h.set(k, res.headers.get(k));
  return new Response(res.body, { status: 200, headers: h });
}

export default {
  async fetch(req) {
    const r = route(req.url);
    if (r.redirect) return new Response(null, { status: 301, headers: { location: r.redirect, "cache-control": "public, max-age=3600" } });
    if (req.method !== "GET" && req.method !== "HEAD") return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } });
    if (r.wasm) return wasmAsset(req, r.wasm);
    // A version marker in the upstream URL gives a fresh edge-cache entry (GitHub Pages ignores the query).
    const upstream = r.proxy + (r.proxy.includes("?") ? "&" : "?") + "_w=2";
    const res = await fetch(upstream, { method: req.method, headers: { "accept": req.headers.get("accept") || "*/*",
      "accept-encoding": req.headers.get("accept-encoding") || "", "user-agent": "dutchman-site-worker" }, redirect: "manual",
      // Never cache GitHub redirects at the edge (11-21: a 301 cached from before the cutover looped /og.png).
      cf: { cacheTtlByStatus: { "200-299": 600, "300-399": 0, "404": 60, "500-599": 0 } } });
    const h = new Headers(res.headers);
    // GitHub Pages redirects (e.g. /contribute -> /contribute/) name the github.io host; point them back at the apex.
    const loc = h.get("location");
    if (loc && loc.startsWith(PAGES)) {
      // Drop our cache-version marker so it never shows in a visitor's address bar.
      const out = new URL(`https://${APEX}${loc.slice(PAGES.length)}`);
      out.searchParams.delete("_w");
      h.set("location", out.toString());
    }
    for (const k of ["x-github-request-id", "x-fastly-request-id", "x-served-by", "x-cache", "x-cache-hits", "x-timer", "via"]) h.delete(k);
    h.set("x-site-worker", "2");
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
  },
};
