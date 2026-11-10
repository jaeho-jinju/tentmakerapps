# 어린이집 정보공개 소개 페이지 (tentmakerapps.com/right-to-know/)

링크 하나로 앱을 알리는 한 장짜리 페이지다. YouTube 설명란·채널 링크, SNS, 메신저에 붙인다. 파일은 이 저장소의 `site/right-to-know/`이고 `https://tentmakerapps.com/right-to-know/`로 연다. 빌드 단계는 없다. 앱 저장소는 jaeho-jinju/right-to-know다.

## 정한 것 (2026-11-10)

1. 틀은 조각지도 소개 페이지(`docs/mapquilt.md`, Slopes 컨셉)를 그대로 쓰고 색만 앱 브랜드로 바꿨다. 남색 `#1e3a5f`·틸 `#2a9d8f`는 앱 토큰(right-to-know `apps/mobile/src/core/ui/tokens.js` `brand`)이다. 틸은 흰 바탕 글자로는 대비가 모자라서(3.3:1) 글자·알약에는 짙은 틸 `#1f7a6f`(5.2:1)를 쓴다.
2. 앱의 톤 규칙을 페이지에도 쓴다(right-to-know ADR-0013, CONTEXT.md _Avoid_).
   - 평가어·낙인 찍는 말('블랙리스트'·'문제 어린이집'·'가해자' 등)을 쓰지 않는다. 경고 삼각형·아동 얼굴 같은 자극 그림도 없다.
   - 고정 고지 문장 "교육부·어린이집정보공개포털이 공표한 자료를 출처 표시하여 그대로 보여주는 비공식 앱이며 정부 기관과 무관합니다."를 첫 화면 배지 아래와 하단, 두 곳에 둔다.
   - '알아 두세요' 상자에 스토어 문안의 안내 네 줄(위반당시 값, 공표기간과 제49조의3, 최신 여부, 정정·삭제 요청처)을 옮겼다.
3. 화면 그림은 스토어 iOS 스크린샷이다. 합성 fixture 데이터라 실명이 없다(right-to-know ADR-0010 §5).
4. 구성: 첫 화면(제목·설명·알약 세 개·스토어 배지·고지 문장·휴대폰 01과 03) → 기능 세 칸(지역 고르기 05, 원문 그대로 02, 위반행위자 06) → 그 밖에도 6칸 → 알아 두세요 → 받기 카드(배지와 영상) → 하단(원문 출처·고지 문장·방침·문의).
5. 두 스토어 모두 나와 있어 배지 둘 다 링크를 건다.
6. 영상은 표지 그림만 두고, 누를 때 YouTube 플레이어(`U0idnbqsTkQ`)를 불러온다. 영상 만드는 법은 right-to-know `docs/promo-video.md`다.
7. 시·군 경계선 배경(`img/korea.svg`)은 조각지도 것을 선 색만 남색으로 바꿔 쓴다. 불투명도는 0.14로 조각지도(0.24)보다 옅게 했다.

## 올리는 법

`site/right-to-know/`를 고쳐 `main`에 푸시하면 Cloudflare Pages가 배포한다. 올린 뒤 휴대폰 폭으로 열어 보고, 메신저에 링크를 붙여 미리보기를 본다.

## 이미지 다시 만들기

재료는 `~/Documents/workspace_rn/_assets/right-to-know/store/`(right-to-know `docs/release-checklist.md` §4·§7)다.

| 파일 | 재료 | 만드는 법 |
| --- | --- | --- |
| `img/01·02·03·05·06.webp` | `ios/screenshots/<번호>-*.png`(1320×2868) | `cwebp -q 80 -resize 540 0` |
| `img/poster.webp` | `video/youtube.mp4` 0.5초 장면 | `ffmpeg -ss 0.5 -i … -frames:v 1 -vf scale=300:-1` 뒤 `cwebp -q 75` |
| `img/korea.svg` | `site/mapquilt/img/korea.svg` | 선 색 `#3d7ea6`을 `#1e3a5f`로 바꾼다 |
| `img/appstore-ko.svg`·`img/googleplay-ko.webp` | `site/mapquilt/img/`의 공식 배지 | 그대로 복사 |
| `img/icon.webp` | `store-icon-512.png` | `cwebp -q 85 -resize 256 0` |
| `img/icon-180.png` | `store-icon-512.png` | `sips -Z 180` |
| `img/og.jpg` | `feature-graphic-1024x500.jpg` | 그대로 복사 |

