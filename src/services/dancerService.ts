import { supabase } from '../lib/supabase'
import { Dancer, Competition } from '../types'
import { getValidAvatarUrl } from '../utils/avatarUtils'

export async function fetchDancers(): Promise<Dancer[]> {
  try {
    console.log('🔍 Fetching dancers from Supabase...');
    console.log('🔍 Environment mode:', import.meta.env.MODE);
    console.log('🔍 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('🔍 Has Supabase Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    
    // 단순한 쿼리로 시작
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('dancers')
      .select(`
        id,
        nickname,
        name,
        crew,
        genres,
        sns,
        total_points,
        rank,
        avatar,
        profile_image,
        background_image,
        bio,
        birth_date,
        phone,
        email,
        instagram_url,
        youtube_url,
        twitter_url,
        is_admin
      `)
      .order('rank', { ascending: true });
    
    const endTime = Date.now();
    console.log('📊 Query completed in:', endTime - startTime, 'ms');
    console.log('📊 Query result:', {
      dataLength: data?.length,
      hasData: !!data,
      firstItem: data?.[0] ? { id: data[0].id, nickname: data[0].nickname } : null,
      error: error,
      errorCode: error?.code,
      errorMessage: error?.message,
      errorDetails: error?.details,
      errorHint: error?.hint
    });
    
    if (error) {
      console.error('❌ Error fetching dancers:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No dancers found in database');
      return [];
    }

    console.log(`✅ Successfully fetched ${data.length} dancers from Supabase`);
    console.log('👤 Sample dancers:', data.slice(0, 3).map(d => ({ id: d.id, nickname: d.nickname })));
    
    return data.map(dancer => ({
      id: dancer.id,
      nickname: dancer.nickname,
      name: dancer.name,
      crew: dancer.crew,
      genres: dancer.genres || [],
      sns: dancer.sns || {},
      totalPoints: dancer.total_points || 0,
      rank: dancer.rank || 999,
      avatar: getValidAvatarUrl(dancer.avatar, dancer.id),
      profileImage: dancer.profile_image,
      backgroundImage: dancer.background_image,
      bio: dancer.bio,
      birthDate: dancer.birth_date,
      phone: dancer.phone,
      email: dancer.email,
      instagramUrl: dancer.instagram_url,
      youtubeUrl: dancer.youtube_url,
      twitterUrl: dancer.twitter_url,
      isAdmin: dancer.is_admin || false,
      competitions: [],
      videos: []
    }));
  } catch (error) {
    console.error('❌ Critical error in fetchDancers:', error);
    return [];
  }
}

export async function fetchDancerById(id: string): Promise<Dancer | null> {
  try {
    const { data, error } = await supabase
      .from('dancers')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      console.error('Error fetching dancer by id:', error)
      return null
    }

    return {
      id: data.id,
      nickname: data.nickname,
      name: data.name,
      crew: data.crew,
      genres: data.genres,
      sns: data.sns || '',
      totalPoints: data.total_points,
      rank: data.rank,
      avatar: getValidAvatarUrl(data.avatar, data.id),
      profileImage: data.profile_image,
      backgroundImage: data.background_image,
      bio: data.bio,
      birthDate: data.birth_date,
      phone: data.phone,
      email: data.email,
      instagramUrl: data.instagram_url,
      youtubeUrl: data.youtube_url,
      twitterUrl: data.twitter_url,
      isAdmin: data.is_admin || false,
      competitions: [],
      videos: [],
    }
  } catch (error) {
    console.error('Error in fetchDancerById:', error)
    return null
  }
}

export async function fetchDancerByNickname(nickname: string): Promise<Dancer | null> {
  const { data, error } = await supabase
    .from('dancers')
    .select('*')
    .eq('nickname', nickname)
    .single()

  if (error) {
    console.error('Error fetching dancer by nickname:', error)
    return null
  }

  // 수상 내역 가져오기
  const { data: awards, error: awardsError } = await supabase
    .from('awards')
    .select('*')
    .eq('dancer_id', data.id)
    .order('date', { ascending: false })

  if (awardsError) {
    console.error('Error fetching awards:', awardsError)
  }

  // 동영상 가져오기
  const { data: videos, error: videosError } = await supabase
    .from('videos')
    .select('*')
    .eq('dancer_id', data.id)
    .order('upload_date', { ascending: false })

  if (videosError) {
    console.error('Error fetching videos:', videosError)
  }

  return {
    id: data.id,
    nickname: data.nickname,
    name: data.name,
    crew: data.crew,
    genres: data.genres,
    sns: data.sns || '',
    totalPoints: data.total_points,
    rank: data.rank,
    avatar: getValidAvatarUrl(data.avatar, data.id),
    profileImage: data.profile_image,
    backgroundImage: data.background_image,
    bio: data.bio,
    birthDate: data.birth_date,
    phone: data.phone,
    email: data.email,
    instagramUrl: data.instagram_url,
    youtubeUrl: data.youtube_url,
    twitterUrl: data.twitter_url,
    isAdmin: data.is_admin || false,
    competitions: [], // Empty for now
    videos: videos || [],
    awards: awards || [],
  }
}

// 댄서의 대회 참가 이력 업데이트
export async function updateDancerCompetitionHistory(
  dancerId: string,
  competitionId: string,
  position: number,
  points: number
): Promise<boolean> {
  try {
    // 참가 이력 추가/업데이트
    const { error } = await supabase
      .from('competition_participants')
      .upsert({
        dancer_id: dancerId,
        competition_id: competitionId,
        position,
        points,
        status: 'participated'
      });

    if (error) throw error;

    // 댄서의 총 스텝 점수 재계산
    await recalculateDancerTotalPoints(dancerId);
    return true;
  } catch (error) {
    console.error('Error updating dancer competition history:', error);
    return false;
  }
}

// 댄서의 총 스텝 점수 재계산
export async function recalculateDancerTotalPoints(dancerId: string): Promise<void> {
  try {
    const { data: participations } = await supabase
      .from('competition_participants')
      .select('points')
      .eq('dancer_id', dancerId)
      .eq('status', 'participated');

    const totalPoints = (participations || []).reduce((sum, p) => sum + (p.points || 0), 0);

    await supabase
      .from('dancers')
      .update({ total_points: totalPoints })
      .eq('id', dancerId);

    // 스텝 재계산이 필요할 수도 있음
    await updateDancerStepRankings();
  } catch (error) {
    console.error('Error recalculating dancer total points:', error);
  }
}

// 모든 댄서의 스텝 재계산
export async function updateDancerStepRankings(): Promise<void> {
  try {
    const { data: dancers } = await supabase
      .from('dancers')
      .select('id, total_points')
      .order('total_points', { ascending: false });

    if (dancers) {
      for (let i = 0; i < dancers.length; i++) {
        await supabase
          .from('dancers')
          .update({ rank: i + 1 })
          .eq('id', dancers[i].id);
      }
    }
  } catch (error) {
    console.error('Error updating dancer step rankings:', error);
  }
}

// 댄서의 수상 이력 추가
export async function addDancerAward(
  dancerId: string,
  competitionId: string,
  rank: number,
  category?: string,
  prize?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('dancer_awards')
      .insert({
        dancer_id: dancerId,
        competition_id: competitionId,
        rank,
        category,
        prize,
        date: new Date().toISOString().split('T')[0]
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding dancer award:', error);
    return false;
  }
}

// 댄서의 대회 목록 가져오기
export async function fetchDancerCompetitions(dancerId: string): Promise<Competition[]> {
  try {
    const { data, error } = await supabase
      .from('competition_participants')
      .select(`
        competition_id,
        position,
        points,
        competitions (*)
      `)
      .eq('dancer_id', dancerId)
      .eq('status', 'participated');

    if (error) throw error;

    return (data || []).map(item => ({
      ...item.competitions,
      participants: [{
        dancerId,
        position: item.position,
        points: item.points
      }]
    }));
  } catch (error) {
    console.error('Error fetching dancer competitions:', error);
    return [];
  }
}

// 댄서를 대회 참가자로 등록
export async function registerDancerForCompetition(
  dancerId: string,
  competitionId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('competition_participants')
      .insert({
        dancer_id: dancerId,
        competition_id: competitionId,
        status: 'registered'
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error registering dancer for competition:', error);
    return false;
  }
}

// 댄서의 참가 신청 취소
export async function unregisterDancerFromCompetition(
  dancerId: string,
  competitionId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('competition_participants')
      .delete()
      .eq('dancer_id', dancerId)
      .eq('competition_id', competitionId)
      .eq('status', 'registered');

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error unregistering dancer from competition:', error);
    return false;
  }
}

// 댄서 검색 (심사위원/게스트 선택용)
export async function searchDancers(query: string, limit: number = 50): Promise<Dancer[]> {
  try {
    const { data, error } = await supabase
      .from('dancers')
      .select('*')
      .or(`name.ilike.%${query}%, nickname.ilike.%${query}%`)
      .order('rank', { ascending: true })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(dancer => ({
      id: dancer.id,
      nickname: dancer.nickname,
      name: dancer.name,
      crew: dancer.crew,
      genres: dancer.genres || [],
      sns: dancer.sns || '',
      totalPoints: dancer.total_points || 0,
      rank: dancer.rank || 999,
      avatar: getValidAvatarUrl(dancer.avatar, dancer.id),
      profileImage: dancer.profile_image,
      backgroundImage: dancer.background_image,
      bio: dancer.bio,
      birthDate: dancer.birth_date,
      phone: dancer.phone,
      email: dancer.email,
      instagramUrl: dancer.instagram_url,
      youtubeUrl: dancer.youtube_url,
      twitterUrl: dancer.twitter_url,
      isAdmin: dancer.is_admin || false,
      competitions: [],
      videos: []
    }));
  } catch (error) {
    console.error('Error searching dancers:', error);
    return [];
  }
}