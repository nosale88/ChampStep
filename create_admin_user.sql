-- 관리자 사용자 생성을 위한 SQL 스크립트
-- 이 스크립트는 Supabase 대시보드의 SQL Editor에서 실행해야 합니다.

-- 🚨 중요: 먼저 fix_admin_column.sql을 실행해서 is_admin 컬럼을 추가하세요!

-- 1. willuent@naver.com 계정으로 먼저 회원가입을 진행하세요
--    (Supabase Auth를 통해 일반 회원가입)

-- 2. 회원가입 후 해당 사용자의 실제 UUID를 확인
-- SELECT id, email FROM auth.users WHERE email = 'willuent@naver.com';

-- 3. 관리자 프로필 생성 또는 업데이트 (실제 user_id로 변경 필요)
-- 아래 쿼리에서 'YOUR_ACTUAL_USER_ID'를 실제 UUID로 교체하세요
/*
INSERT INTO dancers (
    user_id,
    email,
    name,
    nickname,
    genres,
    total_points,
    rank,
    avatar,
    is_admin,
    created_at
) VALUES (
    'YOUR_ACTUAL_USER_ID', -- 실제 auth.users의 id로 교체
    'willuent@naver.com',
    '관리자',
    'Admin',
    ARRAY['Admin']::text[],
    999999,
    0, -- 관리자는 순위 0번
    'https://i.pravatar.cc/150?u=admin',
    true, -- 관리자 권한
    NOW()
) ON CONFLICT (user_id) 
DO UPDATE SET 
    is_admin = true,
    rank = 0,
    total_points = 999999,
    updated_at = NOW();
*/

-- 4. 또는 이메일로 기존 댄서 프로필을 관리자로 승격
UPDATE dancers 
SET is_admin = true, rank = 0, total_points = 999999
WHERE email = 'willuent@naver.com';

-- 5. 관리자 권한 확인
SELECT id, email, nickname, is_admin 
FROM dancers 
WHERE email = 'willuent@naver.com';