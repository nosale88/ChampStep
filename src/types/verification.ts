// 댄서 본인 확인을 위한 타입 정의

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type VerificationMethod = 'social_media' | 'crew_recommendation' | 'competition_record' | 'admin_approval';

export interface DancerClaim {
  id: string;
  userId: string;
  dancerId: string;
  claimedAt: Date;
  status: VerificationStatus;
  verificationMethod?: VerificationMethod;
  verifiedAt?: Date;
  rejectedReason?: string;
}

export interface SocialMediaVerification {
  id: string;
  claimId: string;
  platform: 'instagram' | 'youtube' | 'tiktok' | 'twitter';
  handle: string;
  verificationCode: string;
  postUrl?: string;
  submittedAt: Date;
  verifiedAt?: Date;
}

export interface CrewRecommendation {
  id: string;
  claimId: string;
  recommenderUserId: string;
  recommenderDancerId: string;
  message: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface CompetitionEvidence {
  id: string;
  claimId: string;
  competitionId: string;
  evidenceType: 'photo' | 'video' | 'certificate' | 'result_sheet';
  evidenceUrl: string;
  description: string;
  submittedAt: Date;
}

export interface VerificationRequest {
  dancerId: string;
  method: VerificationMethod;
  socialMedia?: {
    platform: string;
    handle: string;
  };
  competition?: {
    competitionId: string;
    evidenceUrl: string;
    description: string;
  };
  message?: string;
}
