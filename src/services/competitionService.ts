import { supabase } from '../lib/supabase'
import { Competition } from '../types'

export async function fetchCompetitions(): Promise<Competition[]> {
  // 대회 테이블이 아직 없으므로 빈 배열 반환
  return []
}

export async function fetchCompetitionById(id: string): Promise<Competition | null> {
  // 대회 테이블이 아직 없으므로 null 반환
  return null
} 