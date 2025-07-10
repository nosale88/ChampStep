-- 가장 기본적인 테이블 생성 SQL (인덱스 없음)
-- 오류 방지를 위해 최소한의 구조만 생성

-- 1. 대회 참가자 테이블
CREATE TABLE IF NOT EXISTS competition_participants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  competition_id TEXT NOT NULL,
  dancer_id TEXT NOT NULL,
  team_name TEXT,
  position INTEGER,
  points INTEGER DEFAULT 0,
  status TEXT DEFAULT 'registered',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 대회 결과 테이블
CREATE TABLE IF NOT EXISTS competition_results (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  competition_id TEXT NOT NULL,
  dancer_id TEXT NOT NULL,
  rank INTEGER NOT NULL,
  score DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 대회 비디오 테이블
CREATE TABLE IF NOT EXISTS competition_videos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  competition_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 크루 스케줄 테이블
CREATE TABLE IF NOT EXISTS crew_schedules (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  crew_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location TEXT,
  max_participants INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 스케줄 참석자 테이블
CREATE TABLE IF NOT EXISTS schedule_attendees (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  schedule_id TEXT NOT NULL,
  dancer_id TEXT NOT NULL,
  status TEXT DEFAULT 'attending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 메시지 테이블
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 메시지 읽음 상태 테이블
CREATE TABLE IF NOT EXISTS message_reads (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  message_id TEXT NOT NULL,
  reader_id TEXT NOT NULL,
  read_at TIMESTAMPTZ DEFAULT NOW()
);

-- 성공 메시지
SELECT 'SUCCESS: All basic tables created!' as result; 