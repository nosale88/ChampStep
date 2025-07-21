import { supabase } from '../lib/supabase'
import { Competition, Judge, Guest, Winner } from '../types'

export async function fetchCompetitions(): Promise<Competition[]> {
  try {
    console.log('🔍 Fetching competitions from Supabase...');
    
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .order('date', { ascending: false })
      .limit(20)

    if (error) {
      console.error('❌ Error fetching competitions from Supabase:', error)
      console.log('🔄 Using mock competitions as fallback...')
      return []
    }

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
        status: comp.status || 'upcoming',
        prizeAmount: comp.prize_amount || 0,
        judgeCount: comp.judge_count || 0,
        participantCount: comp.participant_count || 0,
        editionNumber: comp.edition_number || 1,
        participants: [],
        videos: []
      }))
    }

    console.log('⚠️ No competitions found in Supabase, using mock data')
    return []
  } catch (error) {
    console.error('❌ Critical error in fetchCompetitions:', error)
    console.log('🔄 Using mock competitions as fallback...')
    return []
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
      return null
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
      status: data.status || 'upcoming',
      prizeAmount: data.prize_amount || 0,
      judgeCount: data.judge_count || 0,
      participantCount: data.participant_count || 0,
      editionNumber: data.edition_number || 1,
      participants: [],
      videos: []
    }
  } catch (error) {
    console.error('Error in fetchCompetitionById:', error)
    return null
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

    // 댄서의 총 스텝 점수 업데이트
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

// 새로운 대회 업로드 함수
export async function uploadCompetition(competition: Competition): Promise<Competition | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    // 기본 대회 정보 저장
    const { data: competitionData, error: competitionError } = await supabase
      .from('competitions')
      .insert({
        id: competition.id,
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
        status: competition.status,
        created_by: userData.user.id,
        created_at: competition.createdAt,
        updated_at: competition.updatedAt
      })
      .select()
      .single();

    if (competitionError) throw competitionError;

    // 심사위원 정보 저장
    if (competition.judges && competition.judges.length > 0) {
      const judgeData = competition.judges.map(judge => ({
        competition_id: competition.id,
        type: judge.type,
        name: judge.name,
        role: judge.role,
        dancer_id: judge.dancerId,
        crew_id: judge.crewId
      }));

      const { error: judgeError } = await supabase
        .from('competition_judges')
        .insert(judgeData);

      if (judgeError) console.error('Error saving judges:', judgeError);
    }

    // 게스트 정보 저장
    if (competition.guests && competition.guests.length > 0) {
      const guestData = competition.guests.map(guest => ({
        competition_id: competition.id,
        type: guest.type,
        name: guest.name,
        role: guest.role,
        dancer_id: guest.dancerId,
        crew_id: guest.crewId
      }));

      const { error: guestError } = await supabase
        .from('competition_guests')
        .insert(guestData);

      if (guestError) console.error('Error saving guests:', guestError);
    }

    // 수상자 정보 저장
    if (competition.winners && competition.winners.length > 0) {
      const winnerData = competition.winners.map(winner => ({
        competition_id: competition.id,
        type: winner.type,
        name: winner.name,
        rank: winner.rank,
        category: winner.category,
        points: winner.points,
        prize: winner.prize,
        dancer_id: winner.dancerId,
        crew_id: winner.crewId
      }));

      const { error: winnerError } = await supabase
        .from('competition_winners')
        .insert(winnerData);

      if (winnerError) console.error('Error saving winners:', winnerError);

      // 수상자들의 댄서 데이터에 대회 참가 이력 및 스텝 점수 업데이트
      await updateDancerDataFromWinners(competition.id, competition.winners);
    }

    return competition;
  } catch (error) {
    console.error('Error uploading competition:', error);
    return null;
  }
}

// 대회 수정 함수
export async function updateCompetition(competition: Competition): Promise<Competition | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    // 기본 대회 정보 업데이트
    const { error: competitionError } = await supabase
      .from('competitions')
      .update({
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
        status: competition.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', competition.id);

    if (competitionError) throw competitionError;

    // 기존 심사위원, 게스트, 수상자 정보 삭제 후 재저장
    await supabase.from('competition_judges').delete().eq('competition_id', competition.id);
    await supabase.from('competition_guests').delete().eq('competition_id', competition.id);
    await supabase.from('competition_winners').delete().eq('competition_id', competition.id);

    // 새 정보 저장 (uploadCompetition과 동일한 로직)
    if (competition.judges && competition.judges.length > 0) {
      const judgeData = competition.judges.map(judge => ({
        competition_id: competition.id,
        type: judge.type,
        name: judge.name,
        role: judge.role,
        dancer_id: judge.dancerId,
        crew_id: judge.crewId
      }));

      await supabase.from('competition_judges').insert(judgeData);
    }

    if (competition.guests && competition.guests.length > 0) {
      const guestData = competition.guests.map(guest => ({
        competition_id: competition.id,
        type: guest.type,
        name: guest.name,
        role: guest.role,
        dancer_id: guest.dancerId,
        crew_id: guest.crewId
      }));

      await supabase.from('competition_guests').insert(guestData);
    }

    if (competition.winners && competition.winners.length > 0) {
      const winnerData = competition.winners.map(winner => ({
        competition_id: competition.id,
        type: winner.type,
        name: winner.name,
        rank: winner.rank,
        category: winner.category,
        points: winner.points,
        prize: winner.prize,
        dancer_id: winner.dancerId,
        crew_id: winner.crewId
      }));

      await supabase.from('competition_winners').insert(winnerData);
      await updateDancerDataFromWinners(competition.id, competition.winners);
    }

    return competition;
  } catch (error) {
    console.error('Error updating competition:', error);
    return null;
  }
}

// 수상자 정보를 기반으로 댄서 데이터 업데이트
async function updateDancerDataFromWinners(competitionId: string, winners: Winner[]): Promise<void> {
  try {
    for (const winner of winners) {
      if (winner.type === 'dancer' && winner.dancerId) {
        // 댄서의 대회 참가 이력에 추가
        await supabase
          .from('competition_participants')
          .upsert({
            competition_id: competitionId,
            dancer_id: winner.dancerId,
            position: winner.rank,
            points: winner.points || 0,
            status: 'participated'
          });

        // 댄서의 총 스텝 점수 재계산
        const { data: allParticipations } = await supabase
          .from('competition_participants')
          .select('points')
          .eq('dancer_id', winner.dancerId)
          .eq('status', 'participated');

        const totalPoints = (allParticipations || []).reduce((sum, p) => sum + (p.points || 0), 0);

        await supabase
          .from('dancers')
          .update({ total_points: totalPoints })
          .eq('id', winner.dancerId);

        // 수상 이력 추가 (별도 테이블이 있다면)
        if (winner.rank <= 3) {
          await supabase
            .from('dancer_awards')
            .upsert({
              dancer_id: winner.dancerId,
              competition_id: competitionId,
              rank: winner.rank,
              category: winner.category,
              prize: winner.prize,
              date: new Date().toISOString().split('T')[0]
            });
        }
      }
    }
  } catch (error) {
    console.error('Error updating dancer data from winners:', error);
  }
}

// 대회 삭제 함수
export async function deleteCompetition(competitionId: string): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    // 관련 데이터 모두 삭제
    await supabase.from('competition_judges').delete().eq('competition_id', competitionId);
    await supabase.from('competition_guests').delete().eq('competition_id', competitionId);
    await supabase.from('competition_winners').delete().eq('competition_id', competitionId);
    await supabase.from('competition_participants').delete().eq('competition_id', competitionId);

    // 대회 정보 삭제
    const { error } = await supabase
      .from('competitions')
      .delete()
      .eq('id', competitionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting competition:', error);
    return false;
  }
}

// 대회에 심사위원 추가
export async function addJudgeToCompetition(competitionId: string, judge: Judge): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('competition_judges')
      .insert({
        competition_id: competitionId,
        type: judge.type,
        name: judge.name,
        role: judge.role,
        dancer_id: judge.dancerId,
        crew_id: judge.crewId
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding judge to competition:', error);
    return false;
  }
}

// 대회에 게스트 추가
export async function addGuestToCompetition(competitionId: string, guest: Guest): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('competition_guests')
      .insert({
        competition_id: competitionId,
        type: guest.type,
        name: guest.name,
        role: guest.role,
        dancer_id: guest.dancerId,
        crew_id: guest.crewId
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding guest to competition:', error);
    return false;
  }
} 