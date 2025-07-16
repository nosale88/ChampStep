import { supabase } from '../lib/supabase'
import { Crew, CrewSchedule } from '../types'
import { mockCrews } from '../data/mockData'

// 문자열 유사도 계산 함수 (레벤슈타인 거리 기반)
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()
  
  if (s1 === s2) return 1.0
  
  const maxLen = Math.max(s1.length, s2.length)
  if (maxLen === 0) return 1.0
  
  return (maxLen - levenshteinDistance(s1, s2)) / maxLen
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

// 댄스 장르 목록
const DANCE_GENRES = [
  'Hip-hop', 'Breaking', 'Popping', 'Locking', 'Waacking', 'House', 
  'Krump', 'Choreography', 'Contemporary', 'Jazz', 'Ballet', 'Commercial'
];

// 랜덤 장르 선택
const getRandomGenre = (): string => {
  return DANCE_GENRES[Math.floor(Math.random() * DANCE_GENRES.length)];
};

export async function fetchCrews(): Promise<Crew[]> {
  try {
    console.log('🔍 Fetching crews from Supabase...')
    
    // Supabase 연결 시도 (타임아웃 10초)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 10000)
    );
    
    // 크루 데이터 가져오기
    const supabasePromise = supabase
      .from('crews')
      .select('*')
      .order('member_count', { ascending: false });

    const { data: crewsData, error: crewsError } = await Promise.race([supabasePromise, timeoutPromise]) as any;

    if (crewsError) {
      console.error('❌ Error fetching crews from Supabase:', crewsError)
      console.error('Error details:', JSON.stringify(crewsError, null, 2))
      console.log('🔄 Falling back to mock crews...')
      return mockCrews;
    }

    if (!crewsData || crewsData.length === 0) {
      console.log('⚠️ No crews found in Supabase, using mock data')
      return mockCrews;
    }

    console.log(`✅ Successfully fetched ${crewsData.length} crews from Supabase`)
    
    // 댄서 데이터도 함께 가져와서 크루별로 매칭
    console.log('🔄 Fetching dancers for crew matching...')
    const { data: dancersData } = await supabase
      .from('dancers')
      .select('id, nickname, name, crew, genres, rank, total_points, avatar')
      .not('crew', 'is', null)
      .order('rank', { ascending: true })
    
    console.log(`✅ Fetched ${dancersData?.length || 0} dancers for matching`)
    
    // 크루별로 댄서 매칭
    const crewsWithMembers = crewsData.map((crew: any) => {
      // 크루 이름과 댄서의 크루 필드를 매칭
      const matchingDancers = dancersData?.filter((dancer: any) => {
        if (!dancer.crew) return false
        
        // 정확한 매칭 우선
        if (dancer.crew.toLowerCase().trim() === crew.name.toLowerCase().trim()) {
          return true
        }
        
        // 유사도 매칭 (80% 이상)
        return calculateSimilarity(dancer.crew, crew.name) >= 0.8
      }) || []
      
      return {
        id: crew.id,
        name: crew.name,
        genre: getRandomGenre(), // 장르는 랜덤으로 할당
        introduction: crew.description || `${crew.name} 크루입니다.`,
        members: matchingDancers.map((dancer: any) => ({
          id: dancer.id,
          nickname: dancer.nickname,
          name: dancer.name,
          crew: dancer.crew,
          genres: dancer.genres || ['Hip-hop'],
          rank: dancer.rank,
          totalPoints: dancer.total_points || 0,
          avatar: dancer.avatar,
          competitions: [],
          videos: []
        })),
        schedules: [],
        createdAt: crew.created_at || new Date().toISOString(),
        member_count: matchingDancers.length || crew.member_count || 0
      }
    })

    return crewsWithMembers

  } catch (error) {
    console.error('❌ Critical error in fetchCrews:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.log('🔄 Using mock crews as fallback...')
    return mockCrews;
  }
}

export async function fetchCrewById(id: string): Promise<Crew | null> {
  try {
    const { data, error } = await supabase
      .from('crews')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      console.error('Error fetching crew by id:', error)
      return null
    }

    // 해당 크루의 댄서들 가져오기
    const { data: dancersData } = await supabase
      .from('dancers')
      .select('*')
      .eq('crew', data.name)

    return {
      id: data.id,
      name: data.name,
      genre: getRandomGenre(),
      introduction: data.description || `${data.name} 크루입니다.`,
      members: dancersData?.map((dancer: any) => ({
        id: dancer.id,
        nickname: dancer.nickname,
        name: dancer.name,
        crew: dancer.crew,
        genres: dancer.genres || ['Hip-hop'],
        rank: dancer.rank,
        totalPoints: dancer.total_points || 0,
        avatar: dancer.avatar,
        competitions: [],
        videos: []
      })) || [],
      schedules: [],
      createdAt: data.created_at,
      member_count: data.member_count || 0
    }
  } catch (error) {
    console.error('Error in fetchCrewById:', error)
    return null
  }
}

export async function fetchCrewByName(name: string): Promise<Crew | null> {
  try {
    const { data, error } = await supabase
      .from('crews')
      .select('*')
      .eq('name', name)
      .single()

    if (error || !data) {
      console.error('Error fetching crew by name:', error)
      return null
    }

    // 해당 크루의 댄서들 가져오기
    const { data: dancersData } = await supabase
      .from('dancers')
      .select('*')
      .eq('crew', name)

    return {
      id: data.id,
      name: data.name,
      genre: getRandomGenre(),
      introduction: data.description || `${data.name} 크루입니다.`,
      members: dancersData?.map((dancer: any) => ({
        id: dancer.id,
        nickname: dancer.nickname,
        name: dancer.name,
        crew: dancer.crew,
        genres: dancer.genres || ['Hip-hop'],
        rank: dancer.rank,
        totalPoints: dancer.total_points || 0,
        avatar: dancer.avatar,
        competitions: [],
        videos: []
      })) || [],
      schedules: [],
      createdAt: data.created_at,
      member_count: data.member_count || 0
    }
  } catch (error) {
    console.error('Error in fetchCrewByName:', error)
    return null
  }
}

export async function searchCrews(query: string, limit: number = 50): Promise<Crew[]> {
  try {
    const { data, error } = await supabase
      .from('crews')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('member_count', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (data || []).map(crew => ({
      id: crew.id,
      name: crew.name,
      genre: getRandomGenre(),
      introduction: crew.description || `${crew.name} 크루입니다.`,
      members: [],
      schedules: [],
      createdAt: crew.created_at,
      member_count: crew.member_count || 0
    }))
  } catch (error) {
    console.error('Error searching crews:', error)
    return []
  }
}

export async function addCrewSchedule(schedule: Omit<CrewSchedule, 'id' | 'createdAt'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('crew_schedules')
      .insert({
        crew_name: schedule.title, // 임시 매핑
        title: schedule.title,
        description: schedule.description,
        date: schedule.date,
        start_time: schedule.time,
        location: schedule.location,
        type: schedule.type,
        is_public: schedule.isPublic,
        created_by: schedule.createdBy
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error adding crew schedule:', error)
    return false
  }
}

export async function fetchCrewSchedules(crewName: string): Promise<CrewSchedule[]> {
  try {
    const { data, error } = await supabase
      .from('crew_schedules')
      .select('*')
      .eq('crew_name', crewName)
      .order('date', { ascending: true })

    if (error) throw error

    return (data || []).map(schedule => ({
      id: schedule.id,
      title: schedule.title,
      description: schedule.description,
      date: schedule.date,
      time: schedule.start_time,
      location: schedule.location,
      type: schedule.type,
      isPublic: schedule.is_public,
      createdBy: schedule.created_by,
      createdAt: schedule.created_at
    }))
  } catch (error) {
    console.error('Error fetching crew schedules:', error)
    return []
  }
}

export async function createCrew(crew: Omit<Crew, 'id' | 'createdAt' | 'members' | 'schedules'>): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('crews')
      .insert({
        name: crew.name,
        description: crew.introduction,
        member_count: crew.member_count || 0
      })
      .select()
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Error creating crew:', error)
    return null
  }
}