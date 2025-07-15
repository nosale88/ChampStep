import { supabase } from '../lib/supabase';
import { ProfileRequest, AccountLink, User } from '../types';

// 프로필 연동 요청 생성
export async function createProfileRequest(
  request: Omit<ProfileRequest, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ProfileRequest> {
  const { data, error } = await supabase
    .from('profile_requests')
    .insert({
      user_id: request.userId,
      request_type: request.requestType,
      target_id: request.targetId,
      target_name: request.targetName,
      message: request.message,
      status: request.status
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    requestType: data.request_type,
    targetId: data.target_id,
    targetName: data.target_name,
    message: data.message,
    status: data.status,
    adminNote: data.admin_note,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

// 사용자의 프로필 요청 목록 조회
export async function getUserProfileRequests(userId: string): Promise<ProfileRequest[]> {
  const { data, error } = await supabase
    .from('profile_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(item => ({
    id: item.id,
    userId: item.user_id,
    requestType: item.request_type,
    targetId: item.target_id,
    targetName: item.target_name,
    message: item.message,
    status: item.status,
    adminNote: item.admin_note,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
}

// 모든 프로필 요청 조회 (관리자용)
export async function getAllProfileRequests(): Promise<ProfileRequest[]> {
  const { data, error } = await supabase
    .from('profile_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(item => ({
    id: item.id,
    userId: item.user_id,
    requestType: item.request_type,
    targetId: item.target_id,
    targetName: item.target_name,
    message: item.message,
    status: item.status,
    adminNote: item.admin_note,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
}

// 프로필 요청 승인/거부
export async function updateProfileRequestStatus(
  requestId: string,
  status: 'approved' | 'rejected',
  adminNote?: string
): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  // 요청 상태 업데이트
  const { error: updateError } = await supabase
    .from('profile_requests')
    .update({
      status,
      admin_note: adminNote,
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId);

  if (updateError) throw updateError;

  // 승인된 경우 계정 연동 생성
  if (status === 'approved') {
    const { data: requestData } = await supabase
      .from('profile_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestData) {
      await createAccountLink({
        userId: requestData.user_id,
        linkType: requestData.request_type,
        linkedId: requestData.target_id,
        isActive: true,
        approvedBy: userData.user.id,
        approvedAt: new Date().toISOString()
      });
    }
  }

  return true;
}

// 계정 연동 생성
export async function createAccountLink(
  link: Omit<AccountLink, 'id' | 'createdAt'>
): Promise<AccountLink> {
  const { data, error } = await supabase
    .from('account_links')
    .insert({
      user_id: link.userId,
      link_type: link.linkType,
      linked_id: link.linkedId,
      is_active: link.isActive,
      approved_by: link.approvedBy,
      approved_at: link.approvedAt
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    linkType: data.link_type,
    linkedId: data.linked_id,
    isActive: data.is_active,
    createdAt: data.created_at,
    approvedBy: data.approved_by,
    approvedAt: data.approved_at
  };
}

// 사용자의 계정 연동 정보 조회
export async function getUserAccountLinks(userId: string): Promise<AccountLink[]> {
  const { data, error } = await supabase
    .from('account_links')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) throw error;

  return (data || []).map(item => ({
    id: item.id,
    userId: item.user_id,
    linkType: item.link_type,
    linkedId: item.linked_id,
    isActive: item.is_active,
    createdAt: item.created_at,
    approvedBy: item.approved_by,
    approvedAt: item.approved_at
  }));
}

// 사용자가 특정 댄서/크루를 편집할 권한이 있는지 확인
export async function hasEditPermission(userId: string, targetType: 'dancer' | 'crew', targetId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('account_links')
    .select('id')
    .eq('user_id', userId)
    .eq('link_type', targetType)
    .eq('linked_id', targetId)
    .eq('is_active', true)
    .single();

  if (error) return false;
  return !!data;
}

// 댄서 정보 업데이트 (권한 체크 포함)
export async function updateDancerProfile(
  userId: string,
  dancerId: string,
  updates: any
): Promise<boolean> {
  // 권한 확인
  const hasPermission = await hasEditPermission(userId, 'dancer', dancerId);
  if (!hasPermission) {
    throw new Error('이 댄서 프로필을 편집할 권한이 없습니다.');
  }

  const { error } = await supabase
    .from('dancers')
    .update(updates)
    .eq('id', dancerId);

  if (error) throw error;
  return true;
}

// 크루 정보 업데이트 (권한 체크 포함)
export async function updateCrewProfile(
  userId: string,
  crewId: string,
  updates: any
): Promise<boolean> {
  // 권한 확인
  const hasPermission = await hasEditPermission(userId, 'crew', crewId);
  if (!hasPermission) {
    throw new Error('이 크루 프로필을 편집할 권한이 없습니다.');
  }

  const { error } = await supabase
    .from('crews')
    .update(updates)
    .eq('id', crewId);

  if (error) throw error;
  return true;
}

// 수상 이력 추가 (권한 체크 포함)
export async function addAwardToDancer(
  userId: string,
  dancerId: string,
  award: {
    name: string;
    rank: string;
    date: string;
    organizer: string;
  }
): Promise<boolean> {
  // 권한 확인
  const hasPermission = await hasEditPermission(userId, 'dancer', dancerId);
  if (!hasPermission) {
    throw new Error('이 댄서의 수상 이력을 추가할 권한이 없습니다.');
  }

  const { error } = await supabase
    .from('dancer_awards')
    .insert({
      dancer_id: dancerId,
      name: award.name,
      rank: award.rank,
      date: award.date,
      organizer: award.organizer
    });

  if (error) throw error;
  return true;
}

// 공연 이력 추가 (권한 체크 포함)
export async function addPerformanceToDancer(
  userId: string,
  dancerId: string,
  performance: {
    name: string;
    role: string;
    date: string;
    location: string;
    description?: string;
  }
): Promise<boolean> {
  // 권한 확인
  const hasPermission = await hasEditPermission(userId, 'dancer', dancerId);
  if (!hasPermission) {
    throw new Error('이 댄서의 공연 이력을 추가할 권한이 없습니다.');
  }

  const { error } = await supabase
    .from('dancer_performances')
    .insert({
      dancer_id: dancerId,
      name: performance.name,
      role: performance.role,
      date: performance.date,
      location: performance.location,
      description: performance.description
    });

  if (error) throw error;
  return true;
}

// 강의 이력 추가 (권한 체크 포함)
export async function addLectureToDancer(
  userId: string,
  dancerId: string,
  lecture: {
    title: string;
    institution: string;
    date: string;
    duration: string;
    participants: number;
    description?: string;
  }
): Promise<boolean> {
  // 권한 확인
  const hasPermission = await hasEditPermission(userId, 'dancer', dancerId);
  if (!hasPermission) {
    throw new Error('이 댄서의 강의 이력을 추가할 권한이 없습니다.');
  }

  const { error } = await supabase
    .from('dancer_lectures')
    .insert({
      dancer_id: dancerId,
      title: lecture.title,
      institution: lecture.institution,
      date: lecture.date,
      duration: lecture.duration,
      participants: lecture.participants,
      description: lecture.description
    });

  if (error) throw error;
  return true;
}

// 연출 이력 추가 (권한 체크 포함)
export async function addChoreographyToDancer(
  userId: string,
  dancerId: string,
  choreography: {
    title: string;
    client: string;
    date: string;
    genre: string;
    description?: string;
    videoUrl?: string;
  }
): Promise<boolean> {
  // 권한 확인
  const hasPermission = await hasEditPermission(userId, 'dancer', dancerId);
  if (!hasPermission) {
    throw new Error('이 댄서의 연출 이력을 추가할 권한이 없습니다.');
  }

  const { error } = await supabase
    .from('dancer_choreographies')
    .insert({
      dancer_id: dancerId,
      title: choreography.title,
      client: choreography.client,
      date: choreography.date,
      genre: choreography.genre,
      description: choreography.description,
      video_url: choreography.videoUrl
    });

  if (error) throw error;
  return true;
}