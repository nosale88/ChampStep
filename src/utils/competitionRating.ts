// 대회 등급 및 점수 산정 시스템

export interface CompetitionRating {
  prizePoolScore: number;      // 상금 규모 점수 (0-20)
  judgeCountScore: number;     // 심사위원 수 점수 (0-20)
  participantCountScore: number; // 참가자 수 점수 (0-20)
  editionScore: number;        // 대회 연혁 점수 (0-20)
  totalScore: number;          // 총합 (0-80)
  grade: 'S' | 'A' | 'B' | 'C' | 'D'; // 등급
}

export interface CompetitionMetrics {
  prizePool: number;           // 상금 (만원 단위)
  judgeCount: number;         // 심사위원 수
  participantCount: number;   // 참가자 수
  edition: number;           // 회차
}

// 수상 등급별 점수 획득 비율
export const AWARD_MULTIPLIERS: Record<number, number> = {
  1: 1.0,    // 1등: 100%
  2: 0.7,    // 2등: 70%
  3: 0.5,    // 3등: 50%
  4: 0.3,    // 4등: 30%
  5: 0.2,    // 5등: 20%
  // 6등 이하는 참가점수만 (0.1)
};

// 참가만 했을 때의 기본 점수 비율
export const PARTICIPATION_MULTIPLIER = 0.1; // 10%

/**
 * 상금 규모에 따른 점수 계산
 */
export function calculatePrizePoolScore(prizePoolWon: number): number {
  if (prizePoolWon <= 50) return 5;
  if (prizePoolWon <= 100) return 10;
  if (prizePoolWon <= 300) return 15;
  return 20;
}

/**
 * 심사위원 수에 따른 점수 계산
 */
export function calculateJudgeCountScore(judgeCount: number): number {
  if (judgeCount <= 1) return 5;
  if (judgeCount <= 2) return 10;
  if (judgeCount <= 4) return 15;
  return 20;
}

/**
 * 참가자 수에 따른 점수 계산
 */
export function calculateParticipantCountScore(participantCount: number): number {
  if (participantCount <= 50) return 5;
  if (participantCount <= 100) return 10;
  if (participantCount <= 300) return 15;
  return 20;
}

/**
 * 대회 연혁(회차)에 따른 점수 계산
 */
export function calculateEditionScore(edition: number): number {
  if (edition <= 1) return 5;
  if (edition <= 2) return 8;
  if (edition <= 4) return 12;
  if (edition <= 9) return 16;
  return 20;
}

/**
 * 대회 등급 계산
 */
export function calculateCompetitionGrade(totalScore: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  if (totalScore >= 70) return 'S';  // 70-80점: S등급
  if (totalScore >= 55) return 'A';  // 55-69점: A등급
  if (totalScore >= 40) return 'B';  // 40-54점: B등급
  if (totalScore >= 25) return 'C';  // 25-39점: C등급
  return 'D';                        // 0-24점: D등급
}

/**
 * 대회 전체 등급 산정
 */
export function calculateCompetitionRating(metrics: CompetitionMetrics): CompetitionRating {
  const prizePoolScore = calculatePrizePoolScore(metrics.prizePool);
  const judgeCountScore = calculateJudgeCountScore(metrics.judgeCount);
  const participantCountScore = calculateParticipantCountScore(metrics.participantCount);
  const editionScore = calculateEditionScore(metrics.edition);
  
  const totalScore = prizePoolScore + judgeCountScore + participantCountScore + editionScore;
  const grade = calculateCompetitionGrade(totalScore);

  return {
    prizePoolScore,
    judgeCountScore,
    participantCountScore,
    editionScore,
    totalScore,
    grade
  };
}

/**
 * 수상자가 획득할 점수 계산
 */
export function calculateAwardPoints(
  competitionRating: CompetitionRating,
  rank: number
): number {
  const baseScore = competitionRating.totalScore;
  
  // 6등 이하는 참가점수만
  const multiplier = AWARD_MULTIPLIERS[rank] || PARTICIPATION_MULTIPLIER;
  
  return Math.round(baseScore * multiplier);
}

/**
 * 참가만 한 경우의 점수 계산
 */
export function calculateParticipationPoints(competitionRating: CompetitionRating): number {
  return Math.round(competitionRating.totalScore * PARTICIPATION_MULTIPLIER);
}

/**
 * 대회 등급에 따른 설명 반환
 */
export function getGradeDescription(grade: 'S' | 'A' | 'B' | 'C' | 'D'): string {
  const descriptions = {
    S: '최고 등급 - 프리미엄 대회',
    A: '고급 등급 - 주요 대회',
    B: '중급 등급 - 일반 대회', 
    C: '초급 등급 - 소규모 대회',
    D: '입문 등급 - 신인/지역 대회'
  };
  return descriptions[grade];
}

/**
 * 점수 상세 분석 정보 반환
 */
export function getDetailedRatingAnalysis(
  metrics: CompetitionMetrics,
  rating: CompetitionRating
): {
  analysis: string[];
  suggestions: string[];
} {
  const analysis: string[] = [];
  const suggestions: string[] = [];

  // 상금 분석
  if (rating.prizePoolScore >= 15) {
    analysis.push(`상금 규모가 우수합니다 (${metrics.prizePool}만원)`);
  } else if (rating.prizePoolScore >= 10) {
    analysis.push(`상금 규모가 보통입니다 (${metrics.prizePool}만원)`);
    suggestions.push('상금 규모를 늘리면 대회 등급이 향상됩니다');
  } else {
    analysis.push(`상금 규모가 다소 부족합니다 (${metrics.prizePool}만원)`);
    suggestions.push('상금을 100만원 이상으로 늘리는 것을 권장합니다');
  }

  // 심사위원 분석
  if (rating.judgeCountScore >= 15) {
    analysis.push(`심사위원 구성이 우수합니다 (${metrics.judgeCount}명)`);
  } else {
    analysis.push(`심사위원 수가 부족합니다 (${metrics.judgeCount}명)`);
    suggestions.push('심사위원을 3명 이상으로 구성하는 것을 권장합니다');
  }

  // 참가자 분석
  if (rating.participantCountScore >= 15) {
    analysis.push(`참가자 규모가 우수합니다 (${metrics.participantCount}명)`);
  } else if (rating.participantCountScore >= 10) {
    analysis.push(`참가자 규모가 보통입니다 (${metrics.participantCount}명)`);
  } else {
    analysis.push(`참가자 규모가 작습니다 (${metrics.participantCount}명)`);
    suggestions.push('참가자를 100명 이상 모집하는 것을 목표로 하세요');
  }

  // 연혁 분석
  if (rating.editionScore >= 16) {
    analysis.push(`대회 연혁이 우수합니다 (${metrics.edition}회차)`);
  } else if (rating.editionScore >= 12) {
    analysis.push(`대회가 어느 정도 자리잡았습니다 (${metrics.edition}회차)`);
  } else {
    analysis.push(`신규 대회입니다 (${metrics.edition}회차)`);
    suggestions.push('지속적인 개최로 대회의 전통과 명성을 쌓아가세요');
  }

  return { analysis, suggestions };
}

/**
 * 대회 정보로부터 메트릭스 추출
 */
export function extractCompetitionMetrics(competition: any): CompetitionMetrics {
  // 상금에서 숫자만 추출 (예: "100만원" -> 100)
  const prizeText = competition.prizeDetails || '';
  const prizeMatch = prizeText.match(/(\d+)만원/);
  const prizePool = prizeMatch ? parseInt(prizeMatch[1]) : 0;

  // 심사위원 수
  const judgeCount = competition.judges?.length || 0;

  // 참가자 수 (participantLimit에서 추출)
  const participantCount = typeof competition.participantLimit === 'number' 
    ? competition.participantLimit 
    : 100; // 기본값

  // 대회 회차 (이벤트명에서 추출 시도)
  const eventName = competition.eventName || '';
  const editionMatch = eventName.match(/(\d+)회차|Vol\.?\s*(\d+)|제(\d+)회/i);
  const edition = editionMatch 
    ? parseInt(editionMatch[1] || editionMatch[2] || editionMatch[3]) 
    : 1; // 기본값 1회차

  return {
    prizePool,
    judgeCount,
    participantCount,
    edition
  };
}