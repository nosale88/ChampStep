import { supabase } from '../lib/supabase'
import { Dancer } from '../types'
import { dancers } from '../data/mockData'

export async function fetchDancers(): Promise<Dancer[]> {
  try {
    console.log('🔍 Fetching dancers from Supabase...');
    
    // 3초 타임아웃으로 줄여서 빠른 응답
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 3000)
    })

    const supabasePromise = supabase
      .from('dancers')
      .select('*')
      .order('rank', { ascending: true })
      .limit(100) // 상위 100명만 가져와서 속도 개선

    const { data, error } = await Promise.race([supabasePromise, timeoutPromise])

    if (error) {
      console.error('❌ Error fetching dancers from Supabase:', error)
      
      // 타임아웃 시 즉시 목데이터 사용
      if (error.message === 'Timeout') {
        console.log('⏰ Timeout - using mock data immediately')
        return dancers
      }
      
      // 다른 오류는 빠른 재시도 (1초 타임아웃)
      console.log('🔄 Quick retry...')
      const quickRetryPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Quick retry timeout')), 1000)
      })
      
      const retryPromise = supabase
        .from('dancers')
        .select('*')
        .order('rank', { ascending: true })
        .limit(50) // 재시도 시 더 적은 데이터
      
      const { data: retryData, error: retryError } = await Promise.race([retryPromise, quickRetryPromise])
      
      if (!retryError && retryData && retryData.length > 0) {
        console.log(`✅ Quick retry successful: ${retryData.length} dancers`)
        return retryData.map(dancer => ({
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
          videos: [],
        }))
      }
      
      // 재시도도 실패하면 즉시 목데이터 사용
      console.log('⚠️ Using mock data after quick retry failed')
      return dancers
    }

    // 실제 데이터가 있으면 사용
    if (data && data.length > 0) {
      console.log(`✅ Successfully fetched ${data.length} dancers from Supabase`)
      return data.map(dancer => ({
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
        videos: [],
      }))
    }

    console.log('⚠️ No dancers found in Supabase, using mock data')
    return dancers
  } catch (error) {
    console.error('❌ Critical error in fetchDancers:', error)
    console.log('⚠️ Using mock data as fallback')
    return dancers
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
      return dancers.find(d => d.id === id) || null
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
      avatar: data.avatar || `https://i.pravatar.cc/150?u=${data.id}`,
      profileImage: data.profile_image,
      backgroundImage: data.background_image,
      bio: data.bio,
      birthDate: data.birth_date,
      phone: data.phone,
      email: data.email,
      instagramUrl: data.instagram_url,
      youtubeUrl: data.youtube_url,
      twitterUrl: data.twitter_url,
      competitions: [],
      videos: [],
    }
  } catch (error) {
    console.error('Error in fetchDancerById:', error)
    return dancers.find(d => d.id === id) || null
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
    avatar: data.avatar || `https://i.pravatar.cc/150?u=${data.id}`,
    profileImage: data.profile_image,
    backgroundImage: data.background_image,
    bio: data.bio,
    birthDate: data.birth_date,
    phone: data.phone,
    email: data.email,
    instagramUrl: data.instagram_url,
    youtubeUrl: data.youtube_url,
    twitterUrl: data.twitter_url,
    competitions: [], // Empty for now
    videos: videos || [],
    awards: awards || [],
  }
} 