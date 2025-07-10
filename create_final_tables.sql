-- 기존 테이블 구조에 맞춰서 최종 테이블 생성
-- 존재하지 않는 컬럼 참조 제거하고 단순화된 정책 적용

-- =============================================
-- 1. dancers 테이블에 필요한 컬럼 추가
-- =============================================

-- dancers 테이블에 user_id 컬럼 추가 (인증 연동용)
ALTER TABLE dancers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- competitions 테이블에 필요한 컬럼 추가
ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS is_participant_list_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- =============================================
-- 2. 대회 참가자 테이블 생성
-- =============================================

CREATE TABLE IF NOT EXISTS competition_participants (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  competition_id TEXT REFERENCES competitions(id) ON DELETE CASCADE,
  dancer_id TEXT REFERENCES dancers(id) ON DELETE CASCADE,
  team_name VARCHAR(255),
  position INTEGER,
  points INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'participated', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(competition_id, dancer_id)
);

-- =============================================
-- 3. 크루 스케줄 테이블
-- =============================================

CREATE TABLE IF NOT EXISTS crew_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  crew_id TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location VARCHAR(255),
  type VARCHAR(50) CHECK (type IN ('practice', 'performance', 'meeting', 'workshop', 'competition')),
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 스케줄 참석자 테이블
CREATE TABLE IF NOT EXISTS schedule_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES crew_schedules(id) ON DELETE CASCADE,
  dancer_id TEXT REFERENCES dancers(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined', 'attended')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(schedule_id, dancer_id)
);

-- =============================================
-- 4. 메시지 테이블
-- =============================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255),
  author_id UUID REFERENCES auth.users(id),
  target_type VARCHAR(20) CHECK (target_type IN ('dancer', 'crew')),
  target_id TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 메시지 읽음 상태 테이블
CREATE TABLE IF NOT EXISTS message_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  read_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(message_id, user_id)
);

-- =============================================
-- 5. 대회 관련 추가 테이블
-- =============================================

-- 대회 결과 테이블
CREATE TABLE IF NOT EXISTS competition_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id TEXT REFERENCES competitions(id) ON DELETE CASCADE,
  participant_id TEXT REFERENCES competition_participants(id) ON DELETE CASCADE,
  round VARCHAR(50),
  score DECIMAL(10, 2),
  rank INTEGER,
  judge_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 대회 비디오 테이블
CREATE TABLE IF NOT EXISTS competition_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id TEXT REFERENCES competitions(id) ON DELETE CASCADE,
  dancer_id TEXT REFERENCES dancers(id),
  title VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  thumbnail VARCHAR(500),
  type VARCHAR(50) CHECK (type IN ('performance', 'battle', 'highlight', 'recap', 'interview')),
  upload_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =============================================
-- 6. 인덱스 생성
-- =============================================

-- 대회 참가자 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_competition_participants_competition ON competition_participants(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_dancer ON competition_participants(dancer_id);

-- 크루 스케줄 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_crew_schedules_crew ON crew_schedules(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_schedules_date ON crew_schedules(date);
CREATE INDEX IF NOT EXISTS idx_crew_schedules_type ON crew_schedules(type);
CREATE INDEX IF NOT EXISTS idx_schedule_attendees_schedule ON schedule_attendees(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_attendees_dancer ON schedule_attendees(dancer_id);

-- 메시지 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_messages_target ON messages(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_messages_author ON messages(author_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_message_reads_user ON message_reads(user_id);

-- 대회 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_competition_results_competition ON competition_results(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_results_participant ON competition_results(participant_id);
CREATE INDEX IF NOT EXISTS idx_competition_videos_competition ON competition_videos(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_videos_dancer ON competition_videos(dancer_id);

-- dancers 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_dancers_user_id ON dancers(user_id);

-- =============================================
-- 7. Row Level Security (RLS) 정책
-- =============================================

-- 대회 참가자 테이블 RLS
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;

-- 크루 스케줄 테이블 RLS
ALTER TABLE crew_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_attendees ENABLE ROW LEVEL SECURITY;

-- 메시지 테이블 RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

-- 대회 관련 테이블 RLS
ALTER TABLE competition_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_videos ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 8. 단순화된 정책 (기본 보안만 적용)
-- =============================================

-- 대회 참가자 정책
CREATE POLICY "Anyone can view competition participants" ON competition_participants
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can register" ON competition_participants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own participation" ON competition_participants
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 크루 스케줄 정책
CREATE POLICY "Anyone can view public schedules" ON crew_schedules
  FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can create schedules" ON crew_schedules
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Schedule creators can update" ON crew_schedules
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Schedule creators can delete" ON crew_schedules
  FOR DELETE USING (created_by = auth.uid());

-- 스케줄 참석자 정책
CREATE POLICY "Anyone can view attendees" ON schedule_attendees
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage attendance" ON schedule_attendees
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 메시지 정책
CREATE POLICY "Anyone can view public messages" ON messages
  FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can create messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update their messages" ON messages
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Authors can delete their messages" ON messages
  FOR DELETE USING (author_id = auth.uid());

-- 메시지 읽음 상태 정책
CREATE POLICY "Users can manage their read status" ON message_reads
  FOR ALL USING (user_id = auth.uid());

-- 대회 결과 정책
CREATE POLICY "Anyone can view results" ON competition_results
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create results" ON competition_results
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 대회 비디오 정책
CREATE POLICY "Anyone can view videos" ON competition_videos
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload videos" ON competition_videos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- 9. 트리거 함수 생성
-- =============================================

-- 메시지 생성시 작성자 ID 자동 설정
CREATE OR REPLACE FUNCTION set_message_author()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.author_id IS NULL THEN
    NEW.author_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_message_author_trigger
BEFORE INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION set_message_author();

-- 업데이트 시간 자동 설정
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crew_schedules_updated_at
BEFORE UPDATE ON crew_schedules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 