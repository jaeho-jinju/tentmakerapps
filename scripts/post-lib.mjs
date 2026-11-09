// 매일 글: 앱 고르기, 지시문 만들기, Claude 답 검사, 글 페이지 만들기.
// 명령은 scripts/post.mjs, 시험은 scripts/post.test.mjs다.
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

export const SITE = "https://tentmakerapps.com";
export const LIMITS = { body: 300, title: 40, description: 80, paragraphs: 3, facts: 2 };

/** 한국 날짜(YYYY-MM-DD). */
export function kstDate(now = new Date()) {
  return new Date(now.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

/** facts.yaml이 있는 앱을 이름순으로 두고, 날마다 하나씩 돌아가며 고른다. */
export function pickApp(root, date) {
  const apps = fs
    .readdirSync(path.join(root, "apps"))
    .filter((name) => fs.existsSync(path.join(root, "apps", name, "facts.yaml")))
    .sort();
  if (apps.length === 0) throw new Error("apps/<앱>/facts.yaml이 없다");
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000);
  return apps[day % apps.length];
}

export function loadFacts(root, app) {
  const file = path.join(root, "apps", app, "facts.yaml");
  return YAML.parse(fs.readFileSync(file, "utf8"));
}

/** 이미 쓴 글(apps/<앱>/posts/*.md)의 머리말. */
export function loadPosts(root, app) {
  const dir = path.join(root, "apps", app, "posts");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => ({ slug: f.slice(0, -3), ...splitPost(fs.readFileSync(path.join(dir, f), "utf8")).meta }));
}

/** "---\n머리말\n---\n본문" 나누기. 앞뒤에 ``` 울타리가 있으면 걷어 낸다. */
export function splitPost(text) {
  const clean = text
    .trim()
    .replace(/^```[a-z]*\n/, "")
    .replace(/\n```$/, "")
    .trim();
  const m = clean.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error("머리말(--- … ---)로 시작하지 않는다");
  return { meta: YAML.parse(m[1]) ?? {}, body: m[2].trim() };
}

export function paragraphs(body) {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

const numbers = (text) => (text.match(/\d+/g) ?? []).map(Number);

/** Claude 답을 검사한다. 어긴 것을 모두 돌려준다(빈 배열이면 통과). */
export function checkPost({ meta, body }, facts, posts, root, app) {
  const errors = [];
  const { slug, title, description } = meta;
  const ids = Array.isArray(meta.facts) ? meta.facts : [];

  if (typeof slug !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 60) {
    errors.push(`slug는 영어 소문자·숫자·하이픈 60자 이하여야 한다: ${slug}`);
  } else if (posts.some((p) => p.slug === slug) || fs.existsSync(path.join(root, "site", app, slug))) {
    errors.push(`이미 있는 주소다: ${slug}`);
  }
  if (typeof title !== "string" || !title.trim() || title.length > LIMITS.title) {
    errors.push(`제목은 ${LIMITS.title}자 이하여야 한다`);
  } else if (posts.some((p) => p.title === title)) {
    errors.push(`이미 쓴 제목이다: ${title}`);
  }
  if (typeof description !== "string" || !description.trim() || description.length > LIMITS.description) {
    errors.push(`설명은 ${LIMITS.description}자 이하여야 한다`);
  }

  const known = new Map(facts.facts.map((f) => [f.id, f.fact]));
  if (ids.length < 1 || ids.length > LIMITS.facts) errors.push(`사실은 1~${LIMITS.facts}개만 쓴다`);
  const unknown = ids.filter((id) => !known.has(id));
  if (unknown.length) errors.push(`사실 목록에 없는 id: ${unknown.join(", ")}`);

  const paras = paragraphs(body);
  const length = paras.join("").length;
  if (paras.length === 0) errors.push("본문이 비었다");
  if (paras.length > LIMITS.paragraphs) errors.push(`문단은 ${LIMITS.paragraphs}개까지다: ${paras.length}개`);
  if (length > LIMITS.body) errors.push(`본문은 ${LIMITS.body}자 이하여야 한다: ${length}자`);
  if (/https?:|www\./i.test(body)) errors.push("본문에 주소를 쓰지 않는다");
  if (/^\s*([#>*-]|\d+\.)\s/m.test(body)) errors.push("본문은 꾸밈 없는 문단만 쓴다(제목·목록 기호 금지)");

  const text = [title, description, body].filter((t) => typeof t === "string").join("\n");
  const allowed = new Set(ids.filter((id) => known.has(id)).flatMap((id) => numbers(known.get(id))));
  const stray = [...new Set(numbers(text))].filter((n) => !allowed.has(n));
  if (stray.length) errors.push(`쓴 사실에 없는 숫자: ${stray.join(", ")}`);

  for (const rule of facts.avoid ?? []) {
    for (const word of rule.words ?? []) {
      if (text.includes(word)) errors.push(`쓰지 않는 말(${rule.id}): ${word}`);
    }
  }
  return errors;
}

/** Claude에게 줄 지시문. */
export function buildPrompt(root, app, facts, posts) {
  const template = fs.readFileSync(path.join(root, "prompts", "daily-post.md"), "utf8");
  const done = posts.length
    ? posts.map((p) => `- ${p.title} (${(p.facts ?? []).join(", ")})`).join("\n")
    : "(아직 없음)";
  return template
    .replaceAll("{{APP_NAME}}", facts.app.name)
    .replaceAll("{{BODY_MAX}}", String(LIMITS.body))
    .replaceAll("{{TITLE_MAX}}", String(LIMITS.title))
    .replaceAll("{{DESCRIPTION_MAX}}", String(LIMITS.description))
    .replaceAll("{{PARAGRAPHS_MAX}}", String(LIMITS.paragraphs))
    .replaceAll("{{FACTS_YAML}}", fs.readFileSync(path.join(root, "apps", app, "facts.yaml"), "utf8").trim())
    .replaceAll("{{DONE}}", done);
}

const escape = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** 글 페이지 HTML. 앱 소개는 맨 아래 상자 하나뿐이다. */
export function renderPage({ meta, body }, facts, app, date, root) {
  const a = facts.app;
  const url = `${SITE}/${app}/${meta.slug}/`;
  const og = fs.existsSync(path.join(root, "site", app, "img", "og.jpg"))
    ? `\n    <meta property="og:image" content="${SITE}/${app}/img/og.jpg" />`
    : "";
  const icon = fs.existsSync(path.join(root, "site", app, "img", "icon-180.png"))
    ? `\n    <link rel="icon" href="/${app}/img/icon-180.png" />`
    : "";
  const stores = [
    a.app_store && `<a href="${escape(a.app_store)}">App Store</a>`,
    a.google_play && `<a href="${escape(a.google_play)}">Google Play</a>`,
  ].filter(Boolean);
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escape(meta.title)} - ${escape(a.name)}</title>
    <meta name="description" content="${escape(meta.description)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escape(meta.title)}" />
    <meta property="og:description" content="${escape(meta.description)}" />
    <meta property="og:url" content="${url}" />${og}${icon}
    <style>
      body {
        margin: 0;
        font-family:
          -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
        color: #12304a;
        background: #fff;
        line-height: 1.7;
        word-break: keep-all;
      }
      main {
        max-width: 640px;
        margin: 0 auto;
        padding: 32px 16px 48px;
      }
      .meta {
        font-size: 14px;
        color: #55667a;
      }
      a {
        color: #2f74a8;
      }
      h1 {
        font-size: 26px;
        line-height: 1.35;
        margin: 8px 0 20px;
      }
      aside {
        margin-top: 32px;
        padding: 16px;
        border-radius: 12px;
        background: #e3eff7;
        font-size: 15px;
      }
    </style>
  </head>
  <body>
    <main>
      <p class="meta"><a href="/${app}/">${escape(a.name)}</a> · <time datetime="${date}">${date}</time></p>
      <h1>${escape(meta.title)}</h1>
${paragraphs(body)
  .map((p) => `      <p>${escape(p)}</p>`)
  .join("\n")}
      <aside>
        <b><a href="/${app}/">${escape(a.name)}</a></b> · ${escape(a.tagline)}${stores.length ? `<br />${stores.join(" · ")}` : ""}
      </aside>
    </main>
  </body>
</html>
`;
}

/** sitemap.xml 끝에 글 주소를 더한다. */
export function addToSitemap(xml, url, date) {
  if (xml.includes(`<loc>${url}</loc>`)) return xml;
  return xml.replace("</urlset>", `  <url><loc>${url}</loc><lastmod>${date}</lastmod></url>\n</urlset>`);
}
