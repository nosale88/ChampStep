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