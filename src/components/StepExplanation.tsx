import React, { useState } from 'react';
import { Info, Award, Users, Calendar, Star } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface StepExplanationProps {
  children: React.ReactNode;
  stepScore?: number;
  className?: string;
}

const StepExplanation: React.FC<StepExplanationProps> = ({ 
  children, 
  stepScore = 0, 
  className = "" 
}) => {
  const { isDarkMode } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);

  const stepCriteria = [
    {
      icon: Award,
      title: "상금 규모",
      description: "대회의 상금 규모에 따른 점수",
      maxPoints: 20,
      color: "text-yellow-500"
    },
    {
      icon: Users,
      title: "심사위원 수",
      description: "심사위원의 수와 전문성에 따른 점수",
      maxPoints: 20,
      color: "text-blue-500"
    },
    {
      icon: Calendar,
      title: "참가자 수",
      description: "대회 참가자 수에 따른 경쟁도 점수",
      maxPoints: 20,
      color: "text-green-500"
    },
    {
      icon: Star,
      title: "대회 연혁",
      description: "대회의 회차와 전통성에 따른 점수",
      maxPoints: 20,
      color: "text-purple-500"
    }
  ];

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="cursor-help"
      >
        {children}
      </div>

      {showTooltip && (
        <div className={`absolute z-50 w-80 p-4 rounded-lg shadow-xl border transition-all duration-200 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        } -top-2 left-full ml-2`}>
          {/* 화살표 */}
          <div className={`absolute top-4 -left-2 w-0 h-0 border-t-8 border-b-8 border-r-8 ${
            isDarkMode 
              ? 'border-t-transparent border-b-transparent border-r-gray-800' 
              : 'border-t-transparent border-b-transparent border-r-white'
          }`} />
          
          {/* 제목 */}
          <div className="mb-3">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="h-5 w-5 text-blue-500" />
              <h3 className="font-bold text-lg">스텝 점수 계산 기준</h3>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              대회의 공정성과 수준을 종합적으로 평가한 점수입니다
            </p>
          </div>

          {/* 현재 점수 */}
          <div className={`mb-4 p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500 mb-1">
                {stepScore}점
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                총 스텝 점수 (최대 80점)
              </div>
            </div>
          </div>

          {/* 평가 기준 */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm mb-2">평가 기준</h4>
            {stepCriteria.map(({ icon: Icon, title, description, maxPoints, color }, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`p-1.5 rounded-md ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-medium text-sm">{title}</h5>
                    <span className={`text-xs px-2 py-1 rounded ${
                      isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      최대 {maxPoints}점
                    </span>
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 참고 사항 */}
          <div className={`mt-4 p-3 rounded-lg ${
            isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
          }`}>
            <p className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              💡 스텝 점수는 댄서들 간의 객관적인 비교를 위한 지표로, 
              대회의 규모와 공신력을 종합적으로 반영합니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepExplanation;