import test from "node:test";
import assert from "node:assert/strict";
import worker, { route, REPO, PAGES, PAGES_REPO } from "../router.js";
const A = "https://dutchmancad.xyz";
const r = (p) => route(A + p);
test("GitHub repo routes mirror github.com/dutchman-cad/dutchman with path and query", () => {
  for (const seg of ["releases", "issues", "pull", "pulls", "blob", "tree", "raw", "commit", "commits", "compare", "actions",
    "tags", "discussions", "wiki", "security", "labels", "milestones"])
    assert.deepEqual(r(`/${seg}/x/y?a=1&b=2`), { redirect: `${REPO}/${seg}/x/y?a=1&b=2` }, seg);
  assert.deepEqual(r("/releases/tag/v0.3.0"), { redirect: `${REPO}/releases/tag/v0.3.0` });
  assert.deepEqual(r("/releases/download/v0.3.0/dutchman-plugin.zip"), { redirect: `${REPO}/releases/download/v0.3.0/dutchman-plugin.zip` });
  assert.deepEqual(r("/issues/12"), { redirect: `${REPO}/issues/12` });
  assert.deepEqual(r("/pull/7/files"), { redirect: `${REPO}/pull/7/files` });
  assert.deepEqual(r("/blob/main/README.md"), { redirect: `${REPO}/blob/main/README.md` });
});
test("bare repo routes", () => {
  assert.deepEqual(r("/releases"), { redirect: `${REPO}/releases` });
  assert.deepEqual(r("/releases/"), { redirect: `${REPO}/releases` });
  assert.deepEqual(r("/issues?q=is%3Aopen"), { redirect: `${REPO}/issues?q=is%3Aopen` });
});
test("short names", () => {
  assert.deepEqual(r("/download"), { redirect: `${REPO}/releases/latest` });
  assert.deepEqual(r("/download/"), { redirect: `${REPO}/releases/latest` });
  assert.deepEqual(r("/plugin"), { redirect: `${REPO}/releases/latest/download/dutchman-plugin.zip` });
  assert.deepEqual(r("/github"), { redirect: REPO });
  assert.deepEqual(r("/github/blob/main/LICENSE"), { redirect: `${REPO}/blob/main/LICENSE` });
  assert.deepEqual(r("/discord"), { redirect: "https://discord.gg/yTcseBEdeu" });
  assert.deepEqual(r("/download?utm=x"), { redirect: `${REPO}/releases/latest?utm=x` });
});
test("release versions", () => {
  assert.deepEqual(r("/releases/0.3.0"), { redirect: `${REPO}/releases/tag/v0.3.0` });
  assert.deepEqual(r("/releases/v0.3.0"), { redirect: `${REPO}/releases/tag/v0.3.0` });
  assert.deepEqual(r("/releases/0.3.0-rc.9"), { redirect: `${REPO}/releases/tag/v0.3.0-rc.9` });
  assert.deepEqual(r("/releases/latest"), { redirect: `${REPO}/releases/latest` });
});
test("www goes to the apex, same path and query", () => {
  assert.deepEqual(route("https://www.dutchmancad.xyz/contribute/?a=1"), { redirect: "https://dutchmancad.xyz/contribute/?a=1" });
  assert.deepEqual(route("https://www.dutchmancad.xyz/"), { redirect: "https://dutchmancad.xyz/" });
});
test("site pages proxy to GitHub Pages", () => {
  for (const p of ["/", "/contribute/", "/contribute", "/demo/", "/og.png", "/favicon.ico", "/favicon.svg", "/favicon-32.png", "/apple-touch-icon.png", "/llms.txt", "/view.html", "/report-policy.json",
    "/assets/x.css", "/nope", "/githubx", "/downloads"])
    assert.deepEqual(r(p), { proxy: PAGES + p }, p);
  assert.deepEqual(r("/view.html?f=1"), { proxy: `${PAGES}/view.html?f=1` });
});
test("hash is client-side: a 301 Location without a fragment keeps the browser's fragment", () => {
  // Browsers never send #frag; per RFC 9110 they re-apply it to a Location without one. So Location must not carry one.
  assert.ok(!r("/releases/tag/v0.3.0").redirect.includes("#"));
});
test("fetch: 301 with Location; proxy rewrites Pages redirects back to the apex and keeps status", async () => {
  const red = await worker.fetch(new Request(A + "/discord"));
  assert.equal(red.status, 301); assert.equal(red.headers.get("location"), "https://discord.gg/yTcseBEdeu");
  const orig = globalThis.fetch;
  try {
    globalThis.fetch = async (url) => url.replace(/[?&]_w=2$/, "") === `${PAGES}/contribute`
      ? new Response(null, { status: 301, headers: { location: `${PAGES}/contribute/?_w=2` } })
      : new Response("nf", { status: 404, headers: { "content-type": "text/html", "x-github-request-id": "1" } });
    const c = await worker.fetch(new Request(A + "/contribute"));
    assert.equal(c.status, 301); assert.equal(c.headers.get("location"), "https://dutchmancad.xyz/contribute/");
    const n = await worker.fetch(new Request(A + "/nope"));
    assert.equal(n.status, 404); assert.equal(await n.text(), "nf"); assert.equal(n.headers.get("x-github-request-id"), null);
    const post = await worker.fetch(new Request(A + "/", { method: "POST" }));
    assert.equal(post.status, 405);
  } finally { globalThis.fetch = orig; }
});

test("the web app's wasm is served from the release asset the manifest names", async () => {
  assert.deepEqual(r("/demo/app/solidcraft-web-abc_bg.wasm"), { wasm: "solidcraft-web-abc_bg.wasm" });
  assert.deepEqual(r("/demo/app/x/y.wasm"), { proxy: `${PAGES}/demo/app/x/y.wasm` });
  const asset = `${PAGES_REPO}/releases/download/web-0.46.2/solidcraft-web-abc_bg.wasm`;
  const orig = globalThis.fetch;
  try {
    globalThis.fetch = async (url) => {
      const u = String(url);
      if (u.startsWith(`${PAGES}/demo/app/wasm-asset.json`)) return new Response(JSON.stringify({ file: "solidcraft-web-abc_bg.wasm", url: asset }));
      if (u === asset) return new Response("wasm-bytes", { headers: { "content-length": "10" } });
      return new Response("no", { status: 404 });
    };
    const ok = await worker.fetch(new Request(A + "/demo/app/solidcraft-web-abc_bg.wasm"));
    assert.equal(ok.status, 200);
    assert.equal(ok.headers.get("content-type"), "application/wasm");
    assert.match(ok.headers.get("cache-control"), /immutable/);
    assert.equal(ok.headers.get("x-site-worker"), "2");
    assert.equal(await ok.text(), "wasm-bytes");
    const other = await worker.fetch(new Request(A + "/demo/app/other_bg.wasm"));
    assert.equal(other.status, 404);
  } finally { globalThis.fetch = orig; }
});
