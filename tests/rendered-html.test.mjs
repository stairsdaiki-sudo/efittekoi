import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the エフィってこ morning training experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /エフィってこ！/);
  assert.match(html, /今日も、/);
  assert.match(html, /わたしなら/);
  assert.match(html, /朝の3分をはじめる/);
  assert.doesNotMatch(html, /codex-preview|Building your site|react-loading-skeleton/i);
});

test("copies the result card as a PNG without downloading it", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(source, /navigator\.clipboard\.write/);
  assert.match(source, /new ClipboardItem\(\{ "image\/png": imagePromise \}\)/);
  assert.match(source, /画像をコピー/);
  assert.doesNotMatch(source, /link\.download|画像を保存/);
});
