-- 댄서 포트폴리오에 필요한 컬럼들을 추가

-- 소셜 미디어 URL 컬럼 추가
ALTER TABLE dancers ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE dancers ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE dancers ADD COLUMN IF NOT EXISTS twitter_url TEXT;

-- 프로필 이미지 관련 컬럼 추가
ALTER TABLE dancers ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE dancers ADD COLUMN IF NOT EXISTS background_image TEXT;

-- 기본 정보 컬럼 추가 (이미 존재할 수도 있음)
ALTER TABLE dancers ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE dancers ADD COLUMN IF NOT EXISTS birth_date TEXT;
ALTER TABLE dancers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE dancers ADD COLUMN IF NOT EXISTS email TEXT;

-- 샘플 데이터 업데이트 (기존 댄서들에게 포트폴리오 데이터 추가)
UPDATE dancers 
SET 
  bio = CASE 
    WHEN nickname = 'bboy_thunder' THEN '브레이킹의 새로운 차원을 보여주는 댄서입니다. 파워풀한 파워무브와 창의적인 플로우로 많은 사람들에게 영감을 주고 있습니다.'
    WHEN nickname = 'hip_hop_queen' THEN '힙합 씬의 여왕으로 불리며, 그루브와 스타일을 완벽하게 조화시킨 댄스로 많은 팬들의 사랑을 받고 있습니다.'
    WHEN nickname = 'popping_master' THEN '팝핑의 정수를 보여주는 마스터입니다. 정확한 테크닉과 독창적인 스타일로 팝핑 씬을 이끌어가고 있습니다.'
    ELSE '열정적인 댄서로서 끊임없이 새로운 도전을 하며 성장하고 있습니다.'
  END,
  instagram_url = CASE 
    WHEN nickname = 'bboy_thunder' THEN 'https://instagram.com/bboy_thunder'
    WHEN nickname = 'hip_hop_queen' THEN 'https://instagram.com/hip_hop_queen'
    WHEN nickname = 'popping_master' THEN 'https://instagram.com/popping_master'
    ELSE NULL
  END,
  youtube_url = CASE 
    WHEN nickname = 'bboy_thunder' THEN 'https://youtube.com/@bboy_thunder'
    WHEN nickname = 'hip_hop_queen' THEN 'https://youtube.com/@hip_hop_queen'
    WHEN nickname = 'popping_master' THEN 'https://youtube.com/@popping_master'
    ELSE NULL
  END,
  profile_image = CASE 
    WHEN nickname = 'bboy_thunder' THEN 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=400&fit=crop&crop=face'
    WHEN nickname = 'hip_hop_queen' THEN 'https://images.unsplash.com/photo-1494790108755-2616c9c1e3a7?w=400&h=400&fit=crop&crop=face'
    WHEN nickname = 'popping_master' THEN 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
    ELSE NULL
  END,
  birth_date = CASE 
    WHEN nickname = 'bboy_thunder' THEN '1995-03-15'
    WHEN nickname = 'hip_hop_queen' THEN '1998-07-22'
    WHEN nickname = 'popping_master' THEN '1992-11-08'
    ELSE NULL
  END
WHERE nickname IN ('bboy_thunder', 'hip_hop_queen', 'popping_master');

-- awards 테이블 생성 (댄서의 수상 내역을 저장)
CREATE TABLE IF NOT EXISTS awards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dancer_id UUID REFERENCES dancers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rank TEXT NOT NULL,
  date TEXT NOT NULL,
  organizer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS 정책 설정
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Awards are viewable by everyone" ON awards
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own awards" ON awards
  FOR INSERT WITH CHECK (auth.uid()::text = (SELECT user_id FROM dancers WHERE id = dancer_id));

CREATE POLICY "Users can update their own awards" ON awards
  FOR UPDATE USING (auth.uid()::text = (SELECT user_id FROM dancers WHERE id = dancer_id));

CREATE POLICY "Users can delete their own awards" ON awards
  FOR DELETE USING (auth.uid()::text = (SELECT user_id FROM dancers WHERE id = dancer_id));

-- videos 테이블 생성 (댄서의 동영상을 저장)
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dancer_id UUID REFERENCES dancers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail TEXT,
  description TEXT,
  type TEXT CHECK (type IN ('performance', 'battle', 'highlight', 'recap', 'interview')) DEFAULT 'performance',
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS 정책 설정
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Videos are viewable by everyone" ON videos
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own videos" ON videos
  FOR INSERT WITH CHECK (auth.uid()::text = (SELECT user_id FROM dancers WHERE id = dancer_id));

CREATE POLICY "Users can update their own videos" ON videos
  FOR UPDATE USING (auth.uid()::text = (SELECT user_id FROM dancers WHERE id = dancer_id));

CREATE POLICY "Users can delete their own videos" ON videos
  FOR DELETE USING (auth.uid()::text = (SELECT user_id FROM dancers WHERE id = dancer_id));

-- 샘플 수상 내역 데이터 추가
INSERT INTO awards (dancer_id, name, rank, date, organizer)
SELECT 
  d.id,
  award_data.name,
  award_data.rank,
  award_data.date,
  award_data.organizer
FROM dancers d
CROSS JOIN (
  VALUES 
    ('bboy_thunder', 'Battle of the Year Korea', '1st Place', '2023-08-15', 'BOTY Korea'),
    ('bboy_thunder', 'Red Bull BC One Cypher', '2nd Place', '2023-05-20', 'Red Bull'),
    ('bboy_thunder', 'Freestyle Session', '3rd Place', '2022-12-10', 'Freestyle Session'),
    ('hip_hop_queen', 'Hip Hop International', '1st Place', '2023-07-30', 'HHI'),
    ('hip_hop_queen', 'World of Dance', '2nd Place', '2023-04-15', 'WOD'),
    ('hip_hop_queen', 'Urban Dance Championship', '1st Place', '2022-11-25', 'UDC'),
    ('popping_master', 'Popping Forever', '1st Place', '2023-09-05', 'Popping Forever'),
    ('popping_master', 'Funk Styles Forever', '2nd Place', '2023-06-12', 'FSF'),
    ('popping_master', 'Electric Boogaloo', '1st Place', '2022-10-18', 'EB')
) AS award_data(nickname, name, rank, date, organizer)
WHERE d.nickname = award_data.nickname;

-- 샘플 동영상 데이터 추가
INSERT INTO videos (dancer_id, title, url, description, type)
SELECT 
  d.id,
  video_data.title,
  video_data.url,
  video_data.description,
  video_data.type
FROM dancers d
CROSS JOIN (
  VALUES 
    ('bboy_thunder', 'BOTY Korea 2023 Final Battle', 'https://www.youtube.com/watch?v=LXb3EKWsInQ', 'Battle of the Year Korea 2023에서의 결승전 배틀 영상입니다. 파워풀한 파워무브와 창의적인 플로우를 확인해보세요!', 'battle'),
    ('bboy_thunder', 'Power Move Training Session', 'https://www.youtube.com/watch?v=9bZkp7q19f0', '파워무브 연습 세션 영상입니다. 윈드밀과 헤드스핀 연습 과정을 담았습니다.', 'performance'),
    ('hip_hop_queen', 'HHI 2023 Championship Performance', 'https://www.youtube.com/watch?v=2vjPBrBU-TM', 'Hip Hop International 2023 우승 퍼포먼스입니다. 완벽한 그루브와 스타일을 보여드립니다.', 'performance'),
    ('hip_hop_queen', 'Freestyle Hip Hop Session', 'https://www.youtube.com/watch?v=PSZxmZmBfnU', '즉흥 힙합 프리스타일 세션입니다. 다양한 음악에 맞춰 춤추는 모습을 담았습니다.', 'performance'),
    ('popping_master', 'Popping Forever 2023 Winner', 'https://www.youtube.com/watch?v=PsO6ZnUZI0g', 'Popping Forever 2023 우승 영상입니다. 정확한 팝핑 테크닉과 독창적인 스타일을 확인해보세요.', 'battle'),
    ('popping_master', 'Robot & Animation Tutorial', 'https://www.youtube.com/watch?v=qV5lzRHrGeg', '로봇 댄스와 애니메이션 스타일 튜토리얼 영상입니다. 초보자도 쉽게 따라할 수 있습니다.', 'performance')
) AS video_data(nickname, title, url, description, type)
WHERE d.nickname = video_data.nickname;

-- 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_awards_dancer_id ON awards(dancer_id);
CREATE INDEX IF NOT EXISTS idx_videos_dancer_id ON videos(dancer_id);
CREATE INDEX IF NOT EXISTS idx_dancers_nickname ON dancers(nickname); 