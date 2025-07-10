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
}

export interface CrewSchedule {
  id: string;
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
  avatar?: string;
  backgroundImage?: string; // 랭킹 바에 사용될 배경 이미지
  profileImage?: string; // 랭킹 바에 사용될 인물 이미지
  videos: Video[];
  email?: string;
  bio?: string;
  education?: Education[];
  career?: Career[];
  awards?: Award[];
  performances?: Performance[];
  birthDate?: string;
  phone?: string;
  // 소셜 미디어 URL 추가
  instagramUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
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
}