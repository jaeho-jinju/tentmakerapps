# tentmakerapps

`https://tentmakerapps.com`에 올라가는 사이트다. TheTentmaker 앱들의 소개 페이지와 검색용 글을 한곳에 둔다.

- `site/`: 올라가는 파일 그대로다. 빌드 단계는 없다.
  - `site/index.html`: 앱 목록
  - `site/<앱>/`: 앱 소개 페이지. 글은 `site/<앱>/<글>/`, 블로그는 `site/<앱>/posts/`에 둔다.
  - `site/404.html`: 없는 주소는 404로 답한다.
  - `site/robots.txt`·`site/sitemap.xml`: 검색 엔진용
- 배포: Cloudflare Pages 프로젝트 `tentmakerapps`가 이 저장소의 `main`에 연결돼 있다. 커밋하면 자동으로 배포된다. 출력 폴더는 `site`다.

- `docs/<앱>.md`: 앱 소개 페이지마다 정한 것과 그림 만드는 법

정한 것과 이유는 mapquilt 저장소 이슈 #93에 있다.

## 매일 글

`.github/workflows/daily-post.yml`이 매일 09:17(한국)에 돈다. 앱마다 한 주에 `WEEKLY`편(`scripts/post-lib.mjs`, 지금 3)을 올린다.

- 한 주 몫(앱 수 × `WEEKLY`편)을 7일에 고르게 나누고, 앱은 이름순으로 돌아가며 채운다. 그래서 날에 따라 0편·1편·여러 편이다. 앱이 늘면 하루 편수가 저절로 늘고, 앱마다 한 주 편수는 그대로다.
- `WEEKLY`를 바꾸려면 그 숫자만 고쳐 `main`에 푸시한다. 다음 날 실행부터 적용된다. 날짜별로 어느 앱을 쓰는지는 `POST_DATE=2026-11-20 node scripts/post.mjs pick`으로 본다.

1. `scripts/post.mjs pick`: 오늘 쓸 앱을 고른다(한 줄에 하나). `apps/<앱>/facts.yaml`이 있는 앱만 돈다.
2. 고른 앱마다 차례로 아래를 한다.
   - `scripts/post.mjs prompt`: `prompts/daily-post.md`에 사실 목록과 이미 쓴 글 제목을 넣어 Claude에게 준다. Claude는 도구 없이 글만 답한다.
   - `scripts/post.mjs publish`: 답을 검사한다. 통과하면 `apps/<앱>/posts/<slug>.md`(원문)를 쓰고 그 앱을 rebuild한다. 통과하지 못하면 그 앱은 그날 올리지 않는다.
3. 올린 글이 있으면 `apps`·`site`를 한 번에 커밋한다. 올리지 못한 앱이 있으면 다른 앱 글은 커밋한 뒤 실행을 실패로 끝낸다(GitHub가 메일로 알린다). 빠진 글은 다시 쓰지 않고 다음 차례를 기다린다.

rebuild(`node scripts/post.mjs rebuild [앱]`, 앱을 빼면 모든 앱)는 `apps/<앱>/posts/*.md`에서 아래를 다시 만든다. 여러 번 돌려도 결과가 같다. 글 페이지의 틀을 바꿨을 때도 이것으로 이미 있는 글을 모두 다시 만든다.

- 글 페이지 `site/<앱>/<slug>/` 전부. 맨 아래에 '블로그 글 모두 보기' 링크를 단다.
- 블로그 `site/<앱>/posts/`: 그 앱의 글을 본문까지 새 글부터(날짜가 같으면 slug 순) 한 쪽에 10편씩 싣는다. 2쪽부터는 `posts/2/`, `posts/3/` …이고 쪽마다 '← 새 글'·'지난 글 →'로 넘긴다. 이 폴더는 통째로 다시 만든다.
- `site/sitemap.xml`: 글과 블로그 1쪽 주소를 더한다. 블로그의 lastmod는 가장 새 글 날짜다.

소개 페이지는 하단의 '블로그' 링크(`/<앱>/posts/`) 하나로 블로그와 이어진다. 주소가 바뀌지 않으므로 rebuild는 소개 페이지를 건드리지 않는다. 링크는 모두 화면에 보이는 보통 링크다. 숨긴 링크(안 보이게 한 글자·링크)는 Google 스팸 정책에 걸리므로 쓰지 않는다.

검사(`scripts/post-lib.mjs` `checkPost`): 본문 300자·문단 3개 이하, 사실 1~2개(facts.yaml의 id), 고른 사실에 없는 숫자 금지, facts.yaml `avoid`의 `words` 금지, 주소·목록 기호 금지, 이미 쓴 제목·주소와 `posts`(블로그 주소) 금지. `npm test`로 검사와 rebuild를 시험한다.

- 비밀값: Settings › Secrets and variables › Actions에 `CLAUDE_CODE_OAUTH_TOKEN`을 둔다. 맥에서 `claude setup-token`으로 만든 1년짜리 토큰이고, Claude 구독 사용량에서 나간다. 만료 전에 다시 만들어 바꾼다.
- 무료 원칙: [claude.ai/settings/usage](https://claude.ai/settings/usage)의 Usage credits(한국어 화면은 "사용 크레딧" 토글)는 꺼 둔다. 꺼져 있으면 구독 한도를 넘는 날은 Claude 호출이 실패해 그날 글만 빠진다. 켜져 있으면 넘는 만큼 돈이 나간다.
- 손으로 한 번 돌리기: Actions › 매일 글 › Run workflow.
- 앱 더하기: `apps/<앱>/facts.yaml`(사실마다 근거)과 `site/<앱>/index.html`(소개 페이지)을 만든다. 소개 페이지 하단에는 다른 앱처럼 '블로그' 링크(`/<앱>/posts/`)를 둔다.

## 옛 주소

- `legacy/mapquilt.pages.dev/_redirects`: 예전 소개 페이지 주소(`mapquilt.pages.dev`)의 모든 경로를 `tentmakerapps.com/mapquilt/`로 301 넘긴다. Cloudflare Pages 프로젝트 `mapquilt`(직접 올리기)에 이 폴더만 올린다. 이 파일을 바꿨을 때만 다시 올린다.

  ```sh
  pnpm dlx wrangler@4 pages deploy legacy/mapquilt.pages.dev --project-name mapquilt --branch main
  ```
