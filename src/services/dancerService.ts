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
    competitions: [], // Empty for now
    videos: [], // Empty for now
  }
} 