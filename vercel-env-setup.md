# Vercel 환경 변수 설정 가이드

## 방법 1: Vercel CLI 사용 (권장)

```bash
# Vercel CLI 설치 (없는 경우)
npm i -g vercel

# 프로젝트 링크 (처음 한 번만)
vercel link

# 환경 변수 설정
vercel env add VITE_SUPABASE_URL production
# 값 입력: https://zmoalrtninbbgzqhfufe.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# 값 입력: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptb2FscnRuaW5iYmd6cWhmdWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MjM2NjAsImV4cCI6MjA2NzA5OTY2MH0.E6gj0plKMKWK3skBvBycKZsuanK2c0z5UcvZ1c9SfLA

# 모든 환경에 적용 (선택사항)
vercel env add VITE_SUPABASE_URL preview
vercel env add VITE_SUPABASE_URL development
vercel env add VITE_SUPABASE_ANON_KEY preview
vercel env add VITE_SUPABASE_ANON_KEY development

# 재배포
vercel --prod
```

## 방법 2: Vercel 웹 대시보드 사용

1. https://vercel.com/dashboard 접속
2. ChampStep 프로젝트 선택
3. Settings → Environment Variables
4. 다음 변수 추가:

**VITE_SUPABASE_URL**
- Value: `https://zmoalrtninbbgzqhfufe.supabase.co`
- Environments: Production, Preview, Development 모두 체크

**VITE_SUPABASE_ANON_KEY**
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptb2FscnRuaW5iYmd6cWhmdWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MjM2NjAsImV4cCI6MjA2NzA5OTY2MH0.E6gj0plKMKWK3skBvBycKZsuanK2c0z5UcvZ1c9SfLA`
- Environments: Production, Preview, Development 모두 체크

5. Save 후 Deployments → latest deployment → Redeploy

## 확인 방법

배포 후 브라우저 콘솔에서 다음 로그 확인:
- `🔧 Environment variables check` - 환경 변수가 제대로 로드되었는지
- `envUrl`, `envKeyLength` - 실제 환경 변수 값이 제대로 전달되었는지