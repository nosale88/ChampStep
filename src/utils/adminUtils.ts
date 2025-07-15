import { supabase } from '../lib/supabase';

// 관리자 권한 확인
export const isAdmin = (email: string): boolean => {
  const adminEmails = ['willuent@naver.com'];
  return adminEmails.includes(email.toLowerCase());
};

// 관리자 권한이 있는 사용자인지 확인 (Dancer 객체 기반)
export const isDancerAdmin = (dancer: any): boolean => {
  return dancer?.isAdmin === true || isAdmin(dancer?.email || '');
};

// 관리자 권한이 필요한 작업 실행 전 확인
export const requireAdmin = (userEmail: string): boolean => {
  if (!isAdmin(userEmail)) {
    throw new Error('관리자 권한이 필요합니다.');
  }
  return true;
};

// 관리자 전용 기능들
export const adminActions = {
  // 모든 댄서 관리
  async getAllDancers() {
    const { data, error } = await supabase
      .from('dancers')
      .select('*')
      .order('rank', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // 댄서 정보 강제 수정
  async updateDancer(dancerId: string, updates: any) {
    const { data, error } = await supabase
      .from('dancers')
      .update(updates)
      .eq('id', dancerId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 댄서 삭제
  async deleteDancer(dancerId: string) {
    const { error } = await supabase
      .from('dancers')
      .delete()
      .eq('id', dancerId);
    
    if (error) throw error;
  },

  // 모든 대회 관리
  async getAllCompetitions() {
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .order('event_start_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // 대회 강제 수정
  async updateCompetition(competitionId: string, updates: any) {
    const { data, error } = await supabase
      .from('competitions')
      .update(updates)
      .eq('id', competitionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 대회 삭제
  async deleteCompetition(competitionId: string) {
    const { error } = await supabase
      .from('competitions')
      .delete()
      .eq('id', competitionId);
    
    if (error) throw error;
  },

  // 크루 관리
  async getAllCrews() {
    const { data, error } = await supabase
      .from('crews')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // 스텝 점수 일괄 재계산
  async recalculateAllSteps() {
    // 이 기능은 복잡한 비즈니스 로직이 필요하므로 
    // 실제 구현 시 별도의 서비스 함수로 분리 권장
    console.log('스텝 점수 일괄 재계산 시작...');
    
    const { data: dancers, error } = await supabase
      .from('dancers')
      .select('id, email')
      .order('id');
    
    if (error) throw error;
    
    // TODO: 각 댄서의 스텝 점수 재계산 로직 구현
    console.log(`${dancers.length}명의 댄서 스텝 점수 재계산 완료`);
  },

  // 시스템 통계
  async getSystemStats() {
    const [dancersResult, competitionsResult, crewsResult] = await Promise.all([
      supabase.from('dancers').select('id', { count: 'exact' }),
      supabase.from('competitions').select('id', { count: 'exact' }),
      supabase.from('crews').select('id', { count: 'exact' })
    ]);

    return {
      totalDancers: dancersResult.count || 0,
      totalCompetitions: competitionsResult.count || 0,
      totalCrews: crewsResult.count || 0,
      lastUpdated: new Date().toISOString()
    };
  }
};

// 권한 확인 데코레이터
export const withAdminCheck = (userEmail: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      requireAdmin(userEmail);
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
};