import { Competition, StepCalculation, StepReward } from '../types';

/**
 * 대회 스텝 점수 계산 유틸리티
 */

// 상금 규모별 점수 (최대 20점)
export const calculatePrizeSteps = (prizeAmount: number): number => {
  if (prizeAmount <= 500000) return 5;      // 50만원 이하: 5점
  if (prizeAmount <= 1000000) return 10;    // 100만원 이하: 10점
  if (prizeAmount <= 3000000) return 15;    // 300만원 이하: 15점
  return 20;                                // 300만원 초과: 20점
};

// 심사위원 수별 점수 (최대 20점)
export const calculateJudgeSteps = (judgeCount: number): number => {
  if (judgeCount <= 1) return 5;           // 1명: 5점
  if (judgeCount <= 3) return 10;          // 3명 이하: 10점
  if (judgeCount <= 5) return 15;          // 5명 이하: 15점
  return 20;                               // 5명 초과: 20점
};

// 참가자 수별 점수 (최대 20점)
export const calculateParticipantSteps = (participantCount: number): number => {
  if (participantCount <= 50) return 5;    // 50명 이하: 5점
  if (participantCount <= 100) return 10;  // 100명 이하: 10점
  if (participantCount <= 300) return 15;  // 300명 이하: 15점
  return 20;                               // 300명 초과: 20점
};

// 대회 연혁(회차)별 점수 (최대 20점)
export const calculateEditionSteps = (editionNumber: number): number => {
  if (editionNumber <= 1) return 5;        // 1회차: 5점
  if (editionNumber <= 3) return 10;       // 3회차 이하: 10점
  if (editionNumber <= 5) return 15;       // 5회차 이하: 15점
  return 20;                               // 5회차 초과: 20점
};

// 순위별 획득 점수 비율
export const getRankingPercentage = (rank: number): number => {
  switch (rank) {
    case 1: return 100; // 1등: 100%
    case 2: return 70;  // 2등: 70%
    case 3: return 50;  // 3등: 50%
    default: return 0;  // 기타: 0%
  }
};

// 대회 총 스텝 점수 계산
export const calculateCompetitionSteps = (competition: Competition): StepCalculation => {
  const prizeSteps = calculatePrizeSteps(competition.prizeAmount || 0);
  const judgeSteps = calculateJudgeSteps(competition.judgeCount || 0);
  const participantSteps = calculateParticipantSteps(competition.participantCount || 0);
  const editionSteps = calculateEditionSteps(competition.editionNumber || 1);
  
  const totalSteps = prizeSteps + judgeSteps + participantSteps + editionSteps;
  
  return {
    prizeSteps,
    judgeSteps,
    participantSteps,
    editionSteps,
    totalSteps,
    calculatedAt: new Date().toISOString()
  };
};

// 순위별 실제 획득 스텝 점수 계산
export const calculateStepReward = (
  totalCompetitionSteps: number, 
  rank: number
): StepReward => {
  const percentage = getRankingPercentage(rank);
  const steps = Math.round((totalCompetitionSteps * percentage) / 100);
  
  return {
    rank,
    percentage,
    steps
  };
};

// 대회 정보를 기반으로 모든 순위의 보상 계산
export const calculateAllStepRewards = (competition: Competition): StepReward[] => {
  const stepCalculation = calculateCompetitionSteps(competition);
  const totalSteps = stepCalculation.totalSteps;
  
  return [1, 2, 3].map(rank => calculateStepReward(totalSteps, rank));
};

// 대회 스텝 점수 상세 정보 포맷팅
export const formatStepCalculationDetails = (calculation: StepCalculation): string => {
  return `
스텝 점수 계산 상세:
• 상금 규모: ${calculation.prizeSteps}점 (최대 20점)
• 심사위원 수: ${calculation.judgeSteps}점 (최대 20점)  
• 참가자 수: ${calculation.participantSteps}점 (최대 20점)
• 대회 연혁: ${calculation.editionSteps}점 (최대 20점)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
총 스텝 점수: ${calculation.totalSteps}점 (최대 80점)

순위별 획득 점수:
• 1등: ${Math.round(calculation.totalSteps * 1.0)}점 (100%)
• 2등: ${Math.round(calculation.totalSteps * 0.7)}점 (70%)
• 3등: ${Math.round(calculation.totalSteps * 0.5)}점 (50%)
  `.trim();
};

// 대회 등급 분류 (스텝 점수 기준)
export const getCompetitionGrade = (totalSteps: number): string => {
  if (totalSteps >= 70) return 'S급'; // 70점 이상
  if (totalSteps >= 60) return 'A급'; // 60-69점
  if (totalSteps >= 50) return 'B급'; // 50-59점
  if (totalSteps >= 40) return 'C급'; // 40-49점
  return 'D급'; // 40점 미만
};

// 대회 스텝 점수 기준 설명
export const getStepCriteriaExplanation = (): string => {
  return `
ChampStep 대회 스텝 점수 책정 기준:

1. 상금 규모 (최대 20점)
   • 50만원 이하: 5점
   • 100만원 이하: 10점  
   • 300만원 이하: 15점
   • 300만원 초과: 20점

2. 심사위원 수 (최대 20점)
   • 1명: 5점
   • 3명 이하: 10점
   • 5명 이하: 15점
   • 5명 초과: 20점

3. 참가자 수 (최대 20점)
   • 50명 이하: 5점
   • 100명 이하: 10점
   • 300명 이하: 15점
   • 300명 초과: 20점

4. 대회 연혁/회차 (최대 20점)
   • 1회차: 5점
   • 3회차 이하: 10점
   • 5회차 이하: 15점
   • 5회차 초과: 20점

총 스텝 점수: 최대 80점
순위별 획득률: 1등(100%), 2등(70%), 3등(50%)

대회 등급:
S급(70점 이상), A급(60-69점), B급(50-59점), C급(40-49점), D급(40점 미만)
  `.trim();
};
