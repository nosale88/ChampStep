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

  const getPrizeLabel = (prizeAmount: string) => {
    switch (prizeAmount) {
      case 'under1m': return '100만원 미만';
      case '1m-3m': return '100-300만원';
      case '3m-5m': return '300-500만원';
      case 'over5m': return '500만원 이상';
      default: return '미정';
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border overflow-hidden group ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}
    >
      <div className="aspect-video relative overflow-hidden">
        <img
          src={competition.poster || 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg'}
          alt={competition.eventName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-bold text-lg mb-1 group-hover:text-blue-200 transition-colors">
            {competition.eventName}
          </h3>
          <div className="flex items-center space-x-4 text-white/80 text-sm">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(competition.date)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Trophy className="h-4 w-4" />
              <span>{getPrizeLabel(competition.prizeAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <p className={`text-sm mb-4 line-clamp-2 transition-colors ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {competition.description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className={`h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <span className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                심사위원
              </span>
            </div>
            <span className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {competition.judgeCount}명
            </span>
          </div>

          {competition.hasInternationalJudges && (
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">해외 심사위원 참여</span>
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {competition.genres.map((genre, index) => (
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
          </div>

          <div className={`flex items-center justify-between pt-2 border-t transition-colors ${
            isDarkMode ? 'border-gray-700' : 'border-gray-100'
          }`}>
            <span className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              기본 점수
            </span>
            <span className="text-lg font-bold text-orange-600">{competition.baseScore}점</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionCard;