import { supabase } from '../lib/supabase';
import { DancerClaim, VerificationRequest, VerificationStatus } from '../types/verification';

export class VerificationService {
  
  // 댄서 프로필 클레임 요청
  static async claimDancerProfile(userId: string, dancerId: string, request: VerificationRequest): Promise<DancerClaim> {
    // 1. 이미 클레임된 프로필인지 확인
    const { data: existingClaim } = await supabase
      .from('dancer_claims')
      .select('*')
      .eq('dancer_id', dancerId)
      .eq('status', 'verified')
      .single();

    if (existingClaim) {
      throw new Error('이미 인증된 댄서 프로필입니다.');
    }

    // 2. 사용자의 기존 클레임 확인
    const { data: userClaim } = await supabase
      .from('dancer_claims')
      .select('*')
      .eq('user_id', userId)
      .eq('dancer_id', dancerId)
      .in('status', ['pending', 'verified'])
      .single();

    if (userClaim) {
      throw new Error('이미 요청하신 댄서 프로필입니다.');
    }

    // 3. 새 클레임 생성
    const { data: claim, error } = await supabase
      .from('dancer_claims')
      .insert({
        user_id: userId,
        dancer_id: dancerId,
        status: 'pending',
        verification_method: request.method,
        claimed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // 4. 인증 방법별 추가 데이터 저장
    switch (request.method) {
      case 'social_media':
        if (request.socialMedia) {
          await this.createSocialMediaVerification(claim.id, request.socialMedia);
        }
        break;
      case 'competition_record':
        if (request.competition) {
          await this.createCompetitionEvidence(claim.id, request.competition);
        }
        break;
    }

    return claim;
  }

  // 소셜 미디어 인증 생성
  private static async createSocialMediaVerification(claimId: string, socialData: any) {
    const verificationCode = this.generateVerificationCode();
    
    const { error } = await supabase
      .from('social_media_verifications')
      .insert({
        claim_id: claimId,
        platform: socialData.platform,
        handle: socialData.handle,
        verification_code: verificationCode,
        submitted_at: new Date().toISOString()
      });

    if (error) throw error;
    return verificationCode;
  }

  // 대회 증거 자료 생성
  private static async createCompetitionEvidence(claimId: string, competitionData: any) {
    const { error } = await supabase
      .from('competition_evidences')
      .insert({
        claim_id: claimId,
        competition_id: competitionData.competitionId,
        evidence_url: competitionData.evidenceUrl,
        description: competitionData.description,
        evidence_type: 'photo',
        submitted_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  // 크루 멤버 추천
  static async recommendDancer(recommenderUserId: string, claimId: string, message: string) {
    // 추천자가 인증된 댄서인지 확인
    const { data: recommender } = await supabase
      .from('dancer_claims')
      .select('dancer_id')
      .eq('user_id', recommenderUserId)
      .eq('status', 'verified')
      .single();

    if (!recommender) {
      throw new Error('인증된 댄서만 추천할 수 있습니다.');
    }

    const { error } = await supabase
      .from('crew_recommendations')
      .insert({
        claim_id: claimId,
        recommender_user_id: recommenderUserId,
        recommender_dancer_id: recommender.dancer_id,
        message,
        submitted_at: new Date().toISOString(),
        status: 'pending'
      });

    if (error) throw error;
  }

  // 관리자 승인/거부
  static async updateClaimStatus(claimId: string, status: VerificationStatus, reason?: string) {
    const updateData: any = {
      status,
      verified_at: status === 'verified' ? new Date().toISOString() : null
    };

    if (reason) {
      updateData.rejected_reason = reason;
    }

    const { error } = await supabase
      .from('dancer_claims')
      .update(updateData)
      .eq('id', claimId);

    if (error) throw error;

    // 승인된 경우 사용자 권한 업데이트
    if (status === 'verified') {
      await this.grantDancerPermission(claimId);
    }
  }

  // 댄서 권한 부여
  private static async grantDancerPermission(claimId: string) {
    const { data: claim } = await supabase
      .from('dancer_claims')
      .select('user_id, dancer_id')
      .eq('id', claimId)
      .single();

    if (claim) {
      // dancers 테이블에 user_id 연결
      await supabase
        .from('dancers')
        .update({ user_id: claim.user_id })
        .eq('id', claim.dancer_id);
    }
  }

  // 사용자의 클레임 상태 확인
  static async getUserClaims(userId: string): Promise<DancerClaim[]> {
    const { data, error } = await supabase
      .from('dancer_claims')
      .select(`
        *,
        dancers:dancer_id (
          nickname,
          name,
          avatar
        )
      `)
      .eq('user_id', userId)
      .order('claimed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // 인증 코드 생성
  private static generateVerificationCode(): string {
    return `CHAMPSTEP_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  // 자동 승인 조건 확인 (크루 추천 2개 이상)
  static async checkAutoApproval(claimId: string) {
    const { data: recommendations } = await supabase
      .from('crew_recommendations')
      .select('*')
      .eq('claim_id', claimId)
      .eq('status', 'approved');

    if (recommendations && recommendations.length >= 2) {
      await this.updateClaimStatus(claimId, 'verified', 'Auto-approved by crew recommendations');
    }
  }
}
