import { UserPermission, Dancer, Crew } from '../types';

// 사용자 권한 확인 유틸리티
export class PermissionManager {
  // 댄서 프로필 편집 권한 확인
  static canEditDancer(
    currentUser: { id: string; email: string; role: 'owner' | 'admin' | 'user' },
    dancer: Dancer,
    permissions?: UserPermission[]
  ): boolean {
    // 관리자는 모든 권한
    if (currentUser.role === 'admin') {
      return true;
    }

    // 본인의 프로필인 경우
    if (dancer.email === currentUser.email) {
      return true;
    }

    // 명시적 권한이 있는 경우
    if (permissions) {
      const userPermission = permissions.find(
        p => p.userId === currentUser.id && 
            p.targetType === 'dancer' && 
            p.targetId === dancer.id
      );
      return userPermission?.canEdit || false;
    }

    return false;
  }

  // 크루 프로필 편집 권한 확인
  static canEditCrew(
    currentUser: { id: string; email: string; role: 'owner' | 'admin' | 'user' },
    crew: Crew,
    permissions?: UserPermission[]
  ): boolean {
    // 관리자는 모든 권한
    if (currentUser.role === 'admin') {
      return true;
    }

    // 크루 멤버인 경우 (크루장 또는 편집 권한이 있는 멤버)
    const isMember = crew.members?.some(member => member.email === currentUser.email);
    if (isMember) {
      // 추가적으로 크루 내 역할 확인 로직 필요
      return true;
    }

    // 명시적 권한이 있는 경우
    if (permissions) {
      const userPermission = permissions.find(
        p => p.userId === currentUser.id && 
            p.targetType === 'crew' && 
            p.targetId === crew.id
      );
      return userPermission?.canEdit || false;
    }

    return false;
  }

  // 댓글 작성 권한 확인
  static canComment(
    currentUser: { id: string; email: string; role: 'owner' | 'admin' | 'user' },
    targetType: 'dancer' | 'crew',
    targetId: string,
    permissions?: UserPermission[]
  ): boolean {
    // 로그인한 사용자는 기본적으로 댓글 작성 가능
    if (!currentUser) {
      return false;
    }

    // 관리자는 모든 권한
    if (currentUser.role === 'admin') {
      return true;
    }

    // 명시적으로 댓글 권한이 제한된 경우 확인
    if (permissions) {
      const userPermission = permissions.find(
        p => p.userId === currentUser.id && 
            p.targetType === targetType && 
            p.targetId === targetId
      );
      
      // 권한이 명시적으로 설정된 경우 해당 권한 따름
      if (userPermission) {
        return userPermission.canComment;
      }
    }

    // 기본적으로 댓글 작성 허용
    return true;
  }

  // 댓글 삭제/수정 권한 확인
  static canModifyComment(
    currentUser: { id: string; email: string; role: 'owner' | 'admin' | 'user' },
    commentAuthorId: string,
    commentAuthorEmail?: string
  ): boolean {
    // 관리자는 모든 권한
    if (currentUser.role === 'admin') {
      return true;
    }

    // 본인의 댓글인 경우
    if (currentUser.id === commentAuthorId || currentUser.email === commentAuthorEmail) {
      return true;
    }

    return false;
  }

  // 권한 생성
  static createPermission(
    userId: string,
    userEmail: string,
    targetType: 'dancer' | 'crew',
    targetId: string,
    role: 'owner' | 'admin' | 'editor' | 'viewer'
  ): UserPermission {
    const basePermissions = {
      owner: { canEdit: true, canDelete: true, canComment: true },
      admin: { canEdit: true, canDelete: true, canComment: true },
      editor: { canEdit: true, canDelete: false, canComment: true },
      viewer: { canEdit: false, canDelete: false, canComment: true }
    };

    return {
      userId,
      userEmail,
      targetType,
      targetId,
      role,
      ...basePermissions[role]
    };
  }

  // 사용자 역할 확인
  static getUserRole(
    currentUser: { id: string; email: string; role: 'owner' | 'admin' | 'user' },
    targetType: 'dancer' | 'crew',
    target: Dancer | Crew
  ): 'owner' | 'admin' | 'member' | 'viewer' {
    if (currentUser.role === 'admin') {
      return 'admin';
    }

    if (targetType === 'dancer') {
      const dancer = target as Dancer;
      if (dancer.email === currentUser.email) {
        return 'owner';
      }
    } else if (targetType === 'crew') {
      const crew = target as Crew;
      const isMember = crew.members?.some(member => member.email === currentUser.email);
      if (isMember) {
        return 'member';
      }
    }

    return 'viewer';
  }
}

// 권한 확인을 위한 Hook (React Context와 함께 사용)
export const usePermissions = () => {
  // 현재 사용자 정보를 Context에서 가져오는 로직
  // 실제 구현에서는 AuthContext나 UserContext에서 가져와야 함
  const getCurrentUser = () => {
    // 임시 구현 - 실제로는 인증 시스템에서 가져와야 함
    return {
      id: 'current-user-id',
      email: 'user@example.com',
      role: 'user' as const
    };
  };

  const currentUser = getCurrentUser();

  return {
    currentUser,
    canEditDancer: (dancer: Dancer, permissions?: UserPermission[]) => 
      PermissionManager.canEditDancer(currentUser, dancer, permissions),
    canEditCrew: (crew: Crew, permissions?: UserPermission[]) => 
      PermissionManager.canEditCrew(currentUser, crew, permissions),
    canComment: (targetType: 'dancer' | 'crew', targetId: string, permissions?: UserPermission[]) => 
      PermissionManager.canComment(currentUser, targetType, targetId, permissions),
    canModifyComment: (commentAuthorId: string, commentAuthorEmail?: string) => 
      PermissionManager.canModifyComment(currentUser, commentAuthorId, commentAuthorEmail),
    getUserRole: (targetType: 'dancer' | 'crew', target: Dancer | Crew) => 
      PermissionManager.getUserRole(currentUser, targetType, target)
  };
};
