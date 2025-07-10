-- 크루 스케줄 테이블
CREATE TABLE IF NOT EXISTS crew_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  crew_id UUID NOT NULL,
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

-- 인덱스 생성
CREATE INDEX idx_crew_schedules_crew ON crew_schedules(crew_id);
CREATE INDEX idx_crew_schedules_date ON crew_schedules(date);
CREATE INDEX idx_crew_schedules_type ON crew_schedules(type);
CREATE INDEX idx_schedule_attendees_schedule ON schedule_attendees(schedule_id);
CREATE INDEX idx_schedule_attendees_dancer ON schedule_attendees(dancer_id);

-- Row Level Security (RLS) 정책
ALTER TABLE crew_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_attendees ENABLE ROW LEVEL SECURITY;

-- 공개 스케줄은 누구나 볼 수 있고, 비공개는 크루 멤버만
CREATE POLICY "View crew schedules" ON crew_schedules
  FOR SELECT USING (
    is_public = true OR 
    EXISTS (
      SELECT 1 FROM dancers 
      WHERE dancers.user_id = auth.uid() 
      AND dancers.crew = (
        SELECT name FROM crews WHERE crews.id::text = crew_schedules.crew_id::text
      )
    )
  );

-- 크루 멤버만 스케줄 생성 가능
CREATE POLICY "Create crew schedules" ON crew_schedules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM dancers 
      WHERE dancers.user_id = auth.uid() 
      AND dancers.crew = (
        SELECT name FROM crews WHERE crews.id::text = crew_schedules.crew_id::text
      )
    )
  );

-- 스케줄 생성자만 수정 가능
CREATE POLICY "Update crew schedules" ON crew_schedules
  FOR UPDATE USING (created_by = auth.uid());

-- 스케줄 생성자만 삭제 가능
CREATE POLICY "Delete crew schedules" ON crew_schedules
  FOR DELETE USING (created_by = auth.uid());

-- 참석자 정보는 크루 멤버만 볼 수 있음
CREATE POLICY "View schedule attendees" ON schedule_attendees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM crew_schedules cs
      JOIN dancers d ON d.user_id = auth.uid()
      WHERE cs.id = schedule_attendees.schedule_id
      AND d.crew = (
        SELECT name FROM crews WHERE crews.id::text = cs.crew_id::text
      )
    )
  );

-- 본인의 참석 정보만 수정 가능
CREATE POLICY "Update own attendance" ON schedule_attendees
  FOR UPDATE USING (
    dancer_id = (SELECT id FROM dancers WHERE user_id = auth.uid())
  ); 