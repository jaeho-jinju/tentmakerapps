# tentmakerapps

`https://tentmakerapps.com`에 올라가는 사이트다. TheTentmaker 앱들의 소개 페이지와 검색용 글을 한곳에 둔다.

- `site/`: 올라가는 파일 그대로다. 빌드 단계는 없다.
  - `site/index.html`: 앱 목록
  - `site/<앱>/`: 앱 소개 페이지. 글은 `site/<앱>/<글>/`에 둔다.
  - `site/404.html`: 없는 주소는 404로 답한다.
  - `site/robots.txt`·`site/sitemap.xml`: 검색 엔진용
- 배포: Cloudflare Pages 프로젝트 `tentmakerapps`가 이 저장소의 `main`에 연결돼 있다. 커밋하면 자동으로 배포된다. 출력 폴더는 `site`다.

- `docs/<앱>.md`: 앱 소개 페이지마다 정한 것과 그림 만드는 법

정한 것과 이유는 mapquilt 저장소 이슈 #93에 있다.

## 매일 글

`.github/workflows/daily-post.yml`이 매일 09:17(한국)에 글 한 편을 올린다. 앱은 날마다 돌아가며 하나만 고른다.

1. `scripts/post.mjs pick`: 오늘 앱을 고른다. `apps/<앱>/facts.yaml`이 있는 앱만 돈다.
2. `scripts/post.mjs prompt`: `prompts/daily-post.md`에 사실 목록과 이미 쓴 글 제목을 넣어 Claude에게 준다. Claude는 도구 없이 글만 답한다.
3. `scripts/post.mjs publish`: 답을 검사한다. 통과하지 못하면 그날은 올리지 않고 실행이 실패한다(GitHub가 메일로 알린다).
4. 통과하면 `apps/<앱>/posts/<slug>.md`(원문), `site/<앱>/<slug>/index.html`(페이지), `site/sitemap.xml`을 커밋한다.

검사(`scripts/post-lib.mjs` `checkPost`): 본문 300자·문단 3개 이하, 사실 1~2개(facts.yaml의 id), 고른 사실에 없는 숫자 금지, facts.yaml `avoid`의 `words` 금지, 주소·목록 기호 금지, 이미 쓴 제목·주소 금지. `npm test`로 검사를 시험한다.

- 비밀값: Settings › Secrets and variables › Actions에 `CLAUDE_CODE_OAUTH_TOKEN`을 둔다. 맥에서 `claude setup-token`으로 만든 1년짜리 토큰이고, Claude 구독 사용량에서 나간다. 만료 전에 다시 만들어 바꾼다.
- 손으로 한 번 돌리기: Actions › 매일 글 › Run workflow.
- 앱 더하기: `apps/<앱>/facts.yaml`(사실마다 근거)과 `site/<앱>/index.html`(소개 페이지)을 만든다.

## 옛 주소

- `legacy/mapquilt.pages.dev/_redirects`: 예전 소개 페이지 주소(`mapquilt.pages.dev`)의 모든 경로를 `tentmakerapps.com/mapquilt/`로 301 넘긴다. Cloudflare Pages 프로젝트 `mapquilt`(직접 올리기)에 이 폴더만 올린다. 이 파일을 바꿨을 때만 다시 올린다.

  ```sh
  pnpm dlx wrangler@4 pages deploy legacy/mapquilt.pages.dev --project-name mapquilt --branch main
  ```
