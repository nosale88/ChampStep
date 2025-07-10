# OAuth 설정 가이드

ChampStep 프로젝트에서 구글 로그인과 카카오 로그인을 활성화하려면 Supabase 콘솔에서 OAuth 설정을 완료해야 합니다.

## 1. Supabase 콘솔 설정

1. [Supabase 콘솔](https://supabase.com/dashboard)에 로그인
2. ChampStep 프로젝트 선택
3. 좌측 메뉴에서 `Authentication` → `Providers` 선택

## 2. 구글 로그인 설정

### 2.1 Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 프로젝트 선택 또는 새 프로젝트 생성
3. `APIs & Services` → `Credentials` 이동
4. `+ CREATE CREDENTIALS` → `OAuth client ID` 선택
5. Application type: `Web application` 선택
6. 다음 정보 입력:
   - **Name**: ChampStep
   - **Authorized JavaScript origins**: 
     - `http://localhost:5174` (개발환경)
     - `https://your-domain.com` (배포환경)
   - **Authorized redirect URIs**:
     - `https://zmoalrtninbbgzqhfufe.supabase.co/auth/v1/callback`

### 2.2 Supabase 설정

1. Supabase 콘솔에서 `Google` 제공자 선택
2. `Enable Google provider` 토글 활성화
3. Google Cloud Console에서 생성한 정보 입력:
   - **Client ID**: Google OAuth 클라이언트 ID
   - **Client Secret**: Google OAuth 클라이언트 시크릿
4. `Save` 버튼 클릭

## 3. 카카오 로그인 설정

### 3.1 카카오 개발자 콘솔 설정

1. [카카오 개발자 콘솔](https://developers.kakao.com/)에 접속
2. 로그인 후 `내 애플리케이션` 선택
3. `애플리케이션 추가하기` 클릭
4. 앱 정보 입력:
   - **앱 이름**: ChampStep
   - **사업자명**: 개인 또는 회사명
5. 애플리케이션 생성 후 `제품 설정` → `카카오 로그인` 선택
6. `활성화 설정` 상태를 `ON`으로 변경
7. `Redirect URI` 설정:
   - `https://zmoalrtninbbgzqhfufe.supabase.co/auth/v1/callback`
8. `동의항목` 설정:
   - 닉네임: 필수
   - 이메일: 필수
   - 프로필 사진: 선택

### 3.2 Supabase 설정

1. Supabase 콘솔에서 `Kakao` 제공자 선택
2. `Enable Kakao provider` 토글 활성화
3. 카카오 개발자 콘솔에서 확인한 정보 입력:
   - **Client ID**: REST API 키
   - **Client Secret**: Client Secret (보안 탭에서 확인)
4. `Save` 버튼 클릭

## 4. 추가 설정

### 4.1 Site URL 설정

1. Supabase 콘솔에서 `Authentication` → `Settings` 선택
2. `Site URL` 설정:
   - 개발환경: `http://localhost:5174`
   - 배포환경: `https://your-domain.com`

### 4.2 Redirect URLs 설정

1. `Additional Redirect URLs` 섹션에 추가:
   - `http://localhost:5174`
   - `https://your-domain.com`

## 5. 테스트

1. 개발 서버 실행: `npm run dev`
2. 브라우저에서 `http://localhost:5174` 접속
3. 로그인 버튼 클릭
4. 구글 로그인과 카카오 로그인 버튼 확인
5. 각 소셜 로그인 테스트

## 6. 문제 해결

### 일반적인 오류

1. **redirect_uri_mismatch**: Redirect URI가 정확히 설정되었는지 확인
2. **invalid_client**: Client ID와 Client Secret이 올바른지 확인
3. **access_denied**: 사용자가 권한을 거부했거나 앱 설정에 문제가 있음

### 디버깅 팁

1. 브라우저 개발자 도구의 Network 탭에서 OAuth 요청 확인
2. Supabase 콘솔의 Authentication → Logs에서 오류 로그 확인
3. 각 플랫폼의 개발자 콘솔에서 앱 상태 확인

## 7. 보안 고려사항

1. **Client Secret 보안**: 클라이언트 시크릿은 절대 프론트엔드 코드에 노출되지 않도록 주의
2. **HTTPS 사용**: 배포환경에서는 반드시 HTTPS 사용
3. **도메인 검증**: 승인된 도메인에서만 OAuth 요청이 가능하도록 설정
4. **권한 최소화**: 필요한 권한만 요청하도록 설정

설정이 완료되면 사용자는 구글 계정과 카카오 계정으로 간편하게 로그인할 수 있습니다. 