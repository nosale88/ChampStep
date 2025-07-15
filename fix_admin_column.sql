-- dancers 테이블에 is_admin 컬럼 추가
ALTER TABLE dancers ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 관리자 이메일을 위한 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_dancers_email ON dancers(email);
CREATE INDEX IF NOT EXISTS idx_dancers_is_admin ON dancers(is_admin);

-- 관리자 계정 업데이트 (이미 존재하는 경우)
UPDATE dancers 
SET is_admin = TRUE 
WHERE email = 'willuent@naver.com';

-- 관리자 이메일 목록 테이블 생성
CREATE TABLE IF NOT EXISTS admin_emails (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 관리자 이메일 등록
INSERT INTO admin_emails (email) VALUES ('willuent@naver.com')
ON CONFLICT (email) DO NOTHING;

-- 관리자 권한 체크 함수 생성
CREATE OR REPLACE FUNCTION is_admin_user(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_emails 
        WHERE email = user_email
    ) OR EXISTS (
        SELECT 1 FROM dancers 
        WHERE email = user_email AND is_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS 정책에서 사용할 현재 사용자 이메일 가져오는 함수
CREATE OR REPLACE FUNCTION get_current_user_email()
RETURNS TEXT AS $$
BEGIN
    RETURN (auth.jwt() ->> 'email');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 댄서들의 is_admin 컬럼 초기화 (FALSE로 설정)
UPDATE dancers SET is_admin = FALSE WHERE is_admin IS NULL;