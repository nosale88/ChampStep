-- 대회 테이블
CREATE TABLE IF NOT EXISTS competitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  manager_name VARCHAR(255) NOT NULL,
  manager_contact VARCHAR(50),
  manager_email VARCHAR(255),
  genres TEXT[] DEFAULT '{}',
  venue VARCHAR(255),
  event_start_date DATE NOT NULL,
  event_end_date DATE NOT NULL,
  registration_start_date DATE,
  registration_end_date DATE,
  participation_type VARCHAR(20) CHECK (participation_type IN ('individual', 'team')),
  participant_limit INTEGER,
  is_participant_list_public BOOLEAN DEFAULT true,
  use_preliminaries BOOLEAN DEFAULT false,
  prelim_format VARCHAR(20) CHECK (prelim_format IN ('scoring', 'tournament')),
  finalist_count INTEGER,
  prize_details TEXT,
  age_requirement VARCHAR(255),
  region_requirement VARCHAR(255),
  entry_fee VARCHAR(100),
  audience_limit INTEGER,
  audience_fee VARCHAR(100),
  date_memo TEXT,
  detailed_description TEXT,
  poster VARCHAR(500),
  link VARCHAR(500),
  team_size INTEGER,
  is_prelim_group_tournament BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 대회 참가자 테이블
CREATE TABLE IF NOT EXISTS competition_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  dancer_id TEXT REFERENCES dancers(id) ON DELETE CASCADE,
  team_name VARCHAR(255),
  position INTEGER,
  points INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'participated', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(competition_id, dancer_id)
);

-- 대회 결과 테이블
CREATE TABLE IF NOT EXISTS competition_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES competition_participants(id) ON DELETE CASCADE,
  round VARCHAR(50), -- 예선, 본선, 결승 등
  score DECIMAL(10, 2),
  rank INTEGER,
  judge_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 대회 비디오 테이블
CREATE TABLE IF NOT EXISTS competition_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  dancer_id TEXT REFERENCES dancers(id),
  title VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  thumbnail VARCHAR(500),
  type VARCHAR(50) CHECK (type IN ('performance', 'battle', 'highlight', 'recap', 'interview')),
  upload_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 인덱스 생성
CREATE INDEX idx_competitions_event_date ON competitions(event_start_date);
CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_competition_participants_competition ON competition_participants(competition_id);
CREATE INDEX idx_competition_participants_dancer ON competition_participants(dancer_id);
CREATE INDEX idx_competition_results_competition ON competition_results(competition_id);

-- Row Level Security (RLS) 정책
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_videos ENABLE ROW LEVEL SECURITY;

-- 대회는 누구나 볼 수 있음
CREATE POLICY "Competitions are viewable by everyone" ON competitions
  FOR SELECT USING (true);

-- 대회는 인증된 사용자만 생성 가능
CREATE POLICY "Competitions can be created by authenticated users" ON competitions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 대회는 생성자만 수정 가능
CREATE POLICY "Competitions can be updated by creator" ON competitions
  FOR UPDATE USING (auth.uid() = created_by);

-- 참가자 목록은 공개 설정에 따라 조회 가능
CREATE POLICY "Participants viewable based on competition settings" ON competition_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM competitions 
      WHERE competitions.id = competition_participants.competition_id 
      AND (competitions.is_participant_list_public = true OR competitions.created_by = auth.uid())
    )
  );

-- 참가 신청은 인증된 사용자만 가능
CREATE POLICY "Authenticated users can register for competitions" ON competition_participants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 결과는 누구나 볼 수 있음
CREATE POLICY "Results are viewable by everyone" ON competition_results
  FOR SELECT USING (true);

-- 비디오는 누구나 볼 수 있음
CREATE POLICY "Videos are viewable by everyone" ON competition_videos
  FOR SELECT USING (true); 