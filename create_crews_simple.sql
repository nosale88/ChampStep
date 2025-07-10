-- 간단한 방식으로 크루 테이블 생성
-- Supabase SQL Editor에서 실행하세요

-- 1. 댄서 테이블에서 고유한 크루명들과 기본 정보 추출
WITH crew_stats AS (
  SELECT 
    crew,
    count(*) as member_count,
    min(rank) as best_rank,
    max(total_points) as highest_points,
    -- 가장 많이 나타나는 장르 찾기
    mode() WITHIN GROUP (ORDER BY unnest(genres)) as main_genre
  FROM dancers 
  WHERE crew IS NOT NULL AND crew != ''
  GROUP BY crew
)
INSERT INTO crews (id, name, genre, introduction, created_at, updated_at)
SELECT 
  gen_random_uuid()::text as id,
  crew as name,
  COALESCE(main_genre, 'Hip-hop') as genre,
  concat(crew, ' 크루입니다. ', member_count::text, '명의 멤버가 활동하고 있습니다.') as introduction,
  NOW() as created_at,
  NOW() as updated_at
FROM crew_stats
WHERE crew NOT IN (SELECT COALESCE(name, '') FROM crews)
ORDER BY member_count DESC;

-- 2. 결과 확인
SELECT 
  c.name as crew_name,
  c.genre,
  count(d.id) as actual_members,
  string_agg(d.nickname, ', ' ORDER BY d.rank LIMIT 5) as top_members
FROM crews c
LEFT JOIN dancers d ON d.crew = c.name
GROUP BY c.id, c.name, c.genre
ORDER BY actual_members DESC;

COMMIT; 