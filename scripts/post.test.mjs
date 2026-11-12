import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import YAML from "yaml";
import {
  addToSitemap,
  checkPost,
  pickApps,
  rebuildApp,
  renderPage,
  splitPost,
} from "./post-lib.mjs";

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

test("블로그 주소(posts)는 slug로 쓰지 않는다", () => {
  assert.ok(check(reply({ slug: "posts" })).some((e) => e.includes("이미 있는 주소")));
});

test("rebuild는 글 페이지·블로그 쪽·sitemap을 만들고 다시 돌려도 같다", () => {
  const r = fs.mkdtempSync(path.join(os.tmpdir(), "rebuild-test-"));
  const postsDir = path.join(r, "apps", "mapquilt", "posts");
  fs.mkdirSync(postsDir, { recursive: true });
  fs.writeFileSync(path.join(r, "apps", "mapquilt", "facts.yaml"), YAML.stringify(facts));
  // 12편: p01(11-01, 가장 오래된 글) … p12(11-12, 가장 새 글)
  for (let i = 1; i <= 12; i++) {
    const n = String(i).padStart(2, "0");
    const md = `---\nslug: "p${n}"\ntitle: "글 ${n} <b>"\ndescription: "설명"\nfacts: [regions-167]\ndate: "2026-11-${n}"\n---\n\n본문 ${n}\n\n둘째 문단\n`;
    fs.writeFileSync(path.join(postsDir, `p${n}.md`), md);
  }
  const site = (...p) => path.join(r, "site", "mapquilt", ...p);
  fs.mkdirSync(site("posts", "9"), { recursive: true }); // 남아 있던 옛 쪽
  const sitemap = path.join(r, "site", "sitemap.xml");
  fs.writeFileSync(sitemap, "<urlset>\n  <url><loc>https://tentmakerapps.com/mapquilt/</loc></url>\n</urlset>\n");
  const read = (...p) => fs.readFileSync(site(...p), "utf8");
  const snapshot = () =>
    [["p01", "index.html"], ["posts", "index.html"], ["posts", "2", "index.html"]].map((p) => read(...p)).concat(fs.readFileSync(sitemap, "utf8"));

  rebuildApp(r, "mapquilt");
  const first = snapshot();

  // 1쪽: 새 글 10편을 본문까지, 2쪽으로 넘기는 링크
  const page1 = read("posts", "index.html");
  assert.equal(page1.match(/<article>/g).length, 10);
  assert.ok(page1.indexOf('href="/mapquilt/p12/"') < page1.indexOf('href="/mapquilt/p03/"'));
  assert.ok(!page1.includes('href="/mapquilt/p02/"'));
  assert.ok(page1.includes("<p>본문 12</p>") && page1.includes("<p>둘째 문단</p>"));
  assert.ok(page1.includes("글 12 &lt;b&gt;"));
  assert.ok(page1.includes('<a href="/mapquilt/posts/2/">지난 글 →</a>'));
  assert.ok(page1.includes("<span>1 / 2</span>"));
  // 2쪽: 남은 2편, 1쪽으로 돌아가는 링크, 자기 주소가 canonical, 옛 쪽은 지운다
  const page2 = read("posts", "2", "index.html");
  assert.equal(page2.match(/<article>/g).length, 2);
  assert.ok(page2.includes('<a href="/mapquilt/posts/">← 새 글</a>'));
  assert.ok(page2.includes('<link rel="canonical" href="https://tentmakerapps.com/mapquilt/posts/2/" />'));
  assert.ok(!fs.existsSync(site("posts", "9")));
  // 글 페이지: 블로그 링크
  assert.ok(read("p01", "index.html").includes('<a href="/mapquilt/posts/">블로그 글 모두 보기</a>'));
  // sitemap: 글 전부와 블로그 1쪽(가장 새 글 날짜), 손으로 쓴 주소는 그대로
  const xml = fs.readFileSync(sitemap, "utf8");
  assert.ok(xml.includes("<url><loc>https://tentmakerapps.com/mapquilt/posts/</loc><lastmod>2026-11-12</lastmod></url>"));
  assert.ok(xml.includes("<url><loc>https://tentmakerapps.com/mapquilt/p01/</loc><lastmod>2026-11-01</lastmod></url>"));
  assert.ok(xml.includes("<url><loc>https://tentmakerapps.com/mapquilt/</loc></url>"));

  rebuildApp(r, "mapquilt");
  assert.deepEqual(snapshot(), first);

  // 10편 이하면 쪽 넘김이 없다
  for (const f of ["p11.md", "p12.md"]) fs.rmSync(path.join(postsDir, f));
  rebuildApp(r, "mapquilt");
  assert.ok(!read("posts", "index.html").includes('class="pages"'));
  assert.ok(!fs.existsSync(site("posts", "2")));
});

test("머리말이 없으면 던진다", () => {
  assert.throws(() => splitPost("그냥 글"), /머리말/);
});

test("앱마다 어느 7일을 잡아도 weekly편씩 고른다", () => {
  const r = fs.mkdtempSync(path.join(os.tmpdir(), "pick-test-"));
  const apps = ["d-app", "b-app", "a-app", "c-app"];
  for (const a of apps) {
    fs.mkdirSync(path.join(r, "apps", a), { recursive: true });
    fs.writeFileSync(path.join(r, "apps", a, "facts.yaml"), "facts: []\n");
  }
  fs.mkdirSync(path.join(r, "apps", "no-facts"));
  const days = (start, n) =>
    Array.from({ length: n }, (_, i) => new Date(Date.parse(`${start}T00:00:00Z`) + i * 86400000).toISOString().slice(0, 10));
  const perDay = (weekly, start) => days(start, 7).map((d) => pickApps(r, d, weekly));

  for (const weekly of [1, 2, 3, 7]) {
    for (const start of ["2026-11-13", "2026-11-16"]) {
      const picks = perDay(weekly, start).flat();
      for (const a of apps) assert.equal(picks.filter((p) => p === a).length, weekly, `${weekly}편 ${start} ${a}`);
      assert.ok(!picks.includes("no-facts"));
    }
  }
  // 앱 4개·주 2편: 날마다 1~2편이고 하루에 같은 앱은 두 번 나오지 않는다
  for (const day of perDay(2, "2026-11-13")) {
    assert.ok(day.length >= 1 && day.length <= 2);
    assert.equal(new Set(day).size, day.length);
  }
  // 앱 4개·주 1편: 쓰지 않는 날이 있다
  assert.ok(perDay(1, "2026-11-13").some((day) => day.length === 0));
});

test("페이지는 글자를 이스케이프하고 sitemap에 한 번만 더한다", () => {
  const html = renderPage(splitPost(reply({}, "<b>167곳</b>")), facts, "mapquilt", "2026-11-10", root);
  assert.ok(html.includes("&lt;b&gt;167곳&lt;/b&gt;"));
  assert.ok(html.includes('<link rel="canonical" href="https://tentmakerapps.com/mapquilt/how-many-regions/" />'));
  const xml = '<urlset>\n</urlset>\n';
  const once = addToSitemap(xml, "https://tentmakerapps.com/mapquilt/a/", "2026-11-10");
  assert.equal(addToSitemap(once, "https://tentmakerapps.com/mapquilt/a/", "2026-11-10"), once);
  assert.equal(
    addToSitemap(once, "https://tentmakerapps.com/mapquilt/a/", "2026-11-11"),
    once.replace("2026-11-10", "2026-11-11"),
  );
});
