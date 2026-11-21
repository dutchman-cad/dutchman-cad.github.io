// dutchmancad.xyz: real 301 short links to GitHub, everything else served from the GitHub Pages site.
// Ray 11-21: dutchmancad.xyz links are real, consistent redirects, "from now on and always".
export const APEX = "dutchmancad.xyz";
export const REPO = "https://github.com/dutchman-cad/dutchman";
export const PAGES = "https://dutchman-cad.github.io";
export const DISCORD = "https://discord.gg/yTcseBEdeu";
// First path segments that are GitHub repository routes: /<route>/... mirrors github.com/dutchman-cad/dutchman/<route>/...
export const REPO_ROUTES = new Set(["releases", "issues", "pull", "pulls", "blob", "tree", "raw", "commit", "commits",
  "compare", "actions", "tags", "discussions", "wiki", "security", "labels", "milestones"]);
const VERSION = /^v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/;

// Where a request goes: {redirect: url} for a 301, or {proxy: url} to fetch from GitHub Pages.
export function route(url) {
  const u = new URL(url);
  const q = u.search;
  if (u.hostname === "www." + APEX) return { redirect: `https://${APEX}${u.pathname}${q}` };
  const segs = u.pathname.split("/").filter(Boolean);
  const first = segs[0] || "";
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

export default {
  async fetch(req) {
    const r = route(req.url);
    if (r.redirect) return new Response(null, { status: 301, headers: { location: r.redirect, "cache-control": "public, max-age=3600" } });
    if (req.method !== "GET" && req.method !== "HEAD") return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } });
    const res = await fetch(r.proxy, { method: req.method, headers: { "accept": req.headers.get("accept") || "*/*",
      "accept-encoding": req.headers.get("accept-encoding") || "", "user-agent": "dutchman-site-worker" }, redirect: "manual" });
    const h = new Headers(res.headers);
    // GitHub Pages redirects (e.g. /contribute -> /contribute/) name the github.io host; point them back at the apex.
    const loc = h.get("location");
    if (loc && loc.startsWith(PAGES)) h.set("location", `https://${APEX}${loc.slice(PAGES.length)}`);
    for (const k of ["x-github-request-id", "x-fastly-request-id", "x-served-by", "x-cache", "x-cache-hits", "x-timer", "via"]) h.delete(k);
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
  },
};
