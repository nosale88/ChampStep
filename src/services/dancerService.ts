import { supabase } from '../lib/supabase'
import { Dancer } from '../types'
import { dancers } from '../data/mockData'

export async function fetchDancers(): Promise<Dancer[]> {
  try {
    // 5초 타임아웃으로 증가
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 5000)
    })

    const supabasePromise = supabase
      .from('dancers')
      .select('*')
      .order('rank', { ascending: true })

    const { data, error } = await Promise.race([supabasePromise, timeoutPromise])

    if (error) {
      console.error('Error fetching dancers from Supabase:', error)
      // 타임아웃이 아닌 다른 오류의 경우 재시도
      if (error.message !== 'Timeout') {
        console.log('🔄 재시도 중...')
        const { data: retryData, error: retryError } = await supabase
          .from('dancers')
          .select('*')
          .order('rank', { ascending: true })
        
        if (!retryError && retryData && retryData.length > 0) {
          console.log(`✅ 재시도 성공: ${retryData.length}명의 댄서 데이터`)
          return retryData.map(dancer => ({
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
        }
      }
      console.log('⚠️ 목데이터 사용')
      return dancers
    }

    // 실제 데이터가 있으면 사용
    if (data && data.length > 0) {
      console.log(`✅ Supabase에서 ${data.length}명의 댄서 데이터를 가져왔습니다`)
      return data.map(dancer => ({
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
    }

    console.log('⚠️ Supabase에서 댄서 데이터를 찾을 수 없어 목데이터를 사용합니다')
    return dancers
  } catch (error) {
    console.error('Error in fetchDancers:', error)
    console.log('⚠️ 오류 발생으로 목데이터를 사용합니다')
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