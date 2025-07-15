import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Dancer } from '../types';
import { TrendingUp, TrendingDown, Minus, Crown, Star } from 'lucide-react';
import StepExplanation from './StepExplanation';

interface DancerListItemProps {
  dancer: Dancer;
  onClick: () => void;
  rank?: number; // 실제 표시할 스텝 (배열 인덱스와 다를 수 있음)
}

const DancerListItem: React.FC<DancerListItemProps> = ({ dancer, onClick, rank }) => {
  const { isDarkMode } = useTheme();
  const displayRank = rank || dancer.rank;
  
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

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5" />;
    if (rank === 2) return <Star className="w-5 h-5" />;
    if (rank === 3) return <Star className="w-5 h-5" />;
    return null;
  };

  const getStatusIcon = () => {
    // 랜덤하게 상승/하락/유지 상태 표시 (실제로는 이전 스텝과 비교)
    const statuses = [
      { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500' },
      { icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500' },
      { icon: Minus, color: 'text-gray-400', bg: 'bg-gray-500' }
    ];
    return statuses[displayRank % 3];
  };

  const status = getStatusIcon();
  const StatusIcon = status.icon;

  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group mb-4 ${
        isDarkMode ? 'shadow-lg shadow-gray-900/50' : 'shadow-lg shadow-gray-200/50'
      }`}
      style={{ height: '120px' }}
    >
      {/* 배경 이미지 */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
        style={{
          backgroundImage: `url(${dancer.backgroundImage || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'})`,
        }}
      />
      
      {/* 그라데이션 오버레이 */}
      <div className={`absolute inset-0 bg-gradient-to-r ${getRankColor(displayRank)} opacity-80`} />
      
      {/* 다크 오버레이 */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* 콘텐츠 */}
      <div className="relative h-full flex items-center justify-between px-6">
        {/* 왼쪽: 스텝 */}
        <div className="flex items-center space-x-4">
          <div className={`w-16 h-16 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold ${getRankTextColor(displayRank)}`}>
            {displayRank <= 3 ? getRankIcon(displayRank) : displayRank}
          </div>
          
          {/* 댄서 정보 */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={dancer.profileImage || dancer.avatar || 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg'}
                alt={dancer.nickname}
                className="w-16 h-16 rounded-full object-cover border-3 border-white/30 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <StatusIcon className={`w-3 h-3 ${status.color}`} />
              </div>
            </div>
            
            <div className="text-white">
              <h3 className="text-xl font-bold mb-1 drop-shadow-lg">
                {dancer.nickname}
              </h3>
              <p className="text-sm text-white/80 font-medium">
                {dancer.name}
              </p>
            </div>
          </div>
        </div>
        
        {/* 오른쪽: 점수와 상태 */}
        <div className="text-right">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`px-3 py-1 rounded-full ${status.bg} bg-opacity-20 backdrop-blur-sm`}>
              <StatusIcon className={`w-4 h-4 ${status.color}`} />
            </div>
            <div className="text-white">
              <p className="text-2xl font-bold drop-shadow-lg">
                {displayRank}
              </p>
              <p className="text-xs text-white/80 font-medium">
                {displayRank <= 3 ? '전체스텝' : '현재순위'}
              </p>
            </div>
          </div>
          
          <StepExplanation stepScore={dancer.totalPoints}>
            <div className="text-white/90 text-sm cursor-help">
              <p className="font-semibold">
                {dancer.totalPoints.toFixed(2)} 스텝
              </p>
              <p className="text-xs">
                {Math.random() > 0.5 ? '+' : ''}{(Math.random() * 2 - 1).toFixed(2)}%
              </p>
            </div>
          </StepExplanation>
        </div>
      </div>
      
      {/* 장르 태그 */}
      <div className="absolute bottom-3 left-6">
        <div className="flex space-x-2">
          {dancer.genres.slice(0, 2).map((genre, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full text-white border border-white/30"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
      
      {/* 호버 효과 */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default DancerListItem;