import React from 'react';
import { Trophy, Users, Instagram } from 'lucide-react';
import { Dancer } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface DancerCardProps {
  dancer: Dancer;
  onClick: () => void;
}

const DancerCard: React.FC<DancerCardProps> = ({ dancer, onClick }) => {
  const { isDarkMode } = useTheme();
  
  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return isDarkMode ? 'text-yellow-400 bg-yellow-900' : 'text-yellow-600 bg-yellow-50';
    if (rank === 2) return isDarkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-600 bg-gray-50';
    if (rank === 3) return isDarkMode ? 'text-amber-400 bg-amber-900' : 'text-amber-600 bg-amber-50';
    return isDarkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-50';
  };

  return (
    <div 
      onClick={onClick}
      className={`rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border overflow-hidden group ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
          : 'bg-white border-gray-100'
      }`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={dancer.avatar || 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg'}
                alt={dancer.nickname}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
              />
              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getRankColor(dancer.rank)}`}>
                {getRankIcon(dancer.rank)}
              </div>
            </div>
            <div>
              <h3 className={`font-bold transition-colors group-hover:text-blue-600 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {dancer.nickname}
              </h3>
              <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {dancer.name}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className={`text-sm font-medium transition-colors ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                총 포인트
              </span>
            </div>
            <span className="text-lg font-bold text-blue-600">{dancer.totalPoints.toFixed(1)}</span>
          </div>

          {dancer.crew && (
            <div className="flex items-center space-x-2">
              <Users className={`h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <span className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {dancer.crew}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {dancer.genres.map((genre, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs rounded-full font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-blue-900 text-blue-300' 
                    : 'bg-blue-50 text-blue-700'
                }`}
              >
                {genre}
              </span>
            ))}
          </div>

          {dancer.sns && (
            <div className="flex items-center space-x-2 pt-2">
              <Instagram className="h-4 w-4 text-pink-500" />
              <a
                href={dancer.sns}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm hover:text-pink-500 transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                SNS 보기
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DancerCard;