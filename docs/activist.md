# 독립운동가 소개 페이지 (tentmakerapps.com/activist/)

링크 하나로 앱을 알리는 한 장짜리 페이지다. YouTube 설명란·채널 링크, SNS, 메신저에 붙인다. 파일은 이 저장소의 `site/activist/`이고 `https://tentmakerapps.com/activist/`로 연다. 빌드 단계는 없다. 앱 저장소는 jaeho-jinju/activist다.

## 정한 것 (2026-11-10)

1. 틀은 어린이집 정보공개 소개 페이지(`docs/right-to-know.md`, 조각지도의 Slopes 컨셉을 이은 것)를 그대로 쓰고 색만 앱 토큰으로 바꿨다. 먹색 `#1c1917`(stone-900)과 강조 `#b91c1c`(red-700)는 activist `src/core/ui/tokens.js`의 `text.primary`·`accent`다. 보조 글은 `#57534e`(stone-600)다.
2. 시·군 경계선 배경(`korea.svg`)은 쓰지 않는다. 독립운동은 만주·연해주·미주 등 나라 밖에서도 있었고, 오늘의 시·군 경계는 앱 내용과 관계가 없다. 대신 둘째 기능 칸에 옅은 바탕(`#fafaf9`)을 깔아 칸을 나눈다.
3. 앱의 톤을 페이지에도 쓴다(activist `docs/store-listing.md` §2 규칙, `CONTEXT.md` _Avoid_).
   - '국가보훈부'·'공훈전자사료관'은 출처를 말할 때만 쓴다. 출처 문장 "국가보훈부 공훈전자사료관이 공공누리 제1유형으로 개방한 자료를 이용합니다. 국가보훈부와 관계없는 개인 제작 앱입니다."를 첫 화면 배지 아래와 하단, 두 곳에 둔다.
   - 사람은 '독립운동가', 날짜는 '생년월일·사망년월일'로 쓴다('생몰'·'애국지사'·'업적' 등을 쓰지 않는다).
   - '알아 두세요' 상자에 스토어 문안의 '원문 그대로 보여줍니다' 네 줄을 옮겼다.
4. 화면 그림은 스토어 iOS 스크린샷 5장(홈·초성 검색·거르기·유관순 상세·이달의 독립운동가)이다. 공훈록은 공개 자료라 실제 화면 그대로 쓴다.
5. 구성: 첫 화면(제목·설명·알약 세 개·스토어 배지·출처 문장·휴대폰 01과 04) → 기능 세 칸(초성 검색 02, 거르기 03과 훈격 7가지 알약, 이달의 독립운동가 05) → 그 밖에도 6칸 → 알아 두세요 → 받기 카드(배지와 영상) → 하단(원문 출처·출처 문장·방침·문의). 휴대폰 폭(390px)에서 약 5,500px다.
6. 두 스토어 모두 나와 있어 배지 둘 다 링크를 건다.
7. 영상은 표지 그림만 두고, 누를 때 YouTube 플레이어를 불러온다. 영상 만드는 법은 activist `docs/promo-video.md`다.

## 올리는 법

`site/activist/`를 고쳐 `main`에 푸시하면 Cloudflare Pages가 배포한다. 올린 뒤 휴대폰 폭으로 열어 보고, 메신저에 링크를 붙여 미리보기를 본다.

## 이미지 다시 만들기

재료는 `~/Documents/workspace_rn/_assets/activist/store/`(activist `docs/store-listing.md` §2.4)다.

| 파일 | 재료 | 만드는 법 |
| --- | --- | --- |
| `img/01~05.webp` | `ios/<번호>-*.png`(1320×2868, 글 띠 없는 원본) | `cwebp -q 80 -resize 540 0` |
| `img/poster.webp` | `video/youtube.mp4` 0.5초 장면 | `ffmpeg -ss 0.5 -i … -frames:v 1 -vf scale=300:-1` 뒤 `cwebp -q 75` |
| `img/appstore-ko.svg`·`img/googleplay-ko.webp` | `site/mapquilt/img/`의 공식 배지 | 그대로 복사 |
| `img/icon.webp` | activist `assets/icon.png`(1024) | `cwebp -q 85 -resize 256 0` |
| `img/icon-180.png` | activist `assets/icon.png` | `sips -Z 180` |
| `img/og.jpg` | Play 등록정보의 피처 그래픽(1024×500, 2026-11-10 Play 페이지에서 받음) | `sips -s format jpeg -s formatOptions 85` |
