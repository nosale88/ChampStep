-- PostgreSQL 문법에 맞게 수정한 크루 생성 SQL
-- Supabase SQL Editor에서 실행하세요

-- 1. 현재 crews 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'crews' AND table_schema = 'public';

-- 2. 댄서 데이터에서 고유한 크루명들 추출하여 crews 테이블에 삽입
INSERT INTO crews (id, name, introduction, created_at, updated_at)
SELECT 
  gen_random_uuid()::text as id,
  crew as name,
  concat(crew, ' 크루입니다. ', count(*)::text, '명의 멤버가 활동하고 있습니다.') as introduction,
  NOW() as created_at,
  NOW() as updated_at
FROM dancers
WHERE crew IS NOT NULL 
  AND crew != ''
  AND crew NOT IN (SELECT COALESCE(name, '') FROM crews)
GROUP BY crew
ORDER BY count(*) DESC;

-- 3. 결과 확인 (상위 5명만)
SELECT 
  c.name as crew_name,
  c.introduction,
  count(d.id) as member_count,
  string_agg(d.nickname, ', ' ORDER BY d.rank) as all_members
FROM crews c
LEFT JOIN dancers d ON d.crew = c.name
GROUP BY c.id, c.name, c.introduction
ORDER BY member_count DESC;

-- 4. 크루별 통계 확인 (상위 20개만)
SELECT 
  crew,
  count(*) as member_count,
  min(rank) as best_rank,
  max(total_points) as highest_points,
  array_to_string(array_agg(DISTINCT unnest(genres)), ', ') as all_genres
FROM dancers 
WHERE crew IS NOT NULL AND crew != ''
GROUP BY crew
ORDER BY member_count DESC
LIMIT 20;

-- 5. 각 크루의 상위 3명 멤버만 보기
WITH crew_top_members AS (
  SELECT 
    crew,
    string_agg(nickname, ', ' ORDER BY rank) as top_3_members
  FROM (
    SELECT 
      crew,
      nickname,
      rank,
      ROW_NUMBER() OVER (PARTITION BY crew ORDER BY rank) as rn
    FROM dancers
    WHERE crew IS NOT NULL AND crew != ''
  ) ranked
  WHERE rn <= 3
  GROUP BY crew
)
SELECT 
  c.name as crew_name,
  count(d.id) as member_count,
  ctm.top_3_members
FROM crews c
LEFT JOIN dancers d ON d.crew = c.name
LEFT JOIN crew_top_members ctm ON ctm.crew = c.name
GROUP BY c.id, c.name, ctm.top_3_members
ORDER BY member_count DESC;

COMMIT; 