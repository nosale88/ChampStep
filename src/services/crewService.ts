import { supabase } from '../lib/supabase'
import { Crew, Dancer, CrewSchedule } from '../types'
import { crews } from '../data/mockData'

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

export async function fetchCrews(): Promise<Crew[]> {
  try {
    console.log('🔍 Fetching crews from Supabase...')
    
    // 배포 환경에서는 10초 타임아웃 (더 긴 시간 필요)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 10000)
    })
    
    // 크루 데이터와 댄서 데이터를 병렬로 가져오기
    const crewsPromise = supabase
      .from('crews')
      .select('*')
      .order('member_count', { ascending: false })

    const dancersPromise = supabase
      .from('dancers')
      .select('*')
      .not('crew', 'is', null)
      .order('rank', { ascending: true })

    const [crewsResult, dancersResult] = await Promise.race([
      Promise.all([crewsPromise, dancersPromise]),
      timeoutPromise
    ]) as any

    const { data: crewsData, error: crewsError } = crewsResult
    const { data: dancersData, error: dancersError } = dancersResult

    if (crewsError) {
      console.error('❌ Error fetching crews from Supabase:', crewsError)
      
      // 네트워크 오류가 아닌 경우 재시도
      if (crewsError.message !== 'Timeout' && !crewsError.message.includes('fetch')) {
        console.log('🔄 Retrying crew fetch...')
        const { data: retryData, error: retryError } = await supabase
          .from('crews')
          .select('*')
          .order('member_count', { ascending: false })
        
        if (!retryError && retryData && retryData.length > 0) {
          console.log(`✅ Retry successful: ${retryData.length} crews`)
          // 재시도 성공 시 댄서 데이터 없이라도 크루 데이터 반환
          return retryData.map(crew => ({
            id: crew.id,
            name: crew.name,
            genre: 'Hip-hop', // 기본값
            introduction: crew.description || `${crew.name} 크루입니다.`,
            members: [], // 댄서 데이터 없이
            schedules: [],
            backgroundImage: undefined,
            createdAt: crew.created_at,
            member_count: crew.member_count
          }))
        }
      }
      
      // 타임아웃이나 네트워크 오류 시 목데이터 사용
      console.log('⚠️ Using mock data due to network issues')
      return crews
    }

    if (dancersError) {
      console.error('❌ Error fetching dancers from Supabase:', dancersError)
      // 댄서 데이터 오류는 치명적이지 않으므로 빈 배열로 처리
    }

    if (!crewsData || crewsData.length === 0) {
      console.log('⚠️ No crews found in Supabase, using mock data')
      return crews
    }

    console.log(`✅ Successfully fetched ${crewsData.length} crews from Supabase`)
    
    // 댄서 데이터로 크루별 멤버 매칭
    const dancersByCrewName = new Map<string, Dancer[]>()
    
    if (dancersData && dancersData.length > 0) {
      console.log(`✅ Successfully fetched ${dancersData.length} dancers for crew matching`)
      
      dancersData.forEach((dancer: any) => {
        if (dancer.crew) {
          const crewName = dancer.crew.trim()
          if (!dancersByCrewName.has(crewName)) {
            dancersByCrewName.set(crewName, [])
          }
          
          dancersByCrewName.get(crewName)!.push({
            id: dancer.id,
            nickname: dancer.nickname,
            name: dancer.name,
            crew: dancer.crew,
            genres: dancer.genres || [],
            sns: dancer.sns || '',
            totalPoints: dancer.total_points || 0,
            rank: dancer.rank || 999,
            avatar: dancer.avatar || `https://i.pravatar.cc/150?u=${dancer.id}`,
            profileImage: dancer.profile_image,
            backgroundImage: dancer.background_image,
            bio: dancer.bio,
            birthDate: dancer.birth_date,
            phone: dancer.phone,
            email: dancer.email,
            instagramUrl: dancer.instagram_url,
            youtubeUrl: dancer.youtube_url,
            twitterUrl: dancer.twitter_url,
            competitions: [],
            videos: []
          })
        }
      })
    }

    return crewsData.map((crew: any) => {
      // 크루 이름과 일치하는 댄서들 찾기
      const exactMatches = dancersByCrewName.get(crew.name) || []
      
      // 유사한 이름의 크루도 찾기 (오타나 변형 고려)
      const similarMatches: Dancer[] = []
      if (exactMatches.length === 0) {
        for (const [crewName, dancers] of dancersByCrewName.entries()) {
          if (calculateSimilarity(crew.name, crewName) > 0.8) {
            similarMatches.push(...dancers)
          }
        }
      }
      
      const matchedDancers = exactMatches.length > 0 ? exactMatches : similarMatches
      
      // 실제 멤버 수 업데이트
      const actualMemberCount = matchedDancers.length
      
      if (actualMemberCount > 0) {
        console.log(`✅ Matched ${actualMemberCount} dancers to crew: ${crew.name}`)
      }

      return {
        id: crew.id,
        name: crew.name,
        genre: 'Hip-hop', // 기본값 (crews 테이블에 genre 컬럼이 없으므로)
        introduction: crew.description || `${crew.name} 크루입니다.`,
        members: matchedDancers,
        schedules: [], // 스케줄은 별도로 불러오기
        backgroundImage: undefined,
        createdAt: crew.created_at,
        member_count: actualMemberCount || crew.member_count
      }
    })

  } catch (error) {
    console.error('❌ Critical error in fetchCrews:', error)
    console.log('⚠️ Using mock data as fallback')
    return crews
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
      genre: 'Hip-hop', // 기본값
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