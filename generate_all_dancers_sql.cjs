const fs = require('fs');

// CSV 파일 읽기
const csvContent = fs.readFileSync('dancer.csv', 'utf-8');
const lines = csvContent.trim().split('\n').slice(1); // 헤더 제거

// 장르 매핑
const genreMapping = {
  'B-boy': 'B-boying',
  'B-girl': 'B-girl', 
  'Popping': 'Popping',
  'Locking': 'Locking',
  'Waacking': 'Waacking',
  'House': 'House',
  'Hiphop': 'Hip-hop',
  'Krump': 'Krump',
  'Choreography': 'Choreography'
};

let sql = `-- 모든 댄서 데이터 (${lines.length}명) - 크루 정보 포함
-- Supabase SQL Editor에서 실행하세요

-- 기존 댄서 데이터 삭제 (선택사항)
-- DELETE FROM dancers;

-- 댄서 테이블에 crew 컬럼 추가 (이미 있다면 무시됨)
ALTER TABLE dancers ADD COLUMN IF NOT EXISTS crew TEXT;

-- 댄서 데이터 삽입
`;

const batchSize = 50; // 배치 크기
let currentBatch = [];
let batchCount = 0;

lines.forEach((line, index) => {
  const parts = line.split(',');
  if (parts.length < 4) return;

  const nickname = parts[0]?.trim() || `댄서${index + 1}`;
  const name = parts[1]?.trim() || nickname;
  const crew = parts[2]?.trim() || null;
  const genre = parts[3]?.trim() || 'Hip-hop';
  const sns = parts[4]?.trim() || '';

  // 장르 매핑
  const mappedGenre = genreMapping[genre] || 'Hip-hop';
  
  // SQL 안전한 문자열로 변환
  const safeName = name.replace(/'/g, "''").replace(/"/g, '');
  const safeNickname = nickname.replace(/'/g, "''").replace(/"/g, '');
  const safeCrew = crew ? `'${crew.replace(/'/g, "''").replace(/"/g, '')}'` : 'NULL';
  const safeSns = sns.replace(/'/g, "''");
  
  // 포인트와 랭킹 계산 (상위권일수록 높은 점수)
  const points = Math.max(10, 1000 - index * 1.3);
  const rank = index + 1;
  
  const dancerData = `('d${index + 1}', '${safeNickname}', '${safeName}', ARRAY['${mappedGenre}'], '${safeSns}', ${Math.round(points)}, ${rank}, 'https://i.pravatar.cc/150?u=d${index + 1}', ${safeCrew})`;
  
  currentBatch.push(dancerData);
  
  // 배치가 가득 찼거나 마지막 항목인 경우
  if (currentBatch.length === batchSize || index === lines.length - 1) {
    batchCount++;
    sql += `\n-- 배치 ${batchCount} (${currentBatch.length}명)\n`;
    sql += `INSERT INTO dancers (id, nickname, name, genres, sns, total_points, rank, avatar, crew) VALUES\n`;
    sql += currentBatch.join(',\n');
    sql += '\nON CONFLICT (id) DO UPDATE SET\n';
    sql += '  nickname = EXCLUDED.nickname,\n';
    sql += '  name = EXCLUDED.name,\n';
    sql += '  genres = EXCLUDED.genres,\n';
    sql += '  sns = EXCLUDED.sns,\n';
    sql += '  total_points = EXCLUDED.total_points,\n';
    sql += '  rank = EXCLUDED.rank,\n';
    sql += '  avatar = EXCLUDED.avatar,\n';
    sql += '  crew = EXCLUDED.crew;\n';
    
    currentBatch = [];
  }
});

sql += `\nCOMMIT;
`;

// SQL 파일로 저장
fs.writeFileSync('update_dancers_with_crew.sql', sql);
console.log(`SQL 파일이 생성되었습니다: update_dancers_with_crew.sql`);
console.log(`총 ${lines.length}명의 댄서 데이터가 포함되었습니다.`); 