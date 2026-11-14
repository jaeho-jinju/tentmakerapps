// 매일 글: 앱 고르기, 지시문 만들기, Claude 답 검사, 글 페이지 만들기.
// 명령은 scripts/post.mjs, 시험은 scripts/post.test.mjs다.
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

export const SITE = "https://tentmakerapps.com";
export const LIMITS = { body: 300, title: 40, description: 80, paragraphs: 3, facts: 2 };

/** 앱마다 한 주에 올리는 글 수. 이 숫자만 고치면 앱이 몇 개든 하루에 올릴 글 수가 맞춰진다. */
export const WEEKLY = 3;

/** 한국 날짜(YYYY-MM-DD). */
export function kstDate(now = new Date()) {
  return new Date(now.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

/** facts.yaml이 있는 앱, 이름순. */
export function listApps(root) {
  return fs
    .readdirSync(path.join(root, "apps"))
    .filter((name) => fs.existsSync(path.join(root, "apps", name, "facts.yaml")))
    .sort();
}

/**
 * 오늘 글을 쓸 앱들. 한 주 몫(앱 수 × weekly편)을 7일에 고르게 나누고, facts.yaml이 있는 앱을 이름순으로
 * 돌아가며 채운다. 날마다 같은 차례가 7일 주기로 되풀이되므로 어느 7일을 잡아도 앱마다 weekly편이다.
 * 날에 따라 0편일 수도, 여러 편일 수도 있다.
 */
export function pickApps(root, date, weekly = WEEKLY) {
  const apps = listApps(root);
  if (apps.length === 0) throw new Error("apps/<앱>/facts.yaml이 없다");
  const total = apps.length * weekly;
  const d = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000) % 7;
  const from = Math.floor((d * total) / 7);
  const to = Math.floor(((d + 1) * total) / 7);
  return Array.from({ length: to - from }, (_, i) => apps[(from + i) % apps.length]);
}

export function loadFacts(root, app) {
  const file = path.join(root, "apps", app, "facts.yaml");
  return YAML.parse(fs.readFileSync(file, "utf8"));
}

/** 이미 쓴 글(apps/<앱>/posts/*.md)의 머리말과 본문(body). */
export function loadPosts(root, app) {
  const dir = path.join(root, "apps", app, "posts");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => {
      const { meta, body } = splitPost(fs.readFileSync(path.join(dir, f), "utf8"));
      return { slug: f.slice(0, -3), ...meta, body };
    });
}

/** 새 글부터. 날짜가 같으면 slug 순(loadPosts 순서)이다. */
export const newestFirst = (posts) => [...posts].sort((a, b) => b.date.localeCompare(a.date));

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
  } else if (
    slug === "posts" || // 블로그 주소(/<앱>/posts/)
    posts.some((p) => p.slug === slug) ||
    fs.existsSync(path.join(root, "site", app, slug))
  ) {
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

/** 글 페이지와 블로그가 함께 쓰는 틀. 앱 소개는 main 맨 아래 상자 하나뿐이고, after는 그 상자 뒤에 붙는다. */
function shell({ title, ogTitle, description, url, type }, facts, app, root, main, after = "") {
  const a = facts.app;
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
    <title>${escape(title)}</title>
    <meta name="description" content="${escape(description)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:title" content="${escape(ogTitle)}" />
    <meta property="og:description" content="${escape(description)}" />
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
      article {
        padding-top: 20px;
        border-top: 1px solid #d5e3ee;
      }
      h2 {
        font-size: 20px;
        line-height: 1.4;
        margin: 0;
      }
      h2 + .meta {
        margin: 4px 0 12px;
      }
      .pages {
        display: flex;
        justify-content: space-between;
        margin-top: 24px;
      }
    </style>
  </head>
  <body>
    <main>
${main}
      <aside>
        <b><a href="/${app}/">${escape(a.name)}</a></b> · ${escape(a.tagline)}${stores.length ? `<br />${stores.join(" · ")}` : ""}
      </aside>
${after}    </main>
  </body>
</html>
`;
}

const time = (date) => `<time datetime="${date}">${date}</time>`;
const link = (app, p) => `<a href="/${app}/${p.slug}/">${escape(p.title)}</a>`;

const blogPath = (app, n) => (n === 1 ? `/${app}/posts/` : `/${app}/posts/${n}/`);

/** 글 페이지 HTML. 맨 아래에 블로그 링크를 단다. */
export function renderPage({ meta, body }, facts, app, date, root) {
  const a = facts.app;
  const main = `      <p class="meta"><a href="/${app}/">${escape(a.name)}</a> · ${time(date)}</p>
      <h1>${escape(meta.title)}</h1>
${paragraphs(body)
  .map((p) => `      <p>${escape(p)}</p>`)
  .join("\n")}`;
  const page = {
    title: `${meta.title} - ${a.name}`,
    ogTitle: meta.title,
    description: meta.description,
    url: `${SITE}/${app}/${meta.slug}/`,
    type: "article",
  };
  return shell(page, facts, app, root, main, `      <p><a href="${blogPath(app, 1)}">블로그 글 모두 보기</a></p>\n`);
}

export const PER_PAGE = 10;

/** 블로그 n쪽(/<앱>/posts/, /<앱>/posts/2/ …) HTML. posts는 그 쪽에 실을 글(새 글부터), pages는 전체 쪽 수. */
export function renderBlog(posts, facts, app, root, n, pages) {
  const a = facts.app;
  const title = `${a.name} 블로그${n > 1 ? ` ${n}쪽` : ""}`;
  const articles = posts.map(
    (p) => `      <article>
        <h2>${link(app, p)}</h2>
        <p class="meta">${time(p.date)}</p>
${paragraphs(p.body)
  .map((t) => `        <p>${escape(t)}</p>`)
  .join("\n")}
      </article>`,
  );
  const nav =
    pages > 1
      ? `
      <nav class="pages">
        ${n > 1 ? `<a href="${blogPath(app, n - 1)}">← 새 글</a>` : "<span></span>"}
        <span>${n} / ${pages}</span>
        ${n < pages ? `<a href="${blogPath(app, n + 1)}">지난 글 →</a>` : "<span></span>"}
      </nav>`
      : "";
  const main = `      <p class="meta"><a href="/${app}/">${escape(a.name)}</a></p>
      <h1>${escape(title)}</h1>
${articles.join("\n")}${nav}`;
  const page = {
    title,
    ogTitle: title,
    description: `${a.name} 블로그에 올린 글을 모두 모았어요.`,
    url: `${SITE}${blogPath(app, n)}`,
    type: "website",
  };
  return shell(page, facts, app, root, main);
}

/** sitemap.xml에 주소를 더한다. 이미 있으면 lastmod만 고친다. */
export function addToSitemap(xml, url, date) {
  const entry = `<url><loc>${url}</loc><lastmod>${date}</lastmod></url>`;
  const start = xml.indexOf(`<url><loc>${url}</loc>`);
  if (start === -1) return xml.replace("</urlset>", `  ${entry}\n</urlset>`);
  const end = xml.indexOf("</url>", start) + "</url>".length;
  return xml.slice(0, start) + entry + xml.slice(end);
}

const write = (file, text) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
};

/**
 * apps/<앱>/posts/*.md에서 글 페이지 전부, 블로그(/<앱>/posts/와 2쪽부터), sitemap.xml을 다시 만든다.
 * 여러 번 돌려도 결과가 같다. 소개 페이지의 블로그 링크는 주소가 바뀌지 않아 손대지 않는다.
 */
export function rebuildApp(root, app) {
  const posts = newestFirst(loadPosts(root, app));
  if (posts.length === 0) return;
  const facts = loadFacts(root, app);
  const dir = path.join(root, "site", app);
  const sitemap = path.join(root, "site", "sitemap.xml");
  let xml = fs.readFileSync(sitemap, "utf8");
  for (const p of posts) {
    write(path.join(dir, p.slug, "index.html"), renderPage({ meta: p, body: p.body }, facts, app, p.date, root));
    xml = addToSitemap(xml, `${SITE}/${app}/${p.slug}/`, p.date);
  }
  // 글을 지워 쪽 수가 줄어도 옛 쪽이 남지 않게 블로그 폴더는 통째로 다시 만든다
  fs.rmSync(path.join(dir, "posts"), { recursive: true, force: true });
  const pages = Math.ceil(posts.length / PER_PAGE);
  for (let n = 1; n <= pages; n++) {
    const html = renderBlog(posts.slice((n - 1) * PER_PAGE, n * PER_PAGE), facts, app, root, n, pages);
    write(path.join(dir, "posts", n === 1 ? "" : String(n), "index.html"), html);
  }
  xml = addToSitemap(xml, `${SITE}/${app}/posts/`, posts[0].date);
  fs.writeFileSync(sitemap, xml);
}
