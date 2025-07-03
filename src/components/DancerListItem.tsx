import React from 'react';
import { Trophy, Users, Instagram, MapPin } from 'lucide-react';
import { Dancer } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface DancerListItemProps {
  dancer: Dancer;
  onClick: () => void;
}

const DancerListItem: React.FC<DancerListItemProps> = ({ dancer, onClick }) => {
  const { isDarkMode } = useTheme();
  
  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-400';
    return 'text-gray-400';
  };

  return (
    <div 
      onClick={onClick}
      className={`transition-all duration-300 cursor-pointer border rounded-2xl p-6 group ${
        isDarkMode 
          ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' 
          : 'bg-white hover:bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Profile Image */}
          <div className="relative">
            <img
              src={dancer.avatar || 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg'}
              alt={dancer.nickname}
              className={`w-16 h-16 rounded-full object-cover ring-2 ${
                isDarkMode ? 'ring-gray-600' : 'ring-gray-300'
              }`}
            />
          </div>

          {/* Dancer Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className={`text-xl font-bold transition-colors group-hover:text-blue-400 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {dancer.name}
              </h3>
              <span className="text-purple-400 font-semibold text-lg">
                {dancer.nickname}
              </span>
            </div>
            
            <div className={`flex items-center space-x-4 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>Seoul, Korea</span>
              </div>
              {dancer.crew && (
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{dancer.crew}</span>
                </div>
              )}
            </div>
          </div>

          {/* Genres */}
          <div className="hidden md:flex flex-col items-center space-y-2">
            <div className="flex flex-wrap gap-1 justify-center">
              {dancer.genres.slice(0, 2).map((genre, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 text-sm rounded-full font-medium ${
                    isDarkMode 
                      ? 'bg-blue-900 text-blue-300' 
                      : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  {genre}
                </span>
              ))}
            </div>
            {dancer.genres.length > 2 && (
              <span className={`text-xs ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                +{dancer.genres.length - 2} more
              </span>
            )}
          </div>

          {/* RSVP Button */}
          <div className="hidden md:block">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full font-medium transition-colors">
              RSVP
            </button>
          </div>
        </div>

        {/* Points */}
        <div className="text-right">
          <div className="text-4xl font-bold text-green-400 mb-1">
            {Math.floor(dancer.totalPoints)}
          </div>
          <div className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            포인트
          </div>
        </div>
      </div>
    </div>
  );
};

export default DancerListItem;