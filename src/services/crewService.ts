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
    console.log('🔍 Supabase에서 크루 데이터 가져오는 중...')
    
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

    const [crewsResult, dancersResult] = await Promise.all([crewsPromise, dancersPromise])

    const { data: crewsData, error: crewsError } = crewsResult
    const { data: dancersData, error: dancersError } = dancersResult

    if (crewsError) {
      console.error('❌ Error fetching crews from Supabase:', crewsError)
      throw crewsError
    }

    if (dancersError) {
      console.error('❌ Error fetching dancers from Supabase:', dancersError)
      // 댄서 데이터 오류는 치명적이지 않으므로 빈 배열로 처리
    }

    if (!crewsData || crewsData.length === 0) {
      console.log('⚠️ Supabase에서 크루 데이터를 찾을 수 없습니다')
      return []
    }

    console.log(`✅ Supabase에서 ${crewsData.length}개의 크루 데이터를 가져왔습니다`)
    
    // 댄서 데이터를 크루별로 그룹화 (원본 크루명 유지)
    const dancersByCrewName = (dancersData || []).reduce((acc, dancer) => {
      if (dancer.crew) {
        const crewName = dancer.crew.trim()
        
        if (!acc[crewName]) {
          acc[crewName] = []
        }
        acc[crewName].push({
          id: dancer.id,
          nickname: dancer.nickname,
          rank: dancer.rank,
          totalPoints: dancer.total_points || 0,
          genres: dancer.genres || [],
          profileImage: dancer.profile_image,
          crew: dancer.crew,
          bio: dancer.bio || '',
          achievements: dancer.achievements || [],
          socialLinks: dancer.social_links || {},
          createdAt: dancer.created_at
        })
      }
      return acc
    }, {} as Record<string, Dancer[]>)

    // 디버깅: 댄서 데이터 확인
    console.log('🔍 댄서별 크루 정보:')
    Object.keys(dancersByCrewName).forEach(crewName => {
      console.log(`  ${crewName}: ${dancersByCrewName[crewName].length}명`)
    })

    return crewsData.map(crew => {
      // 정확한 매칭 시도
      let matchedDancers = dancersByCrewName[crew.name] || []
      
      // 정확한 매칭이 안 되면 유사도 기반 매칭 시도
      if (matchedDancers.length === 0) {
        const dancerCrewNames = Object.keys(dancersByCrewName)
        let bestMatch = ''
        let bestSimilarity = 0
        
        for (const dancerCrewName of dancerCrewNames) {
          const similarity = calculateSimilarity(crew.name, dancerCrewName)
          if (similarity > bestSimilarity && similarity > 0.7) { // 70% 이상 유사도
            bestSimilarity = similarity
            bestMatch = dancerCrewName
          }
        }
        
        if (bestMatch) {
          matchedDancers = dancersByCrewName[bestMatch]
          console.log(`🔄 ${crew.name} -> ${bestMatch} (유사도: ${(bestSimilarity * 100).toFixed(1)}%)`)
        }
      }
      
      // Rivers Crew 특별 디버깅
      if (crew.name.toLowerCase().includes('rivers')) {
        console.log(`🔍 ${crew.name} 디버깅:`)
        console.log(`  - DB에서 member_count: ${crew.member_count}`)
        console.log(`  - 실제 매칭된 댄서 수: ${matchedDancers.length}`)
        console.log(`  - 매칭된 댄서들:`, matchedDancers.map((d: Dancer) => d.nickname))
        
        // 가능한 매칭 후보들 확인
        const possibleMatches = Object.keys(dancersByCrewName).filter(name => 
          name.toLowerCase().includes('rivers') || name.toLowerCase().includes('river')
        )
        console.log(`  - 가능한 매칭 후보들:`, possibleMatches)
      }

      return {
        id: crew.id,
        name: crew.name,
        genre: 'Hip-hop', // 기본값 (crews 테이블에 genre 컬럼이 없으므로)
        introduction: crew.description || `${crew.name} 크루입니다.`,
        members: matchedDancers,
        schedules: [], // 스케줄은 별도로 불러오기
        backgroundImage: undefined,
        createdAt: crew.created_at
      }
    })

  } catch (error) {
    console.error('❌ Error in fetchCrews:', error)
    // 실제 데이터베이스 오류 시에만 목데이터 사용
    console.log('⚠️ 데이터베이스 오류로 인해 목데이터 사용')
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
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('crew_schedules')
      .insert({
        crew_id: crewId,
        title: schedule.title,
        description: schedule.description,
        date: schedule.date,
        time: schedule.time,
        location: schedule.location,
        type: schedule.type,
        is_public: schedule.isPublic,
        created_by: userData.user.id
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      date: data.date,
      time: data.time,
      location: data.location,
      type: data.type,
      isPublic: data.is_public,
      createdBy: data.created_by,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error adding schedule:', error);
    return null;
  }
}

export async function getCrewSchedules(crewId: string): Promise<CrewSchedule[]> {
  try {
    const { data, error } = await supabase
      .from('crew_schedules')
      .select('*')
      .eq('crew_id', crewId)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) throw error;

    return (data || []).map(schedule => ({
      id: schedule.id,
      title: schedule.title,
      description: schedule.description,
      date: schedule.date,
      time: schedule.time,
      location: schedule.location,
      type: schedule.type,
      isPublic: schedule.is_public,
      createdBy: schedule.created_by,
      createdAt: schedule.created_at
    }));
  } catch (error) {
    console.error('Error fetching schedules:', error);
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