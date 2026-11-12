// 매일 글 명령. .github/workflows/daily-post.yml이 차례대로 부른다.
//   node scripts/post.mjs pick                    오늘 쓸 앱 이름
//   node scripts/post.mjs prompt <앱>             Claude에게 줄 지시문
//   node scripts/post.mjs publish <앱> <답 파일>   검사하고, 통과하면 글을 만들고 rebuild한다(통과 못 하면 아무것도 쓰지 않고 실패)
//   node scripts/post.mjs rebuild [앱]            글 페이지·블로그·sitemap을 원문에서 다시 만든다(앱을 빼면 모든 앱)
// 날짜는 한국 날짜다. 시험할 때는 POST_DATE=YYYY-MM-DD로 바꾼다.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildPrompt,
  checkPost,
  kstDate,
  listApps,
  loadFacts,
  loadPosts,
  pickApp,
  rebuildApp,
  splitPost,
} from "./post-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const date = process.env.POST_DATE ?? kstDate();
const [command, app, replyFile] = process.argv.slice(2);

if (command === "pick") {
  console.log(pickApp(root, date));
} else if (command === "prompt" && app) {
  process.stdout.write(buildPrompt(root, app, loadFacts(root, app), loadPosts(root, app)));
} else if (command === "publish" && app && replyFile) {
  const reply = fs.readFileSync(replyFile, "utf8");
  let post;
  let errors;
  try {
    post = splitPost(reply);
    errors = checkPost(post, loadFacts(root, app), loadPosts(root, app), root, app);
  } catch (e) {
    errors = [e.message];
  }
  if (errors.length) {
    console.error(`검사를 통과하지 못해 오늘은 올리지 않는다.\n- ${errors.join("\n- ")}\n\nClaude 답:\n${reply}`);
    process.exit(1);
  }
  const { slug, title, description, facts } = post.meta;
  const source = `---\n${["slug", "title", "description"].map((k) => `${k}: ${JSON.stringify(post.meta[k])}`).join("\n")}\nfacts: [${facts.join(", ")}]\ndate: "${date}"\n---\n\n${post.body}\n`;
  fs.mkdirSync(path.join(root, "apps", app, "posts"), { recursive: true });
  fs.writeFileSync(path.join(root, "apps", app, "posts", `${slug}.md`), source);
  rebuildApp(root, app);
  console.log(`${app}/${slug} ${title} (${description.length}자 설명)`);
} else if (command === "rebuild") {
  for (const a of app ? [app] : listApps(root)) rebuildApp(root, a);
} else {
  console.error("쓰는 법: node scripts/post.mjs pick | prompt <앱> | publish <앱> <답 파일> | rebuild [앱]");
  process.exit(2);
}
