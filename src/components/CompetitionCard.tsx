import React from 'react';
import { Calendar, Trophy, Users, Globe } from 'lucide-react';
import { Competition } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface CompetitionCardProps {
  competition: Competition;
  onClick: () => void;
}

const CompetitionCard: React.FC<CompetitionCardProps> = ({ competition, onClick }) => {
  const { isDarkMode } = useTheme();
  
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