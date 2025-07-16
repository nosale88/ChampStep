-- 댄서/크루 등록 시스템을 위한 데이터베이스 스키마

-- 댄서 클레임 요청 테이블
CREATE TABLE IF NOT EXISTS dancer_claim_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dancer_id TEXT NOT NULL REFERENCES dancers(id) ON DELETE CASCADE,
  requested_nickname VARCHAR(100) NOT NULL,
  requested_name VARCHAR(100) NOT NULL,
  requested_genres TEXT[] DEFAULT '{}',
  requested_bio TEXT,
  requested_instagram_url VARCHAR(255),
  requested_youtube_url VARCHAR(255),
  requested_twitter_url VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, dancer_id, status) -- 같은 사용자가 같은 댄서에 대해 중복 요청 방지
);

-- 크루 클레임 요청 테이블
CREATE TABLE IF NOT EXISTS crew_claim_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crew_id TEXT NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  requested_name VARCHAR(100) NOT NULL,
  requested_description TEXT,
  requested_genres TEXT[] DEFAULT '{}',
  requested_location VARCHAR(100),
  requested_instagram_url VARCHAR(255),
  requested_youtube_url VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, crew_id, status) -- 같은 사용자가 같은 크루에 대해 중복 요청 방지
);

-- 기존 dancers 테이블에 user_id와 is_verified 컬럼 추가 (없는 경우)
ALTER TABLE dancers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 기존 crews 테이블에 user_id와 is_verified 컬럼 추가 (없는 경우)
ALTER TABLE crews 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_dancer_claim_requests_user_id ON dancer_claim_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_dancer_claim_requests_dancer_id ON dancer_claim_requests(dancer_id);
CREATE INDEX IF NOT EXISTS idx_dancer_claim_requests_status ON dancer_claim_requests(status);

CREATE INDEX IF NOT EXISTS idx_crew_claim_requests_user_id ON crew_claim_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_crew_claim_requests_crew_id ON crew_claim_requests(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_claim_requests_status ON crew_claim_requests(status);

CREATE INDEX IF NOT EXISTS idx_dancers_user_id ON dancers(user_id);
CREATE INDEX IF NOT EXISTS idx_crews_user_id ON crews(user_id);

-- RLS (Row Level Security) 정책
ALTER TABLE dancer_claim_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_claim_requests ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 요청만 볼 수 있음
CREATE POLICY "Users can view own claim requests" ON dancer_claim_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own claim requests" ON dancer_claim_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own crew claim requests" ON crew_claim_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own crew claim requests" ON crew_claim_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 관리자는 모든 요청을 볼 수 있음 (관리자 역할이 있는 경우)
-- 이 정책은 users 테이블에 role 컬럼이 있다고 가정
-- CREATE POLICY "Admins can view all requests" ON dancer_claim_requests
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM auth.users 
--       WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
--     )
--   );
