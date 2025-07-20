-- 관리자 이메일 테이블 생성
CREATE TABLE IF NOT EXISTS admin_emails (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 관리자 이메일 추가
INSERT INTO admin_emails (email) VALUES 
  ('willuent@naver.com'),
  ('akaswing@kakao.com')
ON CONFLICT (email) DO NOTHING;

-- RLS 정책 설정
ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 관리자 이메일을 조회할 수 있도록 허용 (권한 체크용)
CREATE POLICY "Anyone can read admin emails" ON admin_emails
  FOR SELECT USING (true);

-- 관리자만 관리자 이메일을 수정할 수 있도록 제한
CREATE POLICY "Only admins can modify admin emails" ON admin_emails
  FOR ALL USING (
    email IN (SELECT email FROM admin_emails WHERE email = (auth.jwt() ->> 'email'))
  );
