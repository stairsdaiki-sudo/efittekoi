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
  assert.match(source, /await navigator\.share\(\{\s*files: \[file\],\s*\}\)/s);
  assert.match(source, /画像をコピー/);
  assert.match(source, /自分の素晴らしいところは？/);
  assert.match(source, /自分の最高の未来は？/);
  assert.match(source, /今日を最高の1日にするために何をする？/);
  assert.match(source, /replace\(\/\\r\\n\?\/g, "\\n"\)\.split\("\\n"\)/);
  assert.doesNotMatch(source, /MY GREATNESS|MY BEST FUTURE|TODAY'S ONE STEP|maxLines/);
  assert.doesNotMatch(source, /link\.download|画像を保存|text:\s*"今日も、わたしならできる。/);
});

test("builds a varied daily report from the answers and MBTI", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(source, /function detectTheme\(answers: Answers\)/);
  assert.match(source, /function createDailyReport\(answers: Answers, mbti: string/);
  assert.match(source, /hashText\(`\$\{answers\.wonderful\}\|\$\{answers\.future\}\|\$\{answers\.action\}\|\$\{type\}/);
  assert.match(source, /\.join\("\\n\\n"\)/);
  assert.match(source, /advice\.powerLine/);
  assert.doesNotMatch(source, /思考を成果に変える日|勢いを味方にする日|最重要タスクに45分|5分だけ手を動かして/);
});

test("uses a dedicated optimized photo background for every screen", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const names = ["welcome", "question-1", "question-2", "question-3", "mbti", "result"];

  assert.match(source, /photo-question-\$\{questionIndex \+ 1\}/);
  assert.match(source, /screen-photo/);
  assert.match(source, /loadCanvasImage\("\/backgrounds\/result\.webp"\)/);
  assert.match(css, /\.share-card[^}]*url\("\/backgrounds\/result\.webp"\)/);

  for (const name of names) {
    assert.match(css, new RegExp(`/backgrounds/${name}\\.webp`));
    const asset = await readFile(new URL(`../public/backgrounds/${name}.webp`, import.meta.url));
    assert.ok(asset.length > 1_000, `${name}.webp should contain an optimized photo`);
  }
});
