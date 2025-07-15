import React, { useState, useEffect } from 'react';
import { Competition, StepCalculation, StepReward } from '../types';
import {
  calculateCompetitionSteps,
  calculateAllStepRewards,
  formatStepCalculationDetails,
  getCompetitionGrade,
  getStepCriteriaExplanation
} from '../utils/stepCalculator';

interface StepCalculatorProps {
  competition?: Competition;
  onCalculationChange?: (calculation: StepCalculation) => void;
}

const StepCalculator: React.FC<StepCalculatorProps> = ({ 
  competition, 
  onCalculationChange 
}) => {
  const [formData, setFormData] = useState({
    prizeAmount: competition?.prizeAmount || 0,
    judgeCount: competition?.judgeCount || 1,
    participantCount: competition?.participantCount || 0,
    editionNumber: competition?.editionNumber || 1
  });

  const [calculation, setCalculation] = useState<StepCalculation | null>(null);
  const [stepRewards, setStepRewards] = useState<StepReward[]>([]);
  const [showCriteria, setShowCriteria] = useState(false);

  // 계산 실행
  const performCalculation = () => {
    const tempCompetition: Competition = {
      ...competition,
      prizeAmount: formData.prizeAmount,
      judgeCount: formData.judgeCount,
      participantCount: formData.participantCount,
      editionNumber: formData.editionNumber
    } as Competition;

    const stepCalc = calculateCompetitionSteps(tempCompetition);
    const rewards = calculateAllStepRewards(tempCompetition);

    setCalculation(stepCalc);
    setStepRewards(rewards);
    
    if (onCalculationChange) {
      onCalculationChange(stepCalc);
    }
  };

  // 폼 데이터 변경 시 자동 계산
  useEffect(() => {
    performCalculation();
  }, [formData]);

  const handleInputChange = (field: keyof typeof formData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ChampStep 대회 스텝 점수 계산기
        </h2>
        <button
          onClick={() => setShowCriteria(!showCriteria)}
          className="text-blue-600 hover:text-blue-800 underline text-sm"
        >
          {showCriteria ? '기준 숨기기' : '점수 책정 기준 보기'}
        </button>
      </div>

      {showCriteria && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
            {getStepCriteriaExplanation()}
          </pre>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 입력 폼 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">대회 정보 입력</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              상금 규모 (원)
            </label>
            <input
              type="number"
              value={formData.prizeAmount}
              onChange={(e) => handleInputChange('prizeAmount', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 1000000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              심사위원 수 (명)
            </label>
            <input
              type="number"
              value={formData.judgeCount}
              onChange={(e) => handleInputChange('judgeCount', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              참가자 수 (명)
            </label>
            <input
              type="number"
              value={formData.participantCount}
              onChange={(e) => handleInputChange('participantCount', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              대회 회차
            </label>
            <input
              type="number"
              value={formData.editionNumber}
              onChange={(e) => handleInputChange('editionNumber', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>
        </div>

        {/* 계산 결과 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">계산 결과</h3>
          
          {calculation && (
            <div className="space-y-3">
              {/* 총 스텝 점수 및 등급 */}
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold text-blue-800">
                    총 스텝 점수: {calculation.totalSteps}점
                  </span>
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                    {getCompetitionGrade(calculation.totalSteps)}
                  </span>
                </div>
                <div className="text-sm text-blue-600">
                  최대 80점 중 {calculation.totalSteps}점 ({Math.round((calculation.totalSteps / 80) * 100)}%)
                </div>
              </div>

              {/* 세부 점수 */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-600">상금 규모</div>
                  <div className="text-lg font-bold text-gray-800">
                    {calculation.prizeSteps}점
                  </div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-600">심사위원 수</div>
                  <div className="text-lg font-bold text-gray-800">
                    {calculation.judgeSteps}점
                  </div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-600">참가자 수</div>
                  <div className="text-lg font-bold text-gray-800">
                    {calculation.participantSteps}점
                  </div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-600">대회 연혁</div>
                  <div className="text-lg font-bold text-gray-800">
                    {calculation.editionSteps}점
                  </div>
                </div>
              </div>

              {/* 순위별 획득 점수 */}
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">순위별 획득 점수</h4>
                <div className="space-y-2">
                  {stepRewards.map((reward) => (
                    <div 
                      key={reward.rank}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span className="font-medium">
                        {reward.rank}등
                      </span>
                      <span className="text-sm text-gray-600">
                        {reward.percentage}%
                      </span>
                      <span className="font-bold text-blue-600">
                        {reward.steps}점
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 상세 정보 (개발자용) */}
      {calculation && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <details>
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              상세 계산 정보 (개발자용)
            </summary>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
              {formatStepCalculationDetails(calculation)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default StepCalculator;
