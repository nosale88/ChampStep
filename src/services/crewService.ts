import { supabase } from '../lib/supabase'
import { Crew, Dancer, CrewSchedule } from '../types'

export async function fetchCrews(): Promise<Crew[]> {
  // 댄서 테이블에서 크루 정보 가져오기
  const { data: dancersData, error } = await supabase
    .from('dancers')
    .select('*')
    .order('nickname', { ascending: true })

  if (error) {
    console.error('Error fetching dancers for crews:', error)
    return []
  }

  // 크루별로 댄서들을 그룹핑
  const crewMap = new Map<string, Dancer[]>()
  
  dancersData.forEach(dancer => {
    if (dancer.crew) {
      const crewName = dancer.crew.trim()
      if (!crewMap.has(crewName)) {
        crewMap.set(crewName, [])
      }
      
      const dancerObj: Dancer = {
        id: dancer.id,
        nickname: dancer.nickname,
        name: dancer.name,
        crew: dancer.crew,
        genres: dancer.genres,
        sns: dancer.sns || '',
        totalPoints: dancer.total_points,
        rank: dancer.rank,
        avatar: dancer.avatar || `https://i.pravatar.cc/150?u=${dancer.id}`,
        competitions: [],
        videos: []
      }
      
      crewMap.get(crewName)!.push(dancerObj)
    }
  })

  // 크루 객체들 생성
  const crews: Crew[] = Array.from(crewMap.entries()).map(([crewName, members], index) => {
    // 크루의 주요 장르를 멤버들의 장르에서 추출
    const genreCount = new Map<string, number>()
    members.forEach(member => {
      member.genres.forEach(genre => {
        genreCount.set(genre, (genreCount.get(genre) || 0) + 1)
      })
    })
    
    const mainGenre = Array.from(genreCount.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'All'

    return {
      id: `crew_${index + 1}`,
      name: crewName,
      genre: mainGenre,
      introduction: `${crewName}은 ${mainGenre} 장르를 중심으로 활동하는 크루입니다. 현재 ${members.length}명의 멤버가 활동하고 있습니다.`,
      members: members.sort((a, b) => a.rank - b.rank), // 랭킹 순으로 정렬
      schedules: [], // 빈 스케줄로 시작
      avatar: `https://i.pravatar.cc/150?u=${crewName}`,
      createdAt: new Date().toISOString()
    }
  })

  return crews.sort((a, b) => a.name.localeCompare(b.name))
}

export async function fetchCrewById(id: string): Promise<Crew | null> {
  const crews = await fetchCrews()
  return crews.find(crew => crew.id === id) || null
}

export async function addScheduleToCrew(crewId: string, schedule: Omit<CrewSchedule, 'id' | 'createdAt'>): Promise<CrewSchedule> {
  // 실제 구현에서는 별도의 스케줄 테이블에 저장할 예정
  // 현재는 메모리에서만 관리
  const newSchedule: CrewSchedule = {
    ...schedule,
    id: `schedule_${Date.now()}`,
    createdAt: new Date().toISOString()
  }
  
  return newSchedule
}

export async function getCrewSchedules(crewId: string): Promise<CrewSchedule[]> {
  // 실제 구현에서는 데이터베이스에서 가져올 예정
  // 현재는 빈 배열 반환
  return []
} 