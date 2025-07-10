-- crews 테이블 구조 확인 및 수정 후 크루 데이터 생성
-- Supabase SQL Editor에서 실행하세요

-- 1. 현재 crews 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'crews' AND table_schema = 'public';

-- 2. genre 컬럼이 없다면 추가
ALTER TABLE crews ADD COLUMN IF NOT EXISTS genre TEXT;

-- 3. 댄서 데이터에서 고유한 크루명들 추출하여 crews 테이블에 삽입
INSERT INTO crews (id, name, genre, introduction, created_at, updated_at)
SELECT 
  gen_random_uuid()::text as id,
  crew as name,
  'Hip-hop' as genre,  -- 일단 기본값으로 설정
  concat(crew, ' 크루입니다. ', count(*)::text, '명의 멤버가 활동하고 있습니다.') as introduction,
  NOW() as created_at,
  NOW() as updated_at
FROM dancers
WHERE crew IS NOT NULL 
  AND crew != ''
  AND crew NOT IN (SELECT COALESCE(name, '') FROM crews)
GROUP BY crew
ORDER BY count(*) DESC;

-- 4. 주요 크루들의 장르 업데이트
UPDATE crews SET genre = 'B-boying' WHERE name IN ('JINJO', 'Gamblerz crew', 'Flowxl', 'Artistreet', 'Platon crew', 'Eeight', 'FLOORADDICTS', 'MB crew', 'Fusionmc', 'SOULBURNZ', 'Wild crew', 'Oneway crew', 'Rivers crew', 'BREAKPOINTS', 'CAY CREW', 'Break ambition', 'fanzed crew', '도봉구청 브레이킹 실업팀', '20centuryboyz');

UPDATE crews SET genre = 'Popping' WHERE name IN ('Funkintheheart', 'variety balance', 'BasementBlocks', 'Justevee', 'MHY', 'WORLD FAME US', 'Oriental heroez', 'glayers');

UPDATE crews SET genre = 'Locking' WHERE name IN ('Frenchfriez', 'Cosmic D-flo', 'LOCK N LOL', 'Specialll crew', 'Realmanz', '2waydance');

UPDATE crews SET genre = 'Waacking' WHERE name IN ('wanna what', 'K.L.W.C', 'Comingout');

UPDATE crews SET genre = 'Hip-hop' WHERE name IN ('빛고을댄서스', 'Mannequeen', 'CTRL', 'T.I.B CREW', 'Mbitious', 'Masterpiece', 'A.O team', 'Neo.type', 'Color', 'Macrocube', 'ODDFAM', 'COMBAT', 'Sikgu', 'Focus', 'Funkateers', 'Nop:e crew', 'MUSU', 'Nonstopcrew', 'hanya', 'Unique flow');

UPDATE crews SET genre = 'House' WHERE name IN ('Unlimited', 'cracker', 'overaize', 'higgs', 'g.housefam');

UPDATE crews SET genre = 'Krump' WHERE name IN ('Primekingz');

-- 5. 결과 확인
SELECT 
  c.name as crew_name,
  c.genre,
  count(d.id) as member_count,
  string_agg(d.nickname, ', ' ORDER BY d.rank LIMIT 5) as top_members
FROM crews c
LEFT JOIN dancers d ON d.crew = c.name
GROUP BY c.id, c.name, c.genre
ORDER BY member_count DESC;

COMMIT; 