# 돈 버는 퀴즈 정답 소개 페이지 (tentmakerapps.com/quiz-answers/)

링크 하나로 앱을 알리는 한 장짜리 페이지다. 파일은 이 저장소의 `site/quiz-answers/`이고 `https://tentmakerapps.com/quiz-answers/`로 연다. 빌드 단계는 없다. 앱 저장소는 jaeho-jinju/cashwalk다.

## 정한 것 (2026-11-15)

1. **주소는 `quiz-answers`다.** 앱 저장소·패키지 이름은 cashwalk지만, 캐시워크는 남의 상표라 사이트 주소에 쓰지 않는다(사용자 결정). 스토어에서도 제목·짧은 설명·그래픽에 남의 상표를 쓰지 않는다(cashwalk `docs/store-listing.md` 원칙).
2. **퀴즈 이름은 본문에만 쓴다(사용자 결정).** 페이지 제목·설명·OG에는 쓰지 않는다. 페이지 안에서는 '다루는 퀴즈' 칸의 알약에 한 번만 늘어놓고, '알아 두세요' 첫 줄에 비공식 문구를 둔다. 스토어 설명에 이름을 한 번 쓰고 비공식 문구를 붙이는 방식과 같다. 매체(언론사) 이름은 쓰지 않는다.
   - 블로그 글도 같다. `apps/quiz-answers/facts.yaml`의 `avoid quiz-names`가 `fields: [slug, title, description]`로 주소·제목·설명에서만 막고, 글 페이지 아래 앱 상자에 `app.notice`(비공식 앱 안내)가 저절로 붙는다.
3. 틀은 빠른단축번호 소개 페이지(`docs/hotkey.md`)를 그대로 쓰고 색만 앱에 맞췄다. 바탕은 앱 바탕의 크림색 `#FFF8EA`, 강조는 아이콘의 빨강이다. 아이콘 빨강 `#E53935`는 흰 바탕 글자로는 대비가 모자라 글자·알약에는 `#C62828`(red-800)을 쓴다. 형광펜 밑줄과 받기 카드 강조 글자는 금색 `#FFD54F`다.
4. 앱의 말을 쓴다(cashwalk `CONTEXT.md`). 정답 기사·정답 목록·정답 보기·원문 보기·내 퀴즈·오늘 판·푼 퀴즈 체크·연속 일수·퀴즈 알림으로 쓰고, 앱을 '뉴스 앱'이라 부르지 않는다. 평가어("가장 빠른", "유용한")는 쓰지 않는다.
5. **보상을 주는 앱처럼 보이지 않게 한다.** 앱 이름에 '돈 버는'이 있지만 앱은 보상을 주지 않는다. '알아 두세요'에 "이 앱은 보상을 주지 않아요. 퀴즈는 그 퀴즈 앱에서 풀고, 보상도 거기서 받아요."를 둔다.
6. 화면 그림은 스토어 iOS 스크린샷 5장(26.41.x, 오늘 판·정답 보기·내 퀴즈·다크 오늘 판·다크 정답 보기)이다. 남의 로고·앱 아이콘은 없고, 퀴즈 이름은 칩·기사 제목의 글자로만 보인다(cashwalk `docs/store-listing.md` §5).
7. 구성: 첫 화면(제목·설명·알약 세 개·스토어 배지·휴대폰 01과 02) → 기능 세 칸(정답 보기 05, 내 퀴즈·퀴즈 알림 03, 다루는 퀴즈 04와 퀴즈 이름 알약) → 그 밖에도 6칸 → 알아 두세요 → 받기 카드(배지와 영상) → 하단(데이터 한 줄·블로그·방침·문의).
8. 알약 세 개는 로그인 없음·기기 안에만 저장·정답은 눌러서 복사다. 첫 화면과 받기 카드, 두 곳에 둔다.
9. 두 스토어 모두 나와 있어 배지 둘 다 링크를 건다.
10. 영상은 표지 그림만 두고, 누를 때 YouTube 플레이어(`2UOKIEN5qpg`, 14초 Shorts, 첫 블로그 글로 만든 것)를 불러온다. 재료(녹화·배경음)를 만드는 법은 cashwalk `docs/promo-video.md`, 영상은 tentmakerapps-marketing이 만든다.

## 올리는 법

`site/quiz-answers/`를 고쳐 `main`에 푸시하면 Cloudflare Pages가 배포한다. 올린 뒤 휴대폰 폭으로 열어 보고, 메신저에 링크를 붙여 미리보기를 본다.

## 이미지 다시 만들기

재료는 `~/Documents/workspace_rn/_assets/cashwalk/store/`(cashwalk `docs/store-listing.md` §2.5·§5.5)다.

| 파일 | 재료 | 만드는 법 |
| --- | --- | --- |
| `img/01~05.webp` | `ios/screenshots/01-today-board.png`·`02-answer-view.png`·`03-my-quizzes.png`·`04-today-board-dark.png`·`05-answer-view-dark.png`(1320×2868) | `cwebp -q 80 -resize 540 0` |
| `img/appstore-ko.svg`·`img/googleplay-ko.webp` | `site/hotkey/img/`의 공식 배지 | 그대로 복사 |
| `img/icon.webp` | cashwalk `assets/icon.png`(1024) | `cwebp -q 85 -resize 256 0` |
| `img/icon-180.png` | cashwalk `assets/icon.png` | `sips -Z 180` |
| `img/poster.webp` | 올린 영상(tentmakerapps-marketing `out/quiz-answers/when-to-check-quiz-answers.mp4`) 5초 장면(앱 화면이 보이는 첫 장면. 질문 화면은 받기 카드와 같은 빨강이라 묻힌다) | `ffmpeg -ss 5 -i … -frames:v 1 -vf scale=300:-1` 뒤 `cwebp -q 75` |
| `img/og.jpg` | `feature-graphic.png`(1024×500, 상표 없음) | `sips -s format jpeg -s formatOptions 85` |
