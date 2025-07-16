import { supabase } from '../lib/supabase';

export interface DancerRegistrationData {
  nickname: string;
  name: string;
  genres: string[];
  bio: string;
  instagramUrl: string;
  youtubeUrl: string;
  twitterUrl: string;
}

export interface CrewRegistrationData {
  name: string;
  description: string;
  genres: string[];
  location: string;
  instagramUrl: string;
  youtubeUrl: string;
}

export interface RegistrationResult {
  type: 'success' | 'pending' | 'error';
  message: string;
  isExisting?: boolean;
}

export class RegistrationService {
  
  // 댄서 등록
  static async registerDancer(userId: string, data: DancerRegistrationData): Promise<RegistrationResult> {
    try {
      // 1. 기존 댄서 데이터 중복 체크
      const existingDancer = await this.checkExistingDancer(data.nickname, data.name);
      
      if (existingDancer) {
        // 기존 댄서가 있으면 승인 요청 생성
        await this.createDancerClaimRequest(userId, existingDancer.id, data);
        
        return {
          type: 'pending',
          message: `기존 댄서 "${data.nickname}"에 대한 승인 요청이 관리자에게 전송되었습니다. 승인까지 1-2일 소요될 수 있습니다.`,
          isExisting: true
        };
      } else {
        // 새로운 댄서 바로 등록
        await this.createNewDancer(userId, data);
        
        return {
          type: 'success',
          message: `댄서 "${data.nickname}"로 성공적으로 등록되었습니다!`,
          isExisting: false
        };
      }
    } catch (error) {
      console.error('댄서 등록 오류:', error);
      throw new Error('댄서 등록 중 오류가 발생했습니다.');
    }
  }

  // 크루 등록
  static async registerCrew(userId: string, data: CrewRegistrationData): Promise<RegistrationResult> {
    try {
      // 1. 기존 크루 데이터 중복 체크
      const existingCrew = await this.checkExistingCrew(data.name);
      
      if (existingCrew) {
        // 기존 크루가 있으면 승인 요청 생성
        await this.createCrewClaimRequest(userId, existingCrew.id, data);
        
        return {
          type: 'pending',
          message: `기존 크루 "${data.name}"에 대한 승인 요청이 관리자에게 전송되었습니다. 승인까지 1-2일 소요될 수 있습니다.`,
          isExisting: true
        };
      } else {
        // 새로운 크루 바로 등록
        await this.createNewCrew(userId, data);
        
        return {
          type: 'success',
          message: `크루 "${data.name}"가 성공적으로 등록되었습니다!`,
          isExisting: false
        };
      }
    } catch (error) {
      console.error('크루 등록 오류:', error);
      throw new Error('크루 등록 중 오류가 발생했습니다.');
    }
  }

  // 기존 댄서 체크 (닉네임 또는 이름으로)
  private static async checkExistingDancer(nickname: string, name: string) {
    const { data, error } = await supabase
      .from('dancers')
      .select('id, nickname, name')
      .or(`nickname.ilike.%${nickname}%,name.ilike.%${name}%`)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return data;
  }

  // 기존 크루 체크 (이름으로)
  private static async checkExistingCrew(name: string) {
    const { data, error } = await supabase
      .from('crews')
      .select('id, name')
      .ilike('name', `%${name}%`)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }

  // 새 댄서 생성
  private static async createNewDancer(userId: string, data: DancerRegistrationData) {
    const { data: dancer, error } = await supabase
      .from('dancers')
      .insert({
        user_id: userId,
        nickname: data.nickname,
        name: data.name,
        genres: data.genres,
        bio: data.bio,
        instagram_url: data.instagramUrl || null,
        youtube_url: data.youtubeUrl || null,
        twitter_url: data.twitterUrl || null,
        is_verified: true, // 새로 등록하는 경우 바로 인증
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return dancer;
  }

  // 새 크루 생성
  private static async createNewCrew(userId: string, data: CrewRegistrationData) {
    const { data: crew, error } = await supabase
      .from('crews')
      .insert({
        user_id: userId,
        name: data.name,
        description: data.description,
        genres: data.genres,
        location: data.location || null,
        instagram_url: data.instagramUrl || null,
        youtube_url: data.youtubeUrl || null,
        is_verified: true, // 새로 등록하는 경우 바로 인증
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return crew;
  }

  // 댄서 클레임 요청 생성
  private static async createDancerClaimRequest(userId: string, dancerId: string, data: DancerRegistrationData) {
    // 기존 요청이 있는지 확인
    const { data: existingRequest } = await supabase
      .from('dancer_claim_requests')
      .select('id')
      .eq('user_id', userId)
      .eq('dancer_id', dancerId)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      throw new Error('이미 해당 댄서에 대한 승인 요청이 진행 중입니다.');
    }

    const { error } = await supabase
      .from('dancer_claim_requests')
      .insert({
        user_id: userId,
        dancer_id: dancerId,
        requested_nickname: data.nickname,
        requested_name: data.name,
        requested_genres: data.genres,
        requested_bio: data.bio,
        requested_instagram_url: data.instagramUrl || null,
        requested_youtube_url: data.youtubeUrl || null,
        requested_twitter_url: data.twitterUrl || null,
        status: 'pending',
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  // 크루 클레임 요청 생성
  private static async createCrewClaimRequest(userId: string, crewId: string, data: CrewRegistrationData) {
    // 기존 요청이 있는지 확인
    const { data: existingRequest } = await supabase
      .from('crew_claim_requests')
      .select('id')
      .eq('user_id', userId)
      .eq('crew_id', crewId)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      throw new Error('이미 해당 크루에 대한 승인 요청이 진행 중입니다.');
    }

    const { error } = await supabase
      .from('crew_claim_requests')
      .insert({
        user_id: userId,
        crew_id: crewId,
        requested_name: data.name,
        requested_description: data.description,
        requested_genres: data.genres,
        requested_location: data.location || null,
        requested_instagram_url: data.instagramUrl || null,
        requested_youtube_url: data.youtubeUrl || null,
        status: 'pending',
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  // 사용자의 등록 상태 확인
  static async getUserRegistrationStatus(userId: string) {
    // 인증된 댄서/크루 확인
    const [dancerResult, crewResult] = await Promise.all([
      supabase
        .from('dancers')
        .select('id, nickname, name, is_verified')
        .eq('user_id', userId)
        .eq('is_verified', true)
        .single(),
      
      supabase
        .from('crews')
        .select('id, name, is_verified')
        .eq('user_id', userId)
        .eq('is_verified', true)
        .single()
    ]);

    // 대기 중인 요청 확인
    const [pendingDancerRequests, pendingCrewRequests] = await Promise.all([
      supabase
        .from('dancer_claim_requests')
        .select(`
          id, 
          requested_nickname, 
          status, 
          created_at,
          dancers:dancer_id (nickname, name)
        `)
        .eq('user_id', userId)
        .eq('status', 'pending'),
      
      supabase
        .from('crew_claim_requests')
        .select(`
          id, 
          requested_name, 
          status, 
          created_at,
          crews:crew_id (name)
        `)
        .eq('user_id', userId)
        .eq('status', 'pending')
    ]);

    return {
      verifiedDancer: dancerResult.data,
      verifiedCrew: crewResult.data,
      pendingDancerRequests: pendingDancerRequests.data || [],
      pendingCrewRequests: pendingCrewRequests.data || []
    };
  }

  // 관리자용: 클레임 요청 승인/거부
  static async approveClaimRequest(requestId: string, type: 'dancer' | 'crew', approved: boolean, reason?: string) {
    const tableName = type === 'dancer' ? 'dancer_claim_requests' : 'crew_claim_requests';
    
    if (approved) {
      // 승인 처리
      const { data: request } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', requestId)
        .single();

      if (!request) throw new Error('요청을 찾을 수 없습니다.');

      // 댄서/크루 테이블에 user_id 연결
      const targetTable = type === 'dancer' ? 'dancers' : 'crews';
      const targetId = type === 'dancer' ? request.dancer_id : request.crew_id;
      
      if (request) {
        await supabase
          .from(targetTable)
          .update({ 
            user_id: request.user_id,
            is_verified: true 
          })
          .eq('id', targetId);
      }

      // 요청 상태 업데이트
      await supabase
        .from(tableName)
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          admin_note: reason
        })
        .eq('id', requestId);
    } else {
      // 거부 처리
      await supabase
        .from(tableName)
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          admin_note: reason
        })
        .eq('id', requestId);
    }
  }
}
