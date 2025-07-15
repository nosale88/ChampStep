import React, { useMemo } from 'react';
import { X, Calendar, Trophy, Globe, Award, Calculator } from 'lucide-react';
import { Competition, Dancer } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { 
  calculateCompetitionSteps, 
  calculateAllStepRewards, 
  getCompetitionGrade 
} from '../utils/stepCalculator';

interface CompetitionDetailModalProps {
  competition: Competition;
  isOpen: boolean;
  onClose: () => void;
  onDancerClick: (dancerId: string) => void;
}

const CompetitionDetailModal: React.FC<CompetitionDetailModalProps> = ({ competition, isOpen, onClose, onDancerClick }) => {
  const { isDarkMode } = useTheme();
  
  if (!isOpen) { return null; }

  // 스텝 계산 로직
  const stepCalculation = useMemo(() => {
    return calculateCompetitionSteps(competition);
  }, [competition]);

  const stepRewards = useMemo(() => {
    return calculateAllStepRewards(competition);
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

  const getParticipantDancer = (_dancerId: string): Dancer | undefined => {
    // TODO: 실제 댄서 데이터를 props나 context에서 가져와야 함
    return undefined;
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) { return '🥇'; }
    if (position === 2) { return '🥈'; }
    if (position === 3) { return '🥉'; }
    return `${position}위`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto transition-colors ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className="relative">
          <img
            src={competition.poster || 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg'}
            alt={competition.eventName}
            className="w-full h-64 object-cover rounded-t-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-t-2xl" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h2 className="text-3xl font-bold mb-2">{competition.eventName}</h2>
            <div className="flex items-center space-x-4 text-white/80">
              <div className="flex items-center space-x-1">
                <Calendar className="h-5 w-5" />
                                <span>{formatDate(competition.eventStartDate)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Trophy className="h-5 w-5" />
                <span>{competition.prizeDetails}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Competition Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* 스텝 점수 */}
            <div className={`p-6 rounded-xl transition-colors ${
              isDarkMode ? 'bg-gradient-to-r from-blue-900 to-blue-800' : 'bg-gradient-to-r from-blue-50 to-blue-100'
            }`}>
              <div className="flex items-center space-x-3">
                <Calculator className={`h-8 w-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <div>
                  <div className="flex items-center space-x-2">
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-200' : 'text-blue-900'}`}>
                      {stepCalculation.totalSteps}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isDarkMode ? 'bg-blue-700 text-blue-200' : 'bg-blue-200 text-blue-800'
                    }`}>
                      {competitionGrade}
                    </span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    총 스텝 점수
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`p-6 rounded-xl transition-colors ${
              isDarkMode ? 'bg-gradient-to-r from-purple-900 to-purple-800' : 'bg-gradient-to-r from-purple-50 to-purple-100'
            }`}>
              <div className="flex items-center space-x-3">
                <Award className={`h-8 w-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <div>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                    {competition.participants?.length || 0}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    수상자 수
                  </p>
                </div>
              </div>
            </div>
            <div className={`p-6 rounded-xl transition-colors ${
              isDarkMode ? 'bg-gradient-to-r from-orange-900 to-orange-800' : 'bg-gradient-to-r from-orange-50 to-orange-100'
            }`}>
              <div className="flex items-center space-x-3">
                <Globe className={`h-8 w-8 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                <div>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-orange-200' : 'text-orange-900'}`}>
                    {competition.regionRequirement}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                    참가 지역
                  </p>
                </div>
              </div>
            </div>
            
            {/* 1등 획득 점수 */}
            <div className={`p-6 rounded-xl transition-colors ${
              isDarkMode ? 'bg-gradient-to-r from-green-900 to-green-800' : 'bg-gradient-to-r from-green-50 to-green-100'
            }`}>
              <div className="flex items-center space-x-3">
                <Trophy className={`h-8 w-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                <div>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-200' : 'text-green-900'}`}>
                    {stepRewards[0]?.steps || 0}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                    1등 획득 점수
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className={`text-xl font-semibold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              대회 소개
            </h3>
            <div
              className={`prose max-w-none transition-colors ${isDarkMode ? 'prose-invert' : ''}`}
              dangerouslySetInnerHTML={{ __html: competition.detailedDescription }}
            />
          </div>

          {/* Step Calculation Details */}
          <div className="mb-8">
            <h3 className={`text-xl font-semibold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              스텝 점수 상세 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 점수 구성 */}
              <div className={`p-6 rounded-xl transition-colors ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h4 className={`font-semibold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  점수 구성 (총 {stepCalculation.totalSteps}점)
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>상금 규모</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stepCalculation.prizeSteps}점 / 20점
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>심사위원 수</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stepCalculation.judgeSteps}점 / 20점
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>참가자 수</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stepCalculation.participantSteps}점 / 20점
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>대회 연혁</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stepCalculation.editionSteps}점 / 20점
                    </span>
                  </div>
                  <div className={`border-t pt-3 mt-3 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>총 점수</span>
                      <span className={`font-bold text-lg ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {stepCalculation.totalSteps}점 / 80점
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 순위별 획득 점수 */}
              <div className={`p-6 rounded-xl transition-colors ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h4 className={`font-semibold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  순위별 획득 점수
                </h4>
                <div className="space-y-3">
                  {stepRewards.map((reward) => (
                    <div key={reward.rank} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getPositionIcon(reward.rank)}</span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {reward.rank}등 ({reward.percentage}%)
                        </span>
                      </div>
                      <span className={`font-bold ${
                        reward.rank === 1 
                          ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-600')
                          : reward.rank === 2
                          ? (isDarkMode ? 'text-gray-300' : 'text-gray-600')
                          : (isDarkMode ? 'text-orange-400' : 'text-orange-600')
                      }`}>
                        {reward.steps}점
                      </span>
                    </div>
                  ))}
                </div>
                <div className={`mt-4 pt-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                    }`}>
                      대회 등급: {competitionGrade}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Competition Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className={`text-xl font-semibold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                대회 정보
              </h3>
              <div className="space-y-4">
                
                {competition.link && (
                  <div className="pt-2">
                    <a
                      href={competition.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' 
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      <Globe className="h-4 w-4" />
                      <span>공식 웹사이트</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            
          </div>

          {/* Genres */}
          <div className="mb-8">
            <h3 className={`text-xl font-semibold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              대회 장르
            </h3>
            <div className="flex flex-wrap gap-2">
              {competition.genres.map((genre, index) => (
                <span
                  key={index}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-orange-900 text-orange-300' 
                      : 'bg-orange-50 text-orange-700'
                  }`}
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Winners */}
          <div>
            <h3 className={`text-xl font-semibold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              수상자 명단
            </h3>
            <div className="space-y-4">
              {competition.participants
                .sort((a, b) => a.position - b.position)
                .map((participant) => {
                  const dancer = getParticipantDancer(participant.dancerId);
                  if (!dancer) return null;

                  return (
                    <div key={participant.dancerId} className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">
                          {getPositionIcon(participant.position)}
                        </div>
                        <div
                          className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => onDancerClick(participant.dancerId)}
                        >
                          <img
                            src={dancer.avatar || 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg'}
                            alt={dancer.nickname}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className={`font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {dancer.nickname}
                            </p>
                            <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {dancer.name}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">+{participant.points.toFixed(1)}점</div>
                        {dancer.crew && (
                          <div className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {dancer.crew}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionDetailModal;