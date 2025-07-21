import { supabase } from '../lib/supabase'
import { Crew, CrewSchedule } from '../types'

export async function fetchCrews(): Promise<Crew[]> {
  try {
    console.log('🔄 Fetching crews from Supabase...')
    
    const { data: crewsData, error } = await supabase
      .from('crews')
      .select(`
        id,
        name,
        description,
        location,
        member_count,
        founded_year,
        created_at
      `)
      .order('name', { ascending: true })
    
    console.log('📊 Crews query result:', {
      dataLength: crewsData?.length,
      error: error,
      errorCode: error?.code,
      errorMessage: error?.message
    });
    
    if (error) {
      console.error('❌ Error fetching crews from Supabase:', error)
      return []
    }
    
    if (!crewsData || crewsData.length === 0) {
      console.log('⚠️ No crews data found in Supabase')
      return []
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
      const members = (dancersData || []).filter(dancer => 
        dancer.crew && dancer.crew.toLowerCase() === crew.name.toLowerCase()
      ).map(dancer => ({
        id: dancer.id,
        nickname: dancer.nickname,
        name: dancer.name,
        crew: dancer.crew,
        genres: dancer.genres || [],
        rank: dancer.rank || 999,
        totalPoints: dancer.total_points || 0,
        avatar: dancer.avatar
      }))
      
      return {
        id: crew.id,
        name: crew.name,
        description: crew.description || '',
        genres: [], // 빈 배열로 초기화 (테이블에 없음)
        location: crew.location || '',
        memberCount: members.length, // 실제 멤버 수로 업데이트
        establishedYear: crew.founded_year || new Date().getFullYear(),
        achievements: [], // 빈 배열로 초기화 (테이블에 없음)
        instagramUrl: '', // 빈 문자열로 초기화 (테이블에 없음)
        youtubeUrl: '', // 빈 문자열로 초기화 (테이블에 없음)
        twitterUrl: '', // 빈 문자열로 초기화 (테이블에 없음)
        backgroundImage: '', // 빈 문자열로 초기화 (테이블에 없음)
        createdAt: crew.created_at || new Date().toISOString(),
        members, // 실제 멤버 배열
        schedules: [], // 빈 배열로 초기화
        genre: 'Dance' // 기본값
      }
    })
    
    return crewsWithMembers
    
  } catch (error) {
    console.error('❌ Error in fetchCrews:', error)
    return []
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

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      genres: [],
      location: data.location || '',
      memberCount: data.member_count || 0,
      establishedYear: data.founded_year || new Date().getFullYear(),
      achievements: [],
      instagramUrl: '',
      youtubeUrl: '',
      twitterUrl: '',
      backgroundImage: '',
      createdAt: data.created_at,
      members: [],
      schedules: [],
      genre: 'Dance'
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

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      genres: [],
      location: data.location || '',
      memberCount: data.member_count || 0,
      establishedYear: data.founded_year || new Date().getFullYear(),
      achievements: [],
      instagramUrl: '',
      youtubeUrl: '',
      twitterUrl: '',
      backgroundImage: '',
      createdAt: data.created_at,
      members: [],
      schedules: [],
      genre: 'Dance'
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
      .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
      .order('name', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error searching crews:', error)
      return []
    }

    return (data || []).map(crew => ({
      id: crew.id,
      name: crew.name,
      description: crew.description,
      genres: crew.genres,
      location: crew.location,
      memberCount: crew.member_count,
      establishedYear: crew.established_year,
      achievements: crew.achievements,
      instagramUrl: crew.instagram_url,
      youtubeUrl: crew.youtube_url,
      twitterUrl: crew.twitter_url,
      backgroundImage: crew.background_image,
      createdAt: crew.created_at,
      members: [],
      schedules: [],
      genre: Array.isArray(crew.genres) ? crew.genres[0] || 'Unknown' : 'Unknown'
    }))
  } catch (error) {
    console.error('Error in searchCrews:', error)
    return []
  }
}

export async function addCrewSchedule(schedule: Omit<CrewSchedule, 'id' | 'createdAt'>): Promise<CrewSchedule | null> {
  try {
    const { data, error } = await supabase
      .from('crew_schedules')
      .insert({
        crew_id: schedule.crewId,
        title: schedule.title,
        description: schedule.description,
        date: schedule.date,
        time: schedule.time,
        location: schedule.location,
        type: schedule.type,
        is_public: schedule.isPublic,
        created_by: schedule.createdBy
      })
      .select()
      .single()

    if (error) throw error
    
    // 데이터베이스 형식을 CrewSchedule 형식으로 변환
    return {
      id: data.id,
      crewId: data.crew_id,
      title: data.title,
      description: data.description,
      date: data.date,
      time: data.time,
      location: data.location,
      type: data.type,
      isPublic: data.is_public,
      createdBy: data.created_by,
      createdAt: data.created_at
    }
  } catch (error) {
    console.error('Error adding crew schedule:', error)
    return null
  }
}

// CrewsPage에서 사용하는 함수명으로 별칭 생성
export async function addScheduleToCrew(crewId: string, schedule: any): Promise<CrewSchedule | null> {
  return await addCrewSchedule({
    crewId,
    title: schedule.title,
    description: schedule.description,
    date: schedule.date,
    time: schedule.time,
    location: schedule.location,
    type: schedule.type,
    isPublic: schedule.isPublic,
    createdBy: schedule.createdBy
  })
}

export async function getCrewSchedules(crewId: string): Promise<CrewSchedule[]> {
  try {
    const { data, error } = await supabase
      .from('crew_schedules')
      .select('*')
      .eq('crew_id', crewId)
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching crew schedules:', error)
      return []
    }

    return (data || []).map(schedule => ({
      id: schedule.id,
      crewId: schedule.crew_id,
      title: schedule.title,
      description: schedule.description,
      date: schedule.date,
      time: schedule.time || '',
      location: schedule.location,
      type: schedule.type,
      isPublic: schedule.is_public,
      createdBy: schedule.created_by,
      createdAt: schedule.created_at
    }))
  } catch (error) {
    console.error('Error in getCrewSchedules:', error)
    return []
  }
}

export async function fetchCrewSchedules(crewName: string): Promise<CrewSchedule[]> {
  try {
    const { data: crewData, error: crewError } = await supabase
      .from('crews')
      .select('id')
      .eq('name', crewName)
      .single()

    if (crewError || !crewData) {
      console.error('Error fetching crew for schedules:', crewError)
      return []
    }

    return getCrewSchedules(crewData.id)
  } catch (error) {
    console.error('Error in fetchCrewSchedules:', error)
    return []
  }
}

export async function createCrew(crew: Omit<Crew, 'id' | 'createdAt' | 'members' | 'schedules'>): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('crews')
      .insert({
        name: crew.name,
        description: crew.description,
        genres: crew.genres,
        location: crew.location,
        member_count: crew.memberCount,
        established_year: crew.establishedYear,
        achievements: crew.achievements,
        instagram_url: crew.instagramUrl,
        youtube_url: crew.youtubeUrl,
        twitter_url: crew.twitterUrl,
        background_image: crew.backgroundImage
      })
      .select('id')
      .single()

    if (error) throw error
    return data?.id || null
  } catch (error) {
    console.error('Error creating crew:', error)
    return null
  }
}