export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  description?: string; // 추가
  type: 'performance' | 'battle' | 'highlight' | 'recap' | 'interview';
  competitionId?: string;
  dancerId?: string;
  uploadDate: string;
}

export interface Participant {
  dancerId: string;
  dancer: Dancer;
  position: number;
  points: number;
}

export interface Judge {
  id: string;
  type: 'dancer' | 'crew';
  name: string;
  role: 'main_judge' | 'sub_judge' | 'guest_judge';
  dancerId?: string;
  crewId?: string;
}

export interface Guest {
  id: string;
  type: 'dancer' | 'crew';
  name: string;
  role: 'special_guest' | 'mc' | 'dj' | 'host' | 'performer';
  dancerId?: string;
  crewId?: string;
}

export interface Winner {
  id: string;
  type: 'dancer' | 'crew';
  name: string;
  rank: number;
  category?: string; // 배틀 카테고리나 부문
  points?: number;
  prize?: string;
  dancerId?: string;
  crewId?: string;
}

export interface Competition {
  id: string;
  managerName: string;
  managerContact: string;
  managerEmail: string;
  eventName: string;
  genres: string[];
  venue: string;
  eventStartDate: string;
  eventEndDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  participationType: 'individual' | 'team';
  participantLimit: number | 'unlimited';
  isParticipantListPublic: boolean;
  usePreliminaries: boolean;
  prelimFormat?: 'scoring' | 'tournament';
  finalistCount?: number;
  prizeDetails: string;
  ageRequirement: string;
  regionRequirement: string;
  entryFee: string;
  audienceLimit: number | 'unlimited';
  audienceFee: string;
  dateMemo?: string;
  detailedDescription: string;
  poster?: string;
  link?: string;
  participants: Participant[];
  videos?: Video[];
  teamSize?: number;
  isPrelimGroupTournament?: boolean;
  // 새로 추가된 필드들
  judges?: Judge[];
  guests?: Guest[];
  winners?: Winner[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
  // 스텝 점수 계산을 위한 필드들
  prizeAmount?: number; // 상금 규모 (원)
  judgeCount?: number; // 심사위원 수
  participantCount?: number; // 참가자 수
  editionNumber?: number; // 대회 회차
  totalSteps?: number; // 계산된 총 스텝 점수
  stepCalculation?: StepCalculation; // 스텝 계산 상세 정보
}

export interface StepCalculation {
  prizeSteps: number; // 상금 규모 점수 (최대 20점)
  judgeSteps: number; // 심사위원 수 점수 (최대 20점)
  participantSteps: number; // 참가자 수 점수 (최대 20점)
  editionSteps: number; // 대회 연혁 점수 (최대 20점)
  totalSteps: number; // 총 스텝 점수 (최대 80점)
  calculatedAt: string; // 계산 일시
}

export interface StepReward {
  rank: number; // 순위 (1등, 2등, 3등)
  percentage: number; // 획득 스텝 비율 (%)
  steps: number; // 실제 획득한 스텝 점수
}

export interface CrewSchedule {
  id: string;
  crewId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'practice' | 'performance' | 'meeting' | 'workshop' | 'competition';
  isPublic: boolean;
  createdBy: string; // dancer ID
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  authorName: string;
  authorEmail?: string;
  targetType: 'dancer' | 'crew';
  targetId: string;
  isPublic: boolean;
  createdAt: string;
}

// 댓글 시스템을 위한 새로운 타입들
export interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorEmail?: string;
  authorId?: string;
  targetType: 'dancer' | 'crew';
  targetId: string;
  mentions: Mention[];
  parentId?: string; // 대댓글을 위한 필드
  replies?: Comment[];
  createdAt: string;
  updatedAt?: string;
}

export interface Mention {
  id: string;
  type: 'dancer' | 'crew';
  name: string;
  startIndex: number;
  endIndex: number;
}

export interface UserPermission {
  userId: string;
  userEmail: string;
  targetType: 'dancer' | 'crew';
  targetId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  canEdit: boolean;
  canDelete: boolean;
  canComment: boolean;
}

export interface Crew {
  id: string;
  name: string;
  genre: string;
  introduction: string;
  members: Dancer[]; // Array of dancer objects
  schedules: CrewSchedule[];
  avatar?: string;
  backgroundImage?: string; // 크루 카드에 사용될 배경 이미지
  createdAt: string;
  member_count?: number; // 크루 생성 시 사용
}

export interface Dancer {
  id: string;
  nickname: string;
  name: string;
  crew?: string; // crew name from database
  genres: string[];
  sns?: string;
  competitions: Competition[];
  totalPoints: number;
  rank: number;
  stepScore?: number; // 스텝 점수 추가
  avatar?: string;
  backgroundImage?: string; // 스텝 바에 사용될 배경 이미지
  profileImage?: string; // 스텝 바에 사용될 인물 이미지
  videos: Video[];
  email?: string;
  bio?: string;
  education?: Education[];
  career?: Career[];
  awards?: Award[];
  performances?: Performance[];
  lectures?: Lecture[];
  choreographies?: Choreography[];
  birthDate?: string;
  phone?: string;
  // 소셜 미디어 URL 추가
  instagramUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  // 관리자 권한 추가
  isAdmin?: boolean;
}

export interface Education {
  id: string | number;
  school: string;
  major: string;
  period: string;
  degree: string;
}

export interface Career {
  id: string | number;
  company: string;
  position: string;
  period: string;
  description: string;
}

export interface Award {
  id: string | number;
  name: string;
  rank: string;
  date: string;
  organizer: string;
}

export interface Performance {
  id: string | number;
  name: string;
  role: string;
  date: string;
  location: string;
  description?: string;
  category?: 'performance' | 'lecture' | 'choreography';
}

export interface Lecture {
  id: string | number;
  title: string;
  institution: string;
  date: string;
  duration: string;
  participants: number;
  description?: string;
}

export interface Choreography {
  id: string | number;
  title: string;
  client: string;
  date: string;
  genre: string;
  description?: string;
  videoUrl?: string;
}

// 계정 연동 관련 타입들
export interface ProfileRequest {
  id: string;
  userId: string; // Auth 사용자 ID
  requestType: 'dancer' | 'crew';
  targetId: string; // 연동하려는 댄서 또는 크루 ID
  targetName: string; // 연동하려는 댄서 또는 크루 이름
  message?: string; // 사용자가 작성한 메시지
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string; // 관리자 메모
  createdAt: string;
  updatedAt: string;
}

export interface AccountLink {
  id: string;
  userId: string; // Auth 사용자 ID
  linkType: 'dancer' | 'crew';
  linkedId: string; // 연동된 댄서 또는 크루 ID
  isActive: boolean;
  createdAt: string;
  approvedBy?: string; // 승인한 관리자 ID
  approvedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'user' | 'admin';
  accountLinks: AccountLink[];
  createdAt: string;
}