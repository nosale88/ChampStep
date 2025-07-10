# ChampStep 파비콘 생성 가이드

## 1. 준비된 이미지
- ChampStep 로고 이미지 (검은 배경에 흰색 "CHAMP", 초록색 "STEP" 텍스트)

## 2. 파비콘 생성 방법

### 온라인 파비콘 생성기 사용 (추천)
1. **Favicon.io** (https://favicon.io/) 방문
2. "Upload Logo" 선택
3. ChampStep 로고 이미지 업로드
4. 배경색을 검은색(#000000)으로 설정
5. 생성된 파비콘 패키지 다운로드

### 또는 다른 온라인 도구들
- **RealFaviconGenerator** (https://realfavicongenerator.net/)
- **Favicon Generator** (https://www.favicon-generator.org/)

## 3. 필요한 파일 목록

다음 파일들을 `public/` 폴더에 저장해야 합니다:

### 기본 파비콘
- `favicon.ico` (16x16, 32x32, 48x48 멀티 사이즈)
- `favicon-16x16.png`
- `favicon-32x32.png`
- `favicon-48x48.png`
- `favicon-64x64.png`
- `favicon-128x128.png`
- `favicon-256x256.png`

### Apple Touch Icons
- `apple-touch-icon.png` (180x180)
- `apple-touch-icon-152x152.png`
- `apple-touch-icon-144x144.png`
- `apple-touch-icon-120x120.png`
- `apple-touch-icon-114x114.png`
- `apple-touch-icon-76x76.png`
- `apple-touch-icon-72x72.png`
- `apple-touch-icon-60x60.png`
- `apple-touch-icon-57x57.png`

### Android Chrome
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`

### Microsoft Tiles
- `mstile-70x70.png`
- `mstile-144x144.png`
- `mstile-150x150.png`
- `mstile-310x150.png`
- `mstile-310x310.png`

## 4. 배포 후 확인사항

1. 브라우저 탭에서 파비콘 표시 확인
2. 모바일 기기에서 홈 화면 추가 시 아이콘 확인
3. 다양한 브라우저에서 테스트

## 5. 디자인 가이드라인

- **배경색**: 검은색 (#000000)
- **주요 색상**: 흰색 "CHAMP", 초록색 "STEP"
- **스타일**: 현재 로고의 거친 텍스처 유지
- **가독성**: 16x16 크기에서도 "CS" 또는 심플한 형태로 인식 가능하도록 조정

## 6. 임시 해결책

파비콘 파일이 준비되기 전까지는 현재 HTML에 설정된 링크들이 404 오류를 발생시킬 수 있습니다. 
급하게 배포해야 한다면 해당 링크들을 임시로 주석 처리하거나 data URI 파비콘을 사용할 수 있습니다. 