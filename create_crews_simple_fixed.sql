-- 기존 crews 테이블 구조만 사용하여 크루 데이터 생성
-- Supabase SQL Editor에서 실행하세요

-- 1. 현재 crews 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'crews' AND table_schema = 'public';

-- 2. 댄서 데이터에서 고유한 크루명들 추출하여 crews 테이블에 삽입
-- (genre 컬럼이 없다면 제외)
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

-- 3. 결과 확인
SELECT 
  c.name as crew_name,
  c.introduction,
  count(d.id) as member_count,
  string_agg(d.nickname, ', ' ORDER BY d.rank LIMIT 5) as top_members
FROM crews c
LEFT JOIN dancers d ON d.crew = c.name
GROUP BY c.id, c.name, c.introduction
ORDER BY member_count DESC;

-- 4. 크루별 통계 확인
SELECT 
  crew,
  count(*) as member_count,
  min(rank) as best_rank,
  max(total_points) as highest_points,
  string_agg(DISTINCT unnest(genres), ', ') as all_genres
FROM dancers 
WHERE crew IS NOT NULL AND crew != ''
GROUP BY crew
ORDER BY member_count DESC
LIMIT 20;

COMMIT; 