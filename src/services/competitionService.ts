import { supabase } from '../lib/supabase'
import { Competition, Participant } from '../types'
import { competitions } from '../data/mockData'

export async function fetchCompetitions(): Promise<Competition[]> {
  try {
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .order('event_start_date', { ascending: false })

    if (error) {
      console.error('Error fetching competitions from Supabase:', error)
      // Supabase 오류 시 목데이터 사용
      return competitions
    }

    // 데이터가 있으면 Supabase 데이터 사용
    if (data && data.length > 0) {
      return data.map(comp => ({
        id: comp.id,
        managerName: comp.manager_name,
        managerContact: comp.manager_contact,
        managerEmail: comp.manager_email,
        eventName: comp.event_name,
        genres: comp.genres,
        venue: comp.venue,
        eventStartDate: comp.event_start_date,
        eventEndDate: comp.event_end_date,
        registrationStartDate: comp.registration_start_date,
        registrationEndDate: comp.registration_end_date,
        participationType: comp.participation_type,
        teamSize: comp.team_size,
        participantLimit: comp.participant_limit,
        isParticipantListPublic: comp.is_participant_list_public,
        usePreliminaries: comp.use_preliminaries,
        prelimFormat: comp.prelim_format,
        isPrelimGroupTournament: comp.is_prelim_group_tournament,
        finalistCount: comp.finalist_count,
        prizeDetails: comp.prize_details,
        ageRequirement: comp.age_requirement,
        regionRequirement: comp.region_requirement,
        entryFee: comp.entry_fee,
        audienceLimit: comp.audience_limit,
        audienceFee: comp.audience_fee,
        dateMemo: comp.date_memo,
        detailedDescription: comp.detailed_description,
        poster: comp.poster,
        link: comp.link,
        participants: [],
        videos: []
      }))
    }

    // 데이터가 없으면 목데이터 사용
    return competitions
  } catch (error) {
    console.error('Error in fetchCompetitions:', error)
    // 오류 발생 시 목데이터 사용
    return competitions
  }
}

export async function fetchCompetitionById(id: string): Promise<Competition | null> {
  try {
    const { data, error } = await supabase
      .from('competitions')
      .select(`
        *,
        competition_participants (
          id,
          dancer_id,
          position,
          points,
          status,
          dancers (
            id,
            nickname,
            name,
            avatar,
            rank,
            total_points
          )
        ),
        competition_videos (
          id,
          title,
          url,
          thumbnail,
          type,
          upload_date
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      managerName: data.manager_name,
      managerContact: data.manager_contact || '',
      managerEmail: data.manager_email || '',
      eventName: data.event_name,
      genres: data.genres || [],
      venue: data.venue || '',
      eventStartDate: data.event_start_date,
      eventEndDate: data.event_end_date,
      registrationStartDate: data.registration_start_date || '',
      registrationEndDate: data.registration_end_date || '',
      participationType: data.participation_type || 'individual',
      participantLimit: data.participant_limit || 'unlimited',
      isParticipantListPublic: data.is_participant_list_public,
      usePreliminaries: data.use_preliminaries,
      prelimFormat: data.prelim_format,
      finalistCount: data.finalist_count,
      prizeDetails: data.prize_details || '',
      ageRequirement: data.age_requirement || '',
      regionRequirement: data.region_requirement || '',
      entryFee: data.entry_fee || '',
      audienceLimit: data.audience_limit || 'unlimited',
      audienceFee: data.audience_fee || '',
      dateMemo: data.date_memo,
      detailedDescription: data.detailed_description || '',
      poster: data.poster,
      link: data.link,
      teamSize: data.team_size,
      isPrelimGroupTournament: data.is_prelim_group_tournament,
      participants: (data.competition_participants || []).map((p: any) => ({
        dancerId: p.dancer_id,
        dancer: p.dancers ? {
          id: p.dancers.id,
          nickname: p.dancers.nickname,
          name: p.dancers.name,
          avatar: p.dancers.avatar,
          rank: p.dancers.rank,
          totalPoints: p.dancers.total_points,
          genres: [],
          competitions: [],
          videos: []
        } : null,
        position: p.position || 0,
        points: p.points || 0
      })).filter((p: any) => p.dancer),
      videos: data.competition_videos || []
    };
  } catch (error) {
    console.error('Error fetching competition:', error);
    return null;
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