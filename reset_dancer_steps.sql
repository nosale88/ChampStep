-- 모든 댄서의 스텝 관련 필드를 0으로 초기화
UPDATE dancers 
SET 
  total_points = 0,
  rank = 999
WHERE id IS NOT NULL;

-- 확인용 쿼리 (실행 후 결과 확인)
SELECT 
  id,
  nickname,
  name,
  total_points,
  rank,
  crew
FROM dancers 
ORDER BY nickname
LIMIT 10;

-- 전체 댄서 수와 초기화된 댄서 수 확인
SELECT 
  COUNT(*) as total_dancers,
  COUNT(CASE WHEN total_points = 0 THEN 1 END) as reset_dancers,
  COUNT(CASE WHEN rank = 999 THEN 1 END) as reset_ranks
FROM dancers;
