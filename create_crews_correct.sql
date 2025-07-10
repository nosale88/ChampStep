-- 실제 crews 테이블 구조에 맞춰 크루 데이터 생성
-- Supabase SQL Editor에서 실행하세요

-- 1. 댄서 데이터에서 고유한 크루명들과 통계 정보 추출하여 crews 테이블에 삽입
INSERT INTO crews (id, name, description, founded_year, location, member_count, created_at)
SELECT 
  gen_random_uuid()::text as id,
  crew as name,
  concat(crew, ' 크루입니다. ', count(*)::text, '명의 멤버가 활동하고 있습니다.') as description,
  2020 as founded_year,  -- 기본값 (나중에 수정 가능)
  '서울' as location,    -- 기본값 (나중에 수정 가능)
  count(*)::integer as member_count,
  NOW() as created_at
FROM dancers
WHERE crew IS NOT NULL 
  AND crew != ''
  AND crew NOT IN (SELECT COALESCE(name, '') FROM crews)
GROUP BY crew
ORDER BY count(*) DESC;

-- 2. 생성된 크루 정보 확인
SELECT 
  c.name as crew_name,
  c.description,
  c.member_count,
  c.founded_year,
  c.location,
  count(d.id) as actual_member_count
FROM crews c
LEFT JOIN dancers d ON d.crew = c.name
GROUP BY c.id, c.name, c.description, c.member_count, c.founded_year, c.location
ORDER BY c.member_count DESC;

-- 3. 상위 크루들의 멤버 목록 (상위 10개 크루)
WITH top_crews AS (
  SELECT name, member_count
  FROM crews
  ORDER BY member_count DESC
  LIMIT 10
)
SELECT 
  c.name as crew_name,
  c.member_count,
  string_agg(d.nickname, ', ' ORDER BY d.rank) as members
FROM top_crews c
LEFT JOIN dancers d ON d.crew = c.name
GROUP BY c.name, c.member_count
ORDER BY c.member_count DESC;

-- 4. 주요 크루들의 정보 업데이트 (선택사항)
UPDATE crews SET 
  description = 'JINJO 크루입니다. 한국을 대표하는 B-boy 크루 중 하나입니다.',
  founded_year = 2001,
  location = '서울'
WHERE name = 'JINJO';

UPDATE crews SET 
  description = 'Gamblerz crew 크루입니다. 실력있는 B-boy들이 모인 크루입니다.',
  founded_year = 2005,
  location = '서울'
WHERE name = 'Gamblerz crew';

UPDATE crews SET 
  description = '빛고을댄서스 크루입니다. 광주를 기반으로 활동하는 댄스 크루입니다.',
  founded_year = 2010,
  location = '광주'
WHERE name = '빛고을댄서스';

-- 5. 최종 결과 확인
SELECT 
  name,
  description,
  member_count,
  founded_year,
  location,
  created_at
FROM crews
ORDER BY member_count DESC
LIMIT 20; 