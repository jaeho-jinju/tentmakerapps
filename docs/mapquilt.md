# 조각지도 소개 페이지 (tentmakerapps.com/mapquilt/)

링크 하나로 앱을 알리는 한 장짜리 페이지다. YouTube 설명란, SNS, 메신저에 붙인다(mapquilt #89). 파일은 이 저장소의 `site/mapquilt/`이고 `https://tentmakerapps.com/mapquilt/`로 연다. 빌드 단계는 없다.

처음에는 mapquilt 저장소의 `site/`에 두고 `mapquilt.pages.dev`로 열었다. 2026-11-09 이 저장소로 옮겼다(mapquilt #93). 옛 주소는 모든 경로를 301로 넘긴다(`README.md`의 옛 주소).

## 정한 것 (2026-11-03·04, 사용자)

1. 올릴 곳은 Cloudflare Pages다. Firebase Hosting(AllApps), Vercel, Google Sites와 비교한 근거는 #89 본문에 있다.
2. 디자인은 [Slopes](https://getslopes.com/) 랜딩 페이지 컨셉이다(2026-11-04 확정). 사용자가 다른 세션에서 고른 후보(Flighty·Slopes·Retro·Polarsteps·Fog of World·Apple Design Awards 2023) 중에서 골랐다.
   - 고른 이유: Polarsteps와 Fog of World는 여행 지도라 앱과 더 가깝지만, 화면을 채운 사진·영상이 바탕이라 무겁다. 첫 화면만 쟀을 때 Fog of World 약 9.2MB, Polarsteps 0.66MB였다. 사용자는 "로딩은 빠를수록 좋고 리소스가 너무 많이 들어가면 안 된다"고 했다.
   - Slopes에서 가져온 것: 옅은 하늘색 빛 첫 화면, 굵은 남색 제목과 파랗게 강조한 핵심 단어, 겹쳐 기울인 휴대폰, 기능마다 작은 머리말·큰 제목·기울인 휴대폰, 파란 알약, "그 밖에도…" 표, 파란 그라데이션 받기 카드.
   - Slopes의 지형 격자 배경 자리에는 시·군 167곳 경계선(`img/korea.svg`)을 옅게 깐다.
   - Slopes의 사용자 후기 칸은 넣지 않는다. 실제 후기가 쌓이면 더한다.
3. 구성: 첫 화면(제목·설명·알약 세 개·스토어 배지·휴대폰 01과 06) → 기능 세 칸(지역 채우기 04, 사진 여러 장 03, 진행률 05) → 그 밖에도 6칸 → 받기 카드(배지와 영상) → 하단. 휴대폰 폭(390px)에서 약 5.4화면이다.
   - 처음 #89에서 올린 판은 스크린샷을 옆으로 넘기는 약 2.8화면짜리였다. Slopes 컨셉으로 바꾸면서 길어졌다.
   - 안심 문구 세 개(로그인 없음·사진은 내 폰에만·파일 하나로 백업)는 사용자 요청으로 첫 화면과 맨 아래 받기 카드, 두 곳에 알약으로 둔다. 둘 다 배지 바로 위라서, 받을지 정하는 자리마다 보이게 했다.
4. 스토어 버튼은 공식 배지다(사용자가 "아이콘까지 넣어 달라"고 했다). Apple·Google 모두 배지를 직접 그리지 말고 공식 배지를 쓰라고 안내한다.
   - 처음에는 Android가 비공개 테스트 중이라 Google Play 배지를 링크 없이 흐리게 두고 "준비 중" 알약을 붙였다.
   - 2026-11-14 Play에 출시돼서 두 배지 모두 스토어 주소로 링크를 건다. 첫 화면과 받기 카드, 두 곳이다.
5. 가볍게 둔다. 웹 글꼴은 쓰지 않고, 첫 화면 아래 그림은 `loading="lazy"`로 늦게 불러온다. 영상은 표지 그림만 두고, 누를 때 YouTube 플레이어(`af4S0G4jB4U`)를 불러온다. 방문자가 받는 그림은 약 0.28MB다.
6. 처음 주소는 `mapquilt.pages.dev`였다. 방침 주소(`sites.google.com/view/mapquilt`)와 저장소 이름에 맞춘 것이다. 2026-11-09 검색 노출을 위해 `tentmakerapps.com/mapquilt/`로 옮겼다(mapquilt #93).
7. 처음에는 `wrangler pages deploy`로 직접 올렸다(Direct Upload). 2026-11-09부터는 Cloudflare Pages 프로젝트 `tentmakerapps`가 이 저장소의 `main`에 연결돼 있어서, 커밋하면 자동으로 배포된다.

## 올리는 법

`site/mapquilt/`를 고쳐 `main`에 푸시하면 Cloudflare Pages가 배포한다. 바로 열리지 않으면 대시보드 Workers & Pages › tentmakerapps › Deployments에서 확인한다.

- 올린 뒤 휴대폰 폭으로 열어 보고, 메신저에 링크를 붙여 미리보기 이미지와 글이 나오는지 본다. 메신저는 미리보기를 캐시하므로 이미지를 바꿨으면 각 서비스의 캐시 지우기 도구를 쓴다.

## 이미지 다시 만들기

스크린샷 재료는 `~/Documents/workspace_rn/_assets/mapquilt/store/`(스토어 그래픽, mapquilt 저장소 `docs/store-listing.md` §6)이다. 그림은 `site/mapquilt/img/`에 둔다. 스크린샷을 바꾸면 아래처럼 다시 만든다(`cwebp`, `ffmpeg`, macOS `sips`).

| 파일 | 재료 | 만드는 법 |
| --- | --- | --- |
| `img/01·03·04·05·06.webp` | `raw/ios/<번호>.png`(글 띠 없는 원본) | `cwebp -q 80 -resize 540 0` |
| `img/poster.webp` | `video/youtube.mp4` 0.5초 장면 | `ffmpeg -ss 0.5 -i … -frames:v 1 -vf scale=300:-1` 뒤 `cwebp -q 75` |
| `img/korea.svg` | mapquilt 저장소 `src/core/regions/map.json`의 `border` | 이음 경로마다 Ramer–Douglas–Peucker(허용 2.5)로 점을 줄이고, 가로세로 6 미만인 작은 섬은 빼고, 좌표를 정수로 반올림한다. 선 `#3d7ea6` 1.4 |
| `img/appstore-ko.svg` | Apple 마케팅 도구 공식 배지 | `https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/ko-kr` 그대로 |
| `img/googleplay-ko.webp` | Google Play 공식 배지 | `https://play.google.com/intl/en_us/badges/static/images/badges/ko_badge_web_generic.png`의 투명 여백을 잘라 높이 112px로 줄이고 `cwebp -q 90 -alpha_q 100` |
| `img/icon.webp` | `icon-512.png` | `cwebp -q 85 -resize 256 0` |
| `img/icon-180.png` | `icon-512.png` | `sips -Z 180` (파비콘·홈 화면 아이콘) |
| `img/og.jpg` | `feature-graphic.png`(1024×500) | `sips -s format jpeg -s formatOptions 85` (공유 미리보기, 메신저마다 WebP를 읽는지 확인하지 않아 JPG로 둔다) |
