import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { addToSitemap, checkPost, pickApp, renderPage, splitPost } from "./post-lib.mjs";

const facts = {
  app: { name: "조각지도", tagline: "사진으로 채우는 전국 지도", app_store: "https://apps.apple.com/kr/app/id1", google_play: null },
  facts: [
    { id: "regions-167", fact: "지역은 시·군 단위로 전국 167개다." },
    { id: "zoom-8x", fact: "지도를 8배까지 확대한다." },
  ],
  avoid: [{ id: "screen-words", words: ["퀼트"] }],
};
const root = fs.mkdtempSync(path.join(os.tmpdir(), "post-test-"));
fs.mkdirSync(path.join(root, "site", "mapquilt"), { recursive: true });

const reply = (over = {}, body = "전국 시·군은 167곳으로 나눠 셀 수 있어요.\n\n하나씩 채워 보세요.") => {
  const meta = { slug: "how-many-regions", title: "전국 시·군은 몇 곳일까", description: "167곳으로 나눠요", facts: "[regions-167]", ...over };
  return `---\n${Object.entries(meta).map(([k, v]) => `${k}: ${v}`).join("\n")}\n---\n\n${body}\n`;
};
const check = (text, posts = []) => checkPost(splitPost(text), facts, posts, root, "mapquilt");

test("지킨 글은 통과한다", () => {
  assert.deepEqual(check(reply()), []);
});

test("앞뒤 ``` 울타리는 걷어 낸다", () => {
  assert.deepEqual(check("```markdown\n" + reply() + "```"), []);
});

test("고른 사실에 없는 숫자는 떨어진다", () => {
  assert.match(check(reply({}, "8배까지 확대해요."))[0], /없는 숫자: 8/);
});

test("사실 목록에 없는 id는 떨어진다", () => {
  assert.ok(check(reply({ facts: "[nope]" })).some((e) => e.includes("없는 id: nope")));
});

test("본문이 길면 떨어진다", () => {
  assert.ok(check(reply({}, "가".repeat(301))).some((e) => e.includes("300자")));
});

test("쓰지 않는 말은 떨어진다", () => {
  assert.ok(check(reply({}, "퀼트를 채워요.")).some((e) => e.includes("screen-words")));
});

test("주소와 목록 기호는 떨어진다", () => {
  const errors = check(reply({}, "- 목록\n\nhttps://example.com"));
  assert.ok(errors.some((e) => e.includes("주소")));
  assert.ok(errors.some((e) => e.includes("목록 기호")));
});

test("이미 쓴 제목과 주소는 떨어진다", () => {
  const errors = check(reply(), [{ slug: "how-many-regions", title: "전국 시·군은 몇 곳일까" }]);
  assert.ok(errors.some((e) => e.includes("이미 있는 주소")));
  assert.ok(errors.some((e) => e.includes("이미 쓴 제목")));
});

test("머리말이 없으면 던진다", () => {
  assert.throws(() => splitPost("그냥 글"), /머리말/);
});

test("앱은 날마다 돌아가며 고른다", () => {
  const r = fs.mkdtempSync(path.join(os.tmpdir(), "pick-test-"));
  for (const a of ["b-app", "a-app"]) {
    fs.mkdirSync(path.join(r, "apps", a), { recursive: true });
    fs.writeFileSync(path.join(r, "apps", a, "facts.yaml"), "facts: []\n");
  }
  fs.mkdirSync(path.join(r, "apps", "no-facts"));
  const picks = new Set(["2026-11-10", "2026-11-11"].map((d) => pickApp(r, d)));
  assert.deepEqual([...picks].sort(), ["a-app", "b-app"]);
});

test("페이지는 글자를 이스케이프하고 sitemap에 한 번만 더한다", () => {
  const html = renderPage(splitPost(reply({}, "<b>167곳</b>")), facts, "mapquilt", "2026-11-10", root);
  assert.ok(html.includes("&lt;b&gt;167곳&lt;/b&gt;"));
  assert.ok(html.includes('<link rel="canonical" href="https://tentmakerapps.com/mapquilt/how-many-regions/" />'));
  const xml = '<urlset>\n</urlset>\n';
  const once = addToSitemap(xml, "https://tentmakerapps.com/mapquilt/a/", "2026-11-10");
  assert.equal(addToSitemap(once, "https://tentmakerapps.com/mapquilt/a/", "2026-11-10"), once);
});
