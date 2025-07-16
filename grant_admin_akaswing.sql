-- akaswing@kakao.com 유저에게 관리자 권한 부여
-- 이 스크립트는 Supabase 대시보드의 SQL Editor에서 실행해야 합니다.

-- 1. 먼저 akaswing@kakao.com으로 회원가입이 되어 있는지 확인
SELECT id, email FROM auth.users WHERE email = 'akaswing@kakao.com';

-- 2. admin_emails 테이블에 관리자 이메일 추가
INSERT INTO admin_emails (email) VALUES ('akaswing@kakao.com')
ON CONFLICT (email) DO NOTHING;

-- 3. 기존 댄서 프로필이 있다면 관리자로 승격
UPDATE dancers 
SET is_admin = true, 
    rank = 0, 
    total_points = 999999,
    updated_at = NOW()
WHERE email = 'akaswing@kakao.com';

-- 4. 댄서 프로필이 없는 경우 새로 생성 (실제 user_id 필요)
-- 먼저 1번 쿼리로 user_id를 확인한 후 아래 쿼리의 'USER_ID_HERE'를 실제 값으로 교체
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
    'USER_ID_HERE', -- 실제 auth.users의 id로 교체
    'akaswing@kakao.com',
    '관리자',
    'akaswing',
    ARRAY['Admin']::text[],
    999999,
    0, -- 관리자는 순위 0번
    'https://i.pravatar.cc/150?u=akaswing',
    true, -- 관리자 권한
    NOW()
) ON CONFLICT (user_id) 
DO UPDATE SET 
    is_admin = true,
    rank = 0,
    total_points = 999999,
    updated_at = NOW();
*/

-- 5. 관리자 권한 확인
SELECT id, email, nickname, is_admin 
FROM dancers 
WHERE email = 'akaswing@kakao.com';

-- 6. 관리자 이메일 목록 확인
SELECT * FROM admin_emails WHERE email = 'akaswing@kakao.com';