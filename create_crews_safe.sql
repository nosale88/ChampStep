-- 가장 안전한 방식으로 크루 테이블 생성
-- Supabase SQL Editor에서 실행하세요

-- 먼저 어떤 크루들이 있는지 확인
SELECT 
  crew,
  count(*) as member_count,
  min(rank) as best_rank,
  string_agg(DISTINCT unnest(genres), ', ') as genres,
  string_agg(nickname, ', ' ORDER BY rank LIMIT 3) as top_members
FROM dancers 
WHERE crew IS NOT NULL AND crew != ''
GROUP BY crew
ORDER BY member_count DESC;

-- 크루 데이터 삽입 (수동으로 주요 크루들만)
INSERT INTO crews (id, name, genre, introduction, created_at, updated_at) VALUES
('crew_jinjo', 'JINJO', 'B-boying', 'JINJO 크루입니다. 한국을 대표하는 B-boy 크루 중 하나입니다.', NOW(), NOW()),
('crew_gamblerz', 'Gamblerz crew', 'B-boying', 'Gamblerz crew 크루입니다. 실력있는 B-boy들이 모인 크루입니다.', NOW(), NOW()),
('crew_bitgoeul', '빛고을댄서스', 'Hip-hop', '빛고을댄서스 크루입니다. 광주를 기반으로 활동하는 댄스 크루입니다.', NOW(), NOW()),
('crew_funkintheheart', 'Funkintheheart', 'Popping', 'Funkintheheart 크루입니다. 팝핑 전문 크루입니다.', NOW(), NOW()),
('crew_flowxl', 'Flowxl', 'B-boying', 'Flowxl 크루입니다. 창의적인 스타일의 B-boy 크루입니다.', NOW(), NOW()),
('crew_frenchfriez', 'Frenchfriez', 'Locking', 'Frenchfriez 크루입니다. 락킹 댄스 전문 크루입니다.', NOW(), NOW()),
('crew_artistreet', 'Artistreet', 'B-boying', 'Artistreet 크루입니다. 아티스틱한 B-boy 크루입니다.', NOW(), NOW()),
('crew_mannequeen', 'Mannequeen', 'Hip-hop', 'Mannequeen 크루입니다. 여성 힙합 댄서들의 크루입니다.', NOW(), NOW()),
('crew_unlimited', 'Unlimited', 'House', 'Unlimited 크루입니다. 하우스 댄스 전문 크루입니다.', NOW(), NOW()),
('crew_platon', 'Platon crew', 'B-boying', 'Platon crew 크루입니다. 실력있는 B-boy들이 모인 크루입니다.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  genre = EXCLUDED.genre,
  introduction = EXCLUDED.introduction,
  updated_at = NOW();

-- 모든 크루 자동 생성 (나머지 크루들)
INSERT INTO crews (id, name, genre, introduction, created_at, updated_at)
SELECT 
  concat('crew_', lower(replace(replace(crew, ' ', '_'), '.', '_'))) as id,
  crew as name,
  'Hip-hop' as genre,
  concat(crew, ' 크루입니다.') as introduction,
  NOW() as created_at,
  NOW() as updated_at
FROM (
  SELECT DISTINCT crew
  FROM dancers 
  WHERE crew IS NOT NULL 
    AND crew != ''
    AND crew NOT IN (SELECT name FROM crews)
) unique_crews
ORDER BY crew;

-- 결과 확인
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