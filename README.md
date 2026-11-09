# tentmakerapps

`https://tentmakerapps.com`에 올라가는 사이트다. TheTentmaker 앱들의 소개 페이지와 검색용 글을 한곳에 둔다.

- `site/`: 올라가는 파일 그대로다. 빌드 단계는 없다.
  - `site/index.html`: 앱 목록
  - `site/<앱>/`: 앱 소개 페이지. 글은 `site/<앱>/<글>/`에 둔다.
  - `site/404.html`: 없는 주소는 404로 답한다.
  - `site/robots.txt`·`site/sitemap.xml`: 검색 엔진용
- 배포: Cloudflare Pages 프로젝트 `tentmakerapps`가 이 저장소의 `main`에 연결돼 있다. 커밋하면 자동으로 배포된다. 출력 폴더는 `site`다.

정한 것과 이유는 mapquilt 저장소 이슈 #93에 있다.
