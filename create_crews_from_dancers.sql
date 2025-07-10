-- 댄서 데이터에서 크루 정보 추출하여 crews 테이블 생성
-- Supabase SQL Editor에서 실행하세요

-- 1. 댄서 테이블에서 고유한 크루명들 추출하여 crews 테이블에 삽입
INSERT INTO crews (id, name, genre, introduction, created_at, updated_at)
SELECT 
  gen_random_uuid()::text as id,
  crew as name,
  -- 해당 크루의 주요 장르 계산 (가장 많은 장르)
  (
    SELECT unnest(genres) as genre
    FROM dancers d2 
    WHERE d2.crew = d1.crew AND d2.crew IS NOT NULL
    GROUP BY unnest(genres)
    ORDER BY count(*) DESC
    LIMIT 1
  ) as genre,
  -- 크루 소개 자동 생성
  concat(
    crew, ' 크루입니다. ',
    (SELECT count(*) FROM dancers d3 WHERE d3.crew = d1.crew)::text,
    '명의 멤버가 활동하고 있습니다.'
  ) as introduction,
  NOW() as created_at,
  NOW() as updated_at
FROM dancers d1
WHERE crew IS NOT NULL 
  AND crew != ''
  AND crew NOT IN (SELECT name FROM crews WHERE name IS NOT NULL)
GROUP BY crew
ORDER BY crew;

-- 2. 생성된 크루 정보 확인
SELECT 
  c.name as crew_name,
  c.genre,
  c.introduction,
  count(d.id) as member_count,
  string_agg(d.nickname, ', ' ORDER BY d.rank) as members
FROM crews c
LEFT JOIN dancers d ON d.crew = c.name
GROUP BY c.id, c.name, c.genre, c.introduction
ORDER BY member_count DESC;

-- 3. 크루별 통계 확인
SELECT 
  crew,
  count(*) as member_count,
  min(rank) as best_rank,
  max(total_points) as highest_points,
  string_agg(DISTINCT unnest(genres), ', ') as all_genres
FROM dancers 
WHERE crew IS NOT NULL AND crew != ''
GROUP BY crew
ORDER BY member_count DESC;

COMMIT; 