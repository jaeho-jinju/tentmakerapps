# 빠른단축번호 소개 페이지 (tentmakerapps.com/hotkey/)

링크 하나로 앱을 알리는 한 장짜리 페이지다. YouTube 설명란·채널 링크, SNS, 메신저에 붙인다. 파일은 이 저장소의 `site/hotkey/`이고 `https://tentmakerapps.com/hotkey/`로 연다. 빌드 단계는 없다. 앱 저장소는 jaeho-jinju/hotkey다.

## 정한 것 (2026-11-10)

1. 틀은 독립운동가 소개 페이지(`docs/activist.md`, 조각지도의 Slopes 컨셉을 이은 것)를 그대로 쓰고 색만 앱 브랜드로 바꿨다. 인디고 `#3F51B5`와 노랑 `#FFEB3B`는 앱 아이콘·스플래시·칸 팔레트 1번(hotkey `app.json`, `src/features/home/cellLook.ts`)과 피처 그래픽의 색이다.
   - 글자는 짙은 인디고 `#1a237e`(indigo-900), 강조 글자·머리말·알약은 인디고 `#3f51b5`(흰 바탕 대비 6.9:1)다.
   - 노랑은 흰 바탕에서 글자로 읽히지 않아 글자색으로 쓰지 않는다. 첫 화면 제목의 '엄마'에 형광펜 밑줄로, 인디고 받기 카드 안에서 강조 글자와 ✓로만 쓴다.
2. 시·군 경계선 배경(`korea.svg`)은 쓰지 않는다. 앱 내용과 관계가 없다. 둘째 기능 칸에 옅은 바탕(`#f7f8fc`)을 깔아 칸을 나눈다.
3. 앱의 말을 페이지에도 쓴다(hotkey `CONTEXT.md` _Avoid_, `docs/store-listing.md` §2·§8). 칸·탭·누르기·길게 누르기·백업 파일·긴급 전화번호 모음·분야로 쓰고, 다른 앱과 견주거나 치켜세우는 말은 쓰지 않는다.
4. **플랫폼 차이를 밝힌다.** 바로 걸기·전화 권한·통화 뒤 앱 닫기는 안드로이드에만 있다. 그래서 첫 화면 제목은 '바로'를 빼고 "엄마 칸을 누르면, 엄마에게 전화해요"로 했고, '통화 뒤 앱 닫기' 칸에 "안드로이드에만 있어요"를 붙였다. '알아 두세요'에 안드로이드(바로 걸기·권한이 없으면 전화 앱)와 아이폰(한 번 더 물음)을 한 줄씩 둔다.
5. 긴급 전화번호는 '알아 두세요'에 "공개된 번호를 모은 목록이에요. 앱이 신고를 받거나 대신하지 않고, 번호와 기관은 바뀔 수 있어요."를 둔다. 앱은 항목을 누르면 전화 앱을 열 뿐이다(CONTEXT.md 긴급 전화번호 모음).
6. 화면 그림은 스토어 iOS 스크린샷 5장(홈·긴급 전화번호·음성 안내·백업 파일 보내기·글자 200%)의 글 띠 없는 원본이다. 번호는 모두 `010-0000-00NN` 가짜다(hotkey `docs/store-listing.md` §7).
7. 구성: 첫 화면(제목·설명·알약 세 개·스토어 배지·휴대폰 01과 05) → 기능 세 칸(긴급 전화번호 02와 분야 9개 알약, 음성 안내 03, 백업 파일 04) → 그 밖에도 6칸(큰 글자·길게 누르면 전화·통화 뒤 앱 닫기·탭과 칸 옮기기·주소록에서 가져오기·번호는 입력한 그대로) → 알아 두세요 → 받기 카드(배지와 영상) → 하단(데이터 한 줄·방침·문의). 휴대폰 폭(390px)에서 약 5,100px다.
8. 알약 세 개는 로그인 없음·기기 안에만 저장·백업 파일로 폰 이전이다. 첫 화면과 받기 카드, 두 곳에 둔다.
9. 두 스토어 모두 나와 있어 배지 둘 다 링크를 건다.
10. 영상은 표지 그림만 두고, 누를 때 YouTube 플레이어(`RH37K8mhUTg`, 28초 Shorts)를 불러온다. 영상 만드는 법은 hotkey `docs/promo-video.md`다.

## 올리는 법

`site/hotkey/`를 고쳐 `main`에 푸시하면 Cloudflare Pages가 배포한다. 올린 뒤 휴대폰 폭으로 열어 보고, 메신저에 링크를 붙여 미리보기를 본다.

## 이미지 다시 만들기

재료는 `~/Documents/workspace_rn/_assets/hotkey/store/`(hotkey `docs/store-listing.md` §2.5·§8.3)다.

| 파일 | 재료 | 만드는 법 |
| --- | --- | --- |
| `img/01~05.webp` | `src/raw/ios/<번호>-*.png`(1320×2868, 글 띠 없는 원본) | `cwebp -q 80 -resize 540 0` |
| `img/poster.webp` | `video/youtube.mp4` 0.5초 장면 | `ffmpeg -ss 0.5 -i … -frames:v 1 -vf scale=300:-1` 뒤 `cwebp -q 75` |
| `img/appstore-ko.svg`·`img/googleplay-ko.webp` | `site/mapquilt/img/`의 공식 배지 | 그대로 복사 |
| `img/icon.webp` | hotkey `assets/icon.png`(1024, 스토어 `icon-512.png`와 같은 그림) | `cwebp -q 85 -resize 256 0` |
| `img/icon-180.png` | hotkey `assets/icon.png` | `sips -Z 180` |
| `img/og.jpg` | `feature-graphic.png`(1024×500) | `sips -s format jpeg -s formatOptions 85` |
