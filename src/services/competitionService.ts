import { supabase } from '../lib/supabase'
import { Competition } from '../types'
import { competitions } from '../data/mockData'

export async function fetchCompetitions(): Promise<Competition[]> {
  try {
    console.log('🔍 Fetching competitions from Supabase...');
    
    // 3초 타임아웃으로 줄여서 빠른 응답
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 3000)
    })

    const supabasePromise = supabase
      .from('competitions')
      .select('*')
      .order('date', { ascending: false })
      .limit(20) // 최근 20개만 가져와서 속도 개선

    const { data, error } = await Promise.race([supabasePromise, timeoutPromise])

    if (error) {
      console.error('❌ Error fetching competitions from Supabase:', error)
      
      // 타임아웃 시 즉시 목데이터 사용
      if (error.message === 'Timeout') {
        console.log('⏰ Timeout - using mock data immediately')
        return competitions
      }
      
      // 다른 오류는 빠른 재시도 (1초 타임아웃)
      console.log('🔄 Quick retry...')
      const quickRetryPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Quick retry timeout')), 1000)
      })
      
      const retryPromise = supabase
        .from('competitions')
        .select('*')
        .order('date', { ascending: false })
        .limit(10) // 재시도 시 더 적은 데이터
      
      const { data: retryData, error: retryError } = await Promise.race([retryPromise, quickRetryPromise])
      
      if (!retryError && retryData && retryData.length > 0) {
        console.log(`✅ Quick retry successful: ${retryData.length} competitions`)
        return retryData.map(comp => ({
          id: comp.id,
          managerName: comp.manager_name || '',
          managerContact: comp.manager_contact || '',
          managerEmail: comp.manager_email || '',
          eventName: comp.name || comp.event_name || '',
          genres: comp.genres || [],
          venue: comp.location || comp.venue || '',
          eventStartDate: comp.date || comp.event_start_date || '',
          eventEndDate: comp.event_end_date || comp.date || '',
          registrationStartDate: comp.registration_start_date || '',
          registrationEndDate: comp.registration_end_date || '',
          participationType: comp.participation_type || 'individual',
          participantLimit: comp.participant_limit || 'unlimited',
          isParticipantListPublic: comp.is_participant_list_public || true,
          usePreliminaries: comp.use_preliminaries || false,
          prelimFormat: comp.prelim_format,
          finalistCount: comp.finalist_count,
          prizeDetails: comp.prize || comp.prize_details || '',
          ageRequirement: comp.age_requirement || '',
          regionRequirement: comp.region_requirement || '',
          entryFee: comp.entry_fee || '',
          audienceLimit: comp.audience_limit || 'unlimited',
          audienceFee: comp.audience_fee || '',
          dateMemo: comp.date_memo,
          detailedDescription: comp.description || comp.detailed_description || '',
          poster: comp.poster,
          link: comp.link,
          teamSize: comp.team_size,
          isPrelimGroupTournament: comp.is_prelim_group_tournament || false,
          participants: [],
          videos: []
        }))
      }
      
      // 재시도도 실패하면 즉시 목데이터 사용
      console.log('⚠️ Using mock data after quick retry failed')
      return competitions
    }

    // 실제 데이터가 있으면 사용
    if (data && data.length > 0) {
      console.log(`✅ Successfully fetched ${data.length} competitions from Supabase`)
      return data.map(comp => ({
        id: comp.id,
        managerName: comp.manager_name || '',
        managerContact: comp.manager_contact || '',
        managerEmail: comp.manager_email || '',
        eventName: comp.name || comp.event_name || '',
        genres: comp.genres || [],
        venue: comp.location || comp.venue || '',
        eventStartDate: comp.date || comp.event_start_date || '',
        eventEndDate: comp.event_end_date || comp.date || '',
        registrationStartDate: comp.registration_start_date || '',
        registrationEndDate: comp.registration_end_date || '',
        participationType: comp.participation_type || 'individual',
        participantLimit: comp.participant_limit || 'unlimited',
        isParticipantListPublic: comp.is_participant_list_public || true,
        usePreliminaries: comp.use_preliminaries || false,
        prelimFormat: comp.prelim_format,
        finalistCount: comp.finalist_count,
        prizeDetails: comp.prize || comp.prize_details || '',
        ageRequirement: comp.age_requirement || '',
        regionRequirement: comp.region_requirement || '',
        entryFee: comp.entry_fee || '',
        audienceLimit: comp.audience_limit || 'unlimited',
        audienceFee: comp.audience_fee || '',
        dateMemo: comp.date_memo,
        detailedDescription: comp.description || comp.detailed_description || '',
        poster: comp.poster,
        link: comp.link,
        teamSize: comp.team_size,
        isPrelimGroupTournament: comp.is_prelim_group_tournament || false,
        participants: [],
        videos: []
      }))
    }

    console.log('⚠️ No competitions found in Supabase, using mock data')
    return competitions
  } catch (error) {
    console.error('❌ Critical error in fetchCompetitions:', error)
    console.log('⚠️ Using mock data as fallback')
    return competitions
  }
}

export async function fetchCompetitionById(id: string): Promise<Competition | null> {
  try {
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      console.error('Error fetching competition by id:', error)
      return competitions.find(c => c.id === id) || null
    }

    return {
      id: data.id,
      managerName: data.manager_name || '',
      managerContact: data.manager_contact || '',
      managerEmail: data.manager_email || '',
      eventName: data.name || data.event_name || '',
      genres: data.genres || [],
      venue: data.location || data.venue || '',
      eventStartDate: data.date || data.event_start_date || '',
      eventEndDate: data.event_end_date || data.date || '',
      registrationStartDate: data.registration_start_date || '',
      registrationEndDate: data.registration_end_date || '',
      participationType: data.participation_type || 'individual',
      participantLimit: data.participant_limit || 'unlimited',
      isParticipantListPublic: data.is_participant_list_public || true,
      usePreliminaries: data.use_preliminaries || false,
      prelimFormat: data.prelim_format,
      finalistCount: data.finalist_count,
      prizeDetails: data.prize || data.prize_details || '',
      ageRequirement: data.age_requirement || '',
      regionRequirement: data.region_requirement || '',
      entryFee: data.entry_fee || '',
      audienceLimit: data.audience_limit || 'unlimited',
      audienceFee: data.audience_fee || '',
      dateMemo: data.date_memo,
      detailedDescription: data.description || data.detailed_description || '',
      poster: data.poster,
      link: data.link,
      teamSize: data.team_size,
      isPrelimGroupTournament: data.is_prelim_group_tournament || false,
      participants: [],
      videos: []
    }
  } catch (error) {
    console.error('Error in fetchCompetitionById:', error)
    return competitions.find(c => c.id === id) || null
  }
}

export async function createCompetition(competition: Omit<Competition, 'id' | 'participants' | 'videos'>): Promise<Competition | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('competitions')
      .insert({
        event_name: competition.eventName,
        manager_name: competition.managerName,
        manager_contact: competition.managerContact,
        manager_email: competition.managerEmail,
        genres: competition.genres,
        venue: competition.venue,
        event_start_date: competition.eventStartDate,
        event_end_date: competition.eventEndDate,
        registration_start_date: competition.registrationStartDate,
        registration_end_date: competition.registrationEndDate,
        participation_type: competition.participationType,
        participant_limit: competition.participantLimit === 'unlimited' ? null : competition.participantLimit,
        is_participant_list_public: competition.isParticipantListPublic,
        use_preliminaries: competition.usePreliminaries,
        prelim_format: competition.prelimFormat,
        finalist_count: competition.finalistCount,
        prize_details: competition.prizeDetails,
        age_requirement: competition.ageRequirement,
        region_requirement: competition.regionRequirement,
        entry_fee: competition.entryFee,
        audience_limit: competition.audienceLimit === 'unlimited' ? null : competition.audienceLimit,
        audience_fee: competition.audienceFee,
        date_memo: competition.dateMemo,
        detailed_description: competition.detailedDescription,
        poster: competition.poster,
        link: competition.link,
        team_size: competition.teamSize,
        is_prelim_group_tournament: competition.isPrelimGroupTournament,
        created_by: userData.user.id
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...competition,
      id: data.id,
      participants: [],
      videos: []
    };
  } catch (error) {
    console.error('Error creating competition:', error);
    return null;
  }
}

export async function registerForCompetition(competitionId: string, dancerId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('competition_participants')
      .insert({
        competition_id: competitionId,
        dancer_id: dancerId,
        status: 'registered'
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error registering for competition:', error);
    return false;
  }
}

export async function updateCompetitionResults(
  competitionId: string, 
  participantId: string, 
  position: number, 
  points: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('competition_participants')
      .update({ position, points })
      .eq('competition_id', competitionId)
      .eq('id', participantId);

    if (error) throw error;

    // 댄서의 총 포인트 업데이트
    const { data: participant } = await supabase
      .from('competition_participants')
      .select('dancer_id')
      .eq('id', participantId)
      .single();

    if (participant) {
      const { data: allPoints } = await supabase
        .from('competition_participants')
        .select('points')
        .eq('dancer_id', participant.dancer_id)
        .eq('status', 'participated');

      const totalPoints = (allPoints || []).reduce((sum, p) => sum + (p.points || 0), 0);

      await supabase
        .from('dancers')
        .update({ total_points: totalPoints })
        .eq('id', participant.dancer_id);
    }

    return true;
  } catch (error) {
    console.error('Error updating competition results:', error);
    return false;
  }
} 