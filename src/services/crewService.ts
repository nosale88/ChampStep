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

// 다양한 댄스 장르 목록
const DANCE_GENRES = [
  'Hip-hop', 'Popping', 'Locking', 'Breaking', 'House', 
  'Krump', 'Waacking', 'Voguing', 'Jazz', 'Contemporary',
  'Choreography', 'All Style', 'Freestyle'
];

// 랜덤 장르 선택 함수
const getRandomGenre = (): string => {
  return DANCE_GENRES[Math.floor(Math.random() * DANCE_GENRES.length)];
};

export async function fetchCrews(): Promise<Crew[]> {
  try {
    console.log('🔍 Fetching crews from Supabase...')
    
    // 3초 타임아웃으로 줄여서 빠른 응답
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 10000)
    })
    
    // 크루 데이터만 먼저 가져오기 (속도 개선)
    const crewsPromise = supabase
      .from('crews')
      .select('*')
      .order('member_count', { ascending: false })
      .limit(30) // 상위 30개 크루만

    const { data: crewsData, error: crewsError } = await Promise.race([
      crewsPromise,
      timeoutPromise
    ]) as any

    if (crewsError) {
      console.error('❌ Error fetching crews from Supabase:', crewsError)
      
      // 타임아웃 시 즉시 목데이터 사용
      if (crewsError.message === 'Timeout') {
        console.log('⏰ Timeout - returning mock data')
        return mockCrews
      }
      
      // 다른 오류는 빠른 재시도 (1초 타임아웃)
      console.log('🔄 Quick retry...')
      const quickRetryPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Quick retry timeout')), 1000)
      })
      
      const retryPromise = supabase
        .from('crews')
        .select('*')
        .order('member_count', { ascending: false })
        .limit(15) // 재시도 시 더 적은 데이터
      
      const { data: retryData, error: retryError } = await Promise.race([retryPromise, quickRetryPromise])
      
      if (!retryError && retryData && retryData.length > 0) {
        console.log(`✅ Quick retry successful: ${retryData.length} crews`)
        
        // 재시도 시에도 댄서 매칭 시도
        const { data: retryDancersData } = await supabase
          .from('dancers')
          .select('*')
          .not('crew', 'is', null)
          .order('rank', { ascending: true })
          .limit(100) // 재시도시 제한적 데이터
        
        return retryData.map((crew: any) => {
          const matchingDancers = retryDancersData?.filter((dancer: any) => {
            if (!dancer.crew) return false
            return dancer.crew.toLowerCase().trim() === crew.name.toLowerCase().trim() ||
                   calculateSimilarity(dancer.crew, crew.name) >= 0.8
          }) || []
          
          return {
            id: crew.id,
            name: crew.name,
            genre: getRandomGenre(),
            introduction: crew.description || `${crew.name} 크루입니다.`,
            members: matchingDancers.map((dancer: any) => ({
              id: dancer.id,
              nickname: dancer.nickname,
              name: dancer.name,
              crew: dancer.crew,
              genres: dancer.genres || ['Hip-hop'],
              rank: dancer.rank,
              totalPoints: dancer.total_points || 0,
              profileImage: dancer.profile_image,
              competitions: [],
              awards: [],
              videos: [],
              createdAt: dancer.created_at
            })),
            schedules: [],
            backgroundImage: undefined,
            createdAt: crew.created_at,
            member_count: matchingDancers.length
          }
        })
      }
      
      // 재시도도 실패하면 목 데이터 반환
      console.log('⚠️ Returning mock data after quick retry failed')
      return mockCrews
    }

    if (!crewsData || crewsData.length === 0) {
      console.log('⚠️ No crews found in Supabase, returning mock data')
      return mockCrews
    }

    console.log(`✅ Successfully fetched ${crewsData.length} crews from Supabase`)
    
    // 댄서 데이터도 함께 가져와서 크루별로 매칭
    console.log('🔄 Fetching dancers for crew matching...')
    const { data: dancersData } = await supabase
      .from('dancers')
      .select('*')
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
        
        // 유사도 기반 매칭 (0.8 이상)
        const similarity = calculateSimilarity(dancer.crew, crew.name)
        return similarity >= 0.8
      }) || []
      
      return {
        id: crew.id,
        name: crew.name,
        genre: getRandomGenre(),
        introduction: crew.description || `${crew.name} 크루입니다.`,
        members: matchingDancers.map((dancer: any) => ({
          id: dancer.id,
          nickname: dancer.nickname,
          name: dancer.name,
          crew: dancer.crew,
          genres: dancer.genres || ['Hip-hop'],
          rank: dancer.rank,
          totalPoints: dancer.total_points || 0,
          profileImage: dancer.profile_image,
          competitions: [],
          awards: [],
          videos: [],
          createdAt: dancer.created_at
        })),
        schedules: [],
        backgroundImage: undefined,
        createdAt: crew.created_at,
        member_count: matchingDancers.length // 실제 매칭된 댄서 수
      }
    })

    return crewsWithMembers

  } catch (error) {
    console.error('❌ Critical error in fetchCrews:', error)
    console.log('⚠️ Returning mock data as fallback')
    return mockCrews
  }
}

export async function fetchCrewById(id: string): Promise<Crew | null> {
  const crews = await fetchCrews()
  return crews.find(crew => crew.id === id) || null
}

export async function createCrew(crewData: {
  name: string;
  description: string;
  founded_year: number;
  location: string;
  member_count: number;
}): Promise<Crew | null> {
  try {
    console.log('🔄 새 크루 생성 중:', crewData.name)
    
    const { data, error } = await supabase
      .from('crews')
      .insert({
        name: crewData.name,
        description: crewData.description,
        founded_year: crewData.founded_year,
        location: crewData.location,
        member_count: crewData.member_count
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating crew:', error)
      throw error
    }

    console.log('✅ 크루 생성 성공:', data.name)
    
    return {
      id: data.id,
      name: data.name,
      genre: getRandomGenre(), // 랜덤 장르
      introduction: data.description || `${data.name} 크루입니다.`,
      members: [],
      schedules: [],
      backgroundImage: undefined,
      createdAt: data.created_at
    }
  } catch (error) {
    console.error('❌ Error in createCrew:', error)
    return null
  }
}

export async function addScheduleToCrew(crewId: string, schedule: Omit<CrewSchedule, 'id' | 'createdAt'>): Promise<CrewSchedule | null> {
  try {
    console.log('🔄 Adding schedule to crew:', crewId, schedule);
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('❌ User not authenticated');
      throw new Error('Not authenticated');
    }

    // 크루 이름 가져오기
    const { data: crewData } = await supabase
      .from('crews')
      .select('name')
      .eq('id', crewId)
      .single();

    if (!crewData) {
      console.error('❌ Crew not found');
      throw new Error('Crew not found');
    }

    console.log('✅ Found crew:', crewData.name);

    // 실제 테이블 구조에 맞게 데이터 삽입
    const { data, error } = await supabase
      .from('crew_schedules')
      .insert({
        crew_name: crewData.name,  // crew_id 대신 crew_name 사용
        title: schedule.title,
        description: schedule.description,
        date: schedule.date,
        start_time: schedule.time,  // time 대신 start_time 사용
        location: schedule.location,
        // type과 is_public 필드는 실제 테이블에 없을 수 있으므로 제거
        // type: schedule.type,
        // is_public: schedule.isPublic,
        // created_by: userData.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error inserting schedule:', error);
      throw error;
    }

    console.log('✅ Schedule added successfully:', data);

    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      date: data.date,
      time: data.start_time,
      location: data.location || '',
      type: 'practice', // 기본값
      isPublic: true,   // 기본값
      createdBy: userData.user.id,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('❌ Error adding schedule:', error);
    return null;
  }
}

export async function getCrewSchedules(crewId: string): Promise<CrewSchedule[]> {
  try {
    console.log('🔍 Fetching schedules for crew:', crewId);
    
    // 크루 이름 가져오기
    const { data: crewData } = await supabase
      .from('crews')
      .select('name')
      .eq('id', crewId)
      .single();

    if (!crewData) {
      console.error('❌ Crew not found');
      return [];
    }

    console.log('✅ Found crew for schedule fetch:', crewData.name);

    const { data, error } = await supabase
      .from('crew_schedules')
      .select('*')
      .eq('crew_name', crewData.name)  // crew_id 대신 crew_name 사용
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });  // time 대신 start_time 사용

    if (error) {
      console.error('❌ Error fetching schedules:', error);
      throw error;
    }

    console.log(`✅ Found ${data?.length || 0} schedules for ${crewData.name}`);

    return (data || []).map(schedule => ({
      id: schedule.id,
      title: schedule.title,
      description: schedule.description || '',
      date: schedule.date,
      time: schedule.start_time,
      location: schedule.location || '',
      type: 'practice', // 기본값 (실제 테이블에 type 컬럼이 없을 수 있음)
      isPublic: true,   // 기본값 (실제 테이블에 is_public 컬럼이 없을 수 있음)
      createdBy: 'system', // 기본값 (실제 테이블에 created_by 컬럼이 없을 수 있음)
      createdAt: schedule.created_at
    }));
  } catch (error) {
    console.error('❌ Error fetching schedules:', error);
    return [];
  }
}

export async function updateSchedule(scheduleId: string, updates: Partial<CrewSchedule>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('crew_schedules')
      .update({
        title: updates.title,
        description: updates.description,
        date: updates.date,
        time: updates.time,
        location: updates.location,
        type: updates.type,
        is_public: updates.isPublic
      })
      .eq('id', scheduleId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating schedule:', error);
    return false;
  }
}

export async function deleteSchedule(scheduleId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('crew_schedules')
      .delete()
      .eq('id', scheduleId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return false;
  }
}

// 크루 검색 (프로필 연동용)
export async function searchCrews(query: string, limit: number = 50): Promise<Crew[]> {
  try {
    const { data, error } = await supabase
      .from('crews')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('member_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(crew => ({
      id: crew.id,
      name: crew.name,
      genre: crew.genre || 'Hip-hop',
      introduction: crew.description || `${crew.name} 크루입니다.`,
      members: [],
      schedules: [],
      backgroundImage: crew.background_image,
      createdAt: crew.created_at,
      member_count: crew.member_count || 0
    }));
  } catch (error) {
    console.error('Error searching crews:', error);
    // 오류 시 빈 배열 반환
    return [];
  }
} 