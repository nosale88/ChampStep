import React, { useState, useMemo } from 'react';
import { Calendar, Trophy, Users, Globe, Star, Info } from 'lucide-react';
import { Competition } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { calculateCompetitionSteps, getCompetitionGrade } from '../utils/stepCalculator';

interface CompetitionCardProps {
  competition: Competition;
  onClick: () => void;
}

const CompetitionCard: React.FC<CompetitionCardProps> = ({ competition, onClick }) => {
  const { isDarkMode } = useTheme();
  const [showStepTooltip, setShowStepTooltip] = useState(false);
  
  // 스텝 점수 계산
  const stepCalculation = useMemo(() => {
    return calculateCompetitionSteps(competition);
  }, [competition]);
  
  const competitionGrade = useMemo(() => {
    return getCompetitionGrade(stepCalculation.totalSteps);
  }, [stepCalculation.totalSteps]);
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPrizeLabel = (prizeDetails: string) => {
    // 상금 정보를 간단히 표시
    if (prizeDetails.includes('500만원 이상') || prizeDetails.includes('5,000,000')) return '500만원 이상';
    if (prizeDetails.includes('300만원') || prizeDetails.includes('3,000,000')) return '300만원';
    if (prizeDetails.includes('100만원') || prizeDetails.includes('1,000,000')) return '100만원';
    return '상금 정보';
  };

  return (
    <div 
      onClick={onClick}
      className={`rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border overflow-hidden group ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
          : 'bg-white border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className="aspect-video relative overflow-hidden">
        <img
          src={competition.poster || 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg'}
          alt={competition.eventName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* 스텝 점수 배지 */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
          <div
            onMouseEnter={() => setShowStepTooltip(true)}
            onMouseLeave={() => setShowStepTooltip(false)}
            className="relative cursor-help"
          >
            <div className={`px-3 py-1.5 rounded-full backdrop-blur-sm border transition-all duration-300 ${
              stepCalculation.totalSteps >= 70 
                ? 'bg-gradient-to-r from-yellow-500/90 to-orange-500/90 border-yellow-400/50 text-white shadow-lg shadow-yellow-500/25'
                : stepCalculation.totalSteps >= 60
                ? 'bg-gradient-to-r from-blue-500/90 to-purple-500/90 border-blue-400/50 text-white shadow-lg shadow-blue-500/25'
                : stepCalculation.totalSteps >= 50
                ? 'bg-gradient-to-r from-green-500/90 to-teal-500/90 border-green-400/50 text-white shadow-lg shadow-green-500/25'
                : stepCalculation.totalSteps >= 40
                ? 'bg-gradient-to-r from-gray-500/90 to-slate-500/90 border-gray-400/50 text-white shadow-lg shadow-gray-500/25'
                : 'bg-gradient-to-r from-red-500/90 to-pink-500/90 border-red-400/50 text-white shadow-lg shadow-red-500/25'
            }`}>
              <div className="flex items-center space-x-1.5">
                <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm font-bold">
                  {stepCalculation.totalSteps}점
                </span>
                <span className="text-xs font-medium opacity-90">
                  {competitionGrade}
                </span>
              </div>
            </div>

            {/* 호버 툴팁 */}
            {showStepTooltip && (
              <div className={`absolute z-50 w-80 p-4 rounded-lg shadow-xl border transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-gray-200 text-gray-900'
              } top-full mt-2 right-0`}>
                {/* 화살표 */}
                <div className={`absolute -top-2 right-4 w-0 h-0 border-l-8 border-r-8 border-b-8 ${
                  isDarkMode 
                    ? 'border-l-transparent border-r-transparent border-b-gray-800' 
                    : 'border-l-transparent border-r-transparent border-b-white'
                }`} />
                
                {/* 제목 */}
                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    <h3 className="font-bold text-lg">스텝 점수 계산 내역</h3>
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
                      {stepCalculation.totalSteps}점
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      총 스텝 점수 (최대 80점) - {competitionGrade}
                    </div>
                  </div>
                </div>

                {/* 세부 점수 */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm mb-2">세부 점수 내역</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs font-medium">상금 규모</span>
                      </div>
                      <div className="text-lg font-bold">{stepCalculation.prizeSteps}점</div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        최대 20점
                      </div>
                    </div>
                    <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-medium">심사위원</span>
                      </div>
                      <div className="text-lg font-bold">{stepCalculation.judgeSteps}점</div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        최대 20점
                      </div>
                    </div>
                    <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <Users className="h-4 w-4 text-green-500" />
                        <span className="text-xs font-medium">참가자 수</span>
                      </div>
                      <div className="text-lg font-bold">{stepCalculation.participantSteps}점</div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        최대 20점
                      </div>
                    </div>
                    <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-medium">대회 연혁</span>
                      </div>
                      <div className="text-lg font-bold">{stepCalculation.editionSteps}점</div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        최대 20점
                      </div>
                    </div>
                  </div>
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
        </div>
        
        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
          <h3 className="text-white font-bold text-base sm:text-lg mb-1 group-hover:text-blue-200 transition-colors line-clamp-2">
            {competition.eventName}
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-white/80 text-xs sm:text-sm space-y-1 sm:space-y-0">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{formatDate(competition.eventStartDate)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">{getPrizeLabel(competition.prizeDetails)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <p className={`text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 transition-colors ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {competition.detailedDescription}
        </p>

        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className={`h-3 w-3 sm:h-4 sm:w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                참가자 수
              </span>
            </div>
            <span className={`text-xs sm:text-sm font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {competition.participantLimit === 'unlimited' ? '무제한' : `${competition.participantLimit}명`}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className={`h-3 w-3 sm:h-4 sm:w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                참가 유형
              </span>
            </div>
            <span className={`text-xs sm:text-sm font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {competition.participationType === 'individual' ? '개인전' : '팀전'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {competition.genres.slice(0, 3).map((genre, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs rounded-full font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-orange-900 text-orange-300' 
                    : 'bg-orange-50 text-orange-700'
                }`}
              >
                {genre}
              </span>
            ))}
            {competition.genres.length > 3 && (
              <span className={`px-2 py-1 text-xs rounded-full font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-400' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                +{competition.genres.length - 3}
              </span>
            )}
          </div>

          <div className={`flex items-center justify-between pt-2 border-t transition-colors ${
            isDarkMode ? 'border-gray-700' : 'border-gray-100'
          }`}>
            <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              참가비
            </span>
            <span className="text-base sm:text-lg font-bold text-orange-600">{competition.entryFee || '미정'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionCard;