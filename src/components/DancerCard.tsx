import React from 'react';
import { Trophy, Users, Instagram, Crown, Star } from 'lucide-react';
import { Dancer } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import StepExplanation from './StepExplanation';
import { getValidAvatarUrl, handleImageError } from '../utils/avatarUtils';

interface DancerCardProps {
  dancer: Dancer;
  onClick: () => void;
}

const DancerCard: React.FC<DancerCardProps> = ({ dancer, onClick }) => {
  const { isDarkMode } = useTheme();
  
  // 안전한 데이터 접근을 위한 null 체크
  if (!dancer || !dancer.id) {
    return null;
  }
  
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4" />;
    if (rank === 2) return <Star className="w-4 h-4" />;
    if (rank === 3) return <Star className="w-4 h-4" />;
    return rank;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-amber-400 to-amber-600';
    if (rank <= 10) return 'from-blue-400 to-blue-600';
    return 'from-purple-400 to-purple-600';
  };

  const getRankTextColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-900';
    if (rank === 2) return 'text-gray-900';
    if (rank === 3) return 'text-amber-900';
    return 'text-white';
  };

  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl group ${
        isDarkMode ? 'shadow-lg shadow-gray-900/50' : 'shadow-lg shadow-gray-200/50'
      }`}
      style={{ height: '280px' }}
    >
      {/* 배경 이미지 */}
      <img 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        src={dancer.backgroundImage || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'}
        alt="배경"
        onError={(e) => {
          e.currentTarget.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
        }}
      />
      
      {/* 그라데이션 오버레이 */}
      <div className={`absolute inset-0 bg-gradient-to-b ${getRankColor(dancer.rank)} opacity-70`} />
      
      {/* 다크 오버레이 */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* 상단: 스텝 */}
      <div className="absolute top-4 left-4">
        <div className={`w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-lg font-bold ${getRankTextColor(dancer.rank)}`}>
          {dancer.rank <= 3 ? getRankIcon(dancer.rank) : dancer.rank}
        </div>
      </div>
      
      {/* 상단 우측: 스텝 점수 */}
      <div className="absolute top-4 right-4 text-right">
        <StepExplanation stepScore={dancer.totalPoints}>
          <div className="bg-black/20 backdrop-blur-sm rounded-lg px-3 py-1 cursor-help">
            <p className="text-white font-bold text-lg">
              {dancer.totalPoints.toFixed(1)}
            </p>
            <p className="text-white/80 text-xs">
              스텝
            </p>
          </div>
        </StepExplanation>
      </div>
      
      {/* 하단: 댄서 정보 */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-end space-x-4">
          {/* 프로필 이미지 */}
          <div className="relative">
            <img
              src={getValidAvatarUrl(dancer.profileImage || dancer.avatar)}
              alt={dancer.nickname}
              className="w-16 h-16 rounded-full object-cover border-3 border-white/30 shadow-lg"
              onError={handleImageError}
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white"></div>
          </div>
          
          {/* 댄서 정보 */}
          <div className="flex-1">
            <h3 className="text-white text-xl font-bold mb-1 drop-shadow-lg">
              {dancer.nickname}
            </h3>
            <p className="text-white/80 text-sm font-medium mb-2">
              {dancer.name}
            </p>
            
            {/* 크루 정보 */}
            {dancer.crew && (
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-white/70" />
                <span className="text-white/80 text-sm">
                  {dancer.crew}
                </span>
              </div>
            )}
            
            {/* 장르 태그 */}
            <div className="flex flex-wrap gap-1">
              {dancer.genres.slice(0, 2).map((genre, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full text-white border border-white/30"
                >
                  {genre}
                </span>
              ))}
              {dancer.genres.length > 2 && (
                <span className="px-2 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full text-white border border-white/30">
                  +{dancer.genres.length - 2}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* SNS 링크 */}
        {dancer.sns && (
          <div className="mt-3 flex justify-end">
            <a
              href={dancer.sns}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center space-x-1 px-3 py-1 bg-pink-500/20 backdrop-blur-sm rounded-full text-pink-200 hover:bg-pink-500/30 transition-colors"
            >
              <Instagram className="w-4 h-4" />
              <span className="text-xs">SNS</span>
            </a>
          </div>
        )}
      </div>
      
      {/* 호버 효과 */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default DancerCard;