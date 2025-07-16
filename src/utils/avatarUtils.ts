// 기본 아바타 이미지 설정
export const DEFAULT_AVATAR_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSI0IiB5PSI0IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDIxdi0yYTQgNCAwIDAgMC00LTRIOGE0IDQgMCAwIDAtNCA0djIiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSI5IiByPSI0IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo8L3N2Zz4KPC9zdmc+';

/**
 * 기본 아바타 URL을 반환합니다.
 * @param userId 사용자 ID (사용하지 않지만 기존 코드와의 호환성을 위해 유지)
 * @returns 기본 people icon SVG 이미지 URL
 */
export const getDefaultAvatarUrl = (userId?: string): string => {
  return DEFAULT_AVATAR_URL;
};

/**
 * 아바타 URL을 검증하고 기본값을 반환합니다.
 * @param avatarUrl 검증할 아바타 URL
 * @param userId 사용자 ID
 * @returns 유효한 아바타 URL 또는 기본 아바타 URL
 */
export const getValidAvatarUrl = (avatarUrl?: string | null, userId?: string): string => {
  if (avatarUrl && avatarUrl.trim() !== '') {
    return avatarUrl;
  }
  return getDefaultAvatarUrl(userId);
};
