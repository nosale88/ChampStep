const fs = require('fs');

// CSV 데이터 (실제 데이터로 교체)
const csvData = `Zooty zoot,박민혁,"JINJO, BASEUS",B-boy,https://www.instagram.com/zootyseoul
Jin,진,Funkintheheart,Popping,https://www.instagram.com/jin_funkintheheart/
JEEM,짐,"빛고을댄서스, Masterpiece",Waacking,https://www.instagram.com/masterpiece_jeem/
Konan,김영진,Eeight,B-boy,https://www.instagram.com/kim.konan/
JEMIN,장제민,,Waacking,https://www.instagram.com/jeminofficial/
Madman,박우송,,B-boy,https://www.instagram.com/madman_park/
Brother bin,박형빈,Frenchfriez,Locking,https://www.instagram.com/brother_bin/
C.Know,강신호,wanna what,Waacking,https://www.instagram.com/c.know_k/
5000,신승훈,"빛고을댄서스, Mbitious",Hiphop,https://www.instagram.com/5000rpsn.kr/
B1,엄혜성,도봉구청 브레이킹 실업팀,B-boy,https://www.instagram.com/yuseonyeong8474
Rush,최동욱,Gamblerz crew,B-boy,https://www.instagram.com/bboyrush88
Melman,멜먼,Justevee,Popping,https://www.instagram.com/melman_justevee/
Madmoon,이문세,Platon crew,B-boy,https://www.instagram.com/bboymadmoon
Famous,유명훈,Oneway crew,B-boy,https://www.instagram.com/1way_famous
Mett,박정우,"variety balance, BasementBlocks",Popping,https://www.instagram.com/poppin_mett_vb/
Dandy,댄디,,Popping,https://www.instagram.com/dandy_hi_baby/
MARID,김혜인,빛고을댄서스,Waacking,https://www.instagram.com/marid____/
ONEBell,최원종,,,https://www.instagram.com/_.onebell._/
Edwardelric,김영일,Artistreet,B-boy,https://www.instagram.com/edwardelric01
Tutat,정성갑,MHY,Popping,https://www.instagram.com/kingtutat/`;

// 장르 매핑
const genreMapping = {
  'B-boy': 'B-boying',
  'B-girl': 'B-girl', 
  'Popping': 'Popping',
  'Locking': 'Locking',
  'Waacking': 'Waacking',
  'House': 'House',
  'Hiphop': 'Hip-hop',
  'Hip-hop': 'Hip-hop',
  'Krump': 'Krump',
  'Voguing': 'Voguing',
  'Choreography': 'Choreography'
};

function parseCSVToDancers(csvData, startId = 15) {
  const lines = csvData.trim().split('\n');
  const dancers = [];
  
  lines.forEach((line, index) => {
    // CSV 파싱 (간단한 버전)
    const parts = line.split(',');
    if (parts.length >= 4) {
      const nickname = parts[0].trim();
      const name = parts[1].trim();
      const crew = parts[2] ? parts[2].replace(/"/g, '').trim() : '';
      const genre = parts[3].trim();
      const sns = parts[4] ? parts[4].trim() : '';
      
      const mappedGenre = genreMapping[genre] || genre;
      const id = startId + index;
      const points = Math.max(1, 600 - (id - 15) * 5); // 점수 계산
      
      const dancer = {
        id: `d${id}`,
        nickname: nickname,
        name: name,
        genres: [mappedGenre],
        sns: sns,
        competitions: [],
        totalPoints: points,
        rank: id,
        avatar: `https://i.pravatar.cc/150?u=d${id}`,
        videos: [],
        crewIds: []
      };
      
      dancers.push(dancer);
    }
  });
  
  return dancers;
}

// TypeScript 객체 문자열 생성
function generateTypeScriptObjects(dancers) {
  return dancers.map(dancer => `  {
    id: '${dancer.id}',
    nickname: '${dancer.nickname}',
    name: '${dancer.name}',
    genres: ['${dancer.genres[0]}'],
    sns: '${dancer.sns}',
    competitions: [],
    totalPoints: ${dancer.totalPoints},
    rank: ${dancer.rank},
    avatar: '${dancer.avatar}',
    videos: [],
    crewIds: [],
  }`).join(',\n');
}

// 실행
const dancers = parseCSVToDancers(csvData);
const tsObjects = generateTypeScriptObjects(dancers);

console.log('Generated TypeScript objects:');
console.log(tsObjects);

// 파일로 저장
fs.writeFileSync('generated-dancers.ts', tsObjects);
console.log('\nSaved to generated-dancers.ts'); 