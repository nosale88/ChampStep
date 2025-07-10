import { supabase } from '../lib/supabase'
import { Crew, Dancer, CrewSchedule } from '../types'
import { crews } from '../data/mockData'

export async function fetchCrews(): Promise<Crew[]> {
  try {
    // 1초 타임아웃으로 빠르게 처리
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 1000)
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
    ])

    const { data: crewsData, error: crewsError } = crewsResult
    const { data: dancersData, error: dancersError } = dancersResult

    if (crewsError || dancersError) {
      console.error('Error fetching crews/dancers from Supabase:', crewsError || dancersError)
      return crews
    }

    // 실제 데이터가 있으면 사용
    if (crewsData && crewsData.length > 0) {
      console.log(`✅ Supabase에서 ${crewsData.length}개의 크루 데이터를 가져왔습니다`)
      
      // 댄서 데이터를 크루별로 그룹화
      const dancersByCrewName = (dancersData || []).reduce((acc, dancer) => {
        if (dancer.crew) {
          if (!acc[dancer.crew]) {
            acc[dancer.crew] = []
          }
          acc[dancer.crew].push({
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

      return crewsData.map(crew => ({
        id: crew.id,
        name: crew.name,
        genre: 'Hip-hop', // 기본값 (crews 테이블에 genre 컬럼이 없으므로)
        introduction: crew.description || `${crew.name} 크루입니다.`,
        members: dancersByCrewName[crew.name] || [],
        schedules: [],
        backgroundImage: undefined,
        createdAt: crew.created_at
      }))
    }

    // 타임아웃이나 데이터가 없으면 목데이터 사용
    console.log('⚠️ Supabase 타임아웃 또는 데이터 없음 - 목데이터 사용')
    return crews

  } catch (error) {
    console.error('Error in fetchCrews:', error)
    return crews
  }
}

export async function fetchCrewById(id: string): Promise<Crew | null> {
  const crews = await fetchCrews()
  return crews.find(crew => crew.id === id) || null
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