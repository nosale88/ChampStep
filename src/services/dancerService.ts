import { supabase } from '../lib/supabase'
import { Dancer } from '../types'

export async function fetchDancers(): Promise<Dancer[]> {
  const { data, error } = await supabase
    .from('dancers')
    .select('*')
    .order('rank', { ascending: true })

  if (error) {
    console.error('Error fetching dancers:', error)
    throw error
  }

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
    competitions: [], // Empty for now
    videos: [], // Empty for now
  }))
}

export async function fetchDancerById(id: string): Promise<Dancer | null> {
  const { data, error } = await supabase
    .from('dancers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching dancer:', error)
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
    videos: [], // Empty for now
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