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
      .order('name', { ascending: true })

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
      console.error('Error fetching crews or dancers:', crewsError || dancersError)
      return crews
    }

    // 실제 데이터가 있으면 사용
    if (crewsData && crewsData.length > 0) {
      console.log(`✅ Supabase에서 ${crewsData.length}개의 크루 데이터를 가져왔습니다`)
      
      // 크루별로 멤버 매칭
      const crewsWithMembers = crewsData.map(crew => {
        const members = dancersData
          ?.filter(dancer => dancer.crew === crew.name)
          .map(dancer => ({
            id: dancer.id,
            nickname: dancer.nickname,
            name: dancer.name,
            crew: dancer.crew,
            genres: dancer.genres,
            sns: dancer.sns || '',
            totalPoints: dancer.total_points,
            rank: dancer.rank,
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
            videos: [],
          })) || []

        return {
          id: crew.id,
          name: crew.name,
          genre: crew.genre,
          introduction: crew.introduction,
          members,
          schedules: [],
          backgroundImage: crew.background_image,
          createdAt: crew.created_at
        }
      })

      return crewsWithMembers
    }

    // 데이터가 없으면 댄서 데이터에서 크루 정보 추출
    if (dancersData && dancersData.length > 0) {
      console.log('⚠️ 크루 테이블에서 데이터를 찾을 수 없어 댄서 데이터에서 크루 정보를 추출합니다')
      
      // 댄서 데이터에서 고유한 크루 이름 추출
      const crewNames = [...new Set(dancersData.map(d => d.crew).filter(Boolean))]
      
      const crewsFromDancers = crewNames.map((crewName, index) => {
        const members = dancersData
          .filter(dancer => dancer.crew === crewName)
          .map(dancer => ({
            id: dancer.id,
            nickname: dancer.nickname,
            name: dancer.name,
            crew: dancer.crew,
            genres: dancer.genres,
            sns: dancer.sns || '',
            totalPoints: dancer.total_points,
            rank: dancer.rank,
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
            videos: [],
          }))

        // 크루의 주요 장르 추출 (멤버들의 장르 중 가장 많은 것)
        const genreCounts = members.reduce((acc, member) => {
          member.genres.forEach((genre: string) => {
            acc[genre] = (acc[genre] || 0) + 1
          })
          return acc
        }, {} as Record<string, number>)
        
        const mainGenre = Object.entries(genreCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Hip-hop'

        return {
          id: `crew_${index + 1}`,
          name: crewName,
          genre: mainGenre,
          introduction: `${crewName} 크루입니다. ${members.length}명의 멤버가 활동하고 있습니다.`,
          members,
          schedules: [],
          backgroundImage: undefined,
          createdAt: new Date().toISOString()
        }
      })

      return crewsFromDancers
    }

    console.log('⚠️ Supabase에서 크루 및 댄서 데이터를 찾을 수 없어 목데이터를 사용합니다')
    return crews
  } catch (error) {
    console.error('Error in fetchCrews:', error)
    console.log('⚠️ 오류 발생으로 목데이터를 사용합니다')
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