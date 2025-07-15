import React, { useState, useEffect } from 'react';
import { Trophy, Plus, X, ArrowUp, ArrowDown, Edit3, Save, User, Users } from 'lucide-react';
import { Winner, Dancer, Crew } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import PersonSelector, { SelectedPerson } from './PersonSelector';

interface WinnerSelectorProps {
  winners: Winner[];
  onUpdateWinners: (winners: Winner[]) => void;
  dancers: Dancer[];
  crews: Crew[];
}

const WinnerSelector: React.FC<WinnerSelectorProps> = ({
  winners,
  onUpdateWinners,
  dancers,
  crews
}) => {
  const { isDarkMode } = useTheme();
  const [localWinners, setLocalWinners] = useState<Winner[]>(winners);
  const [showPersonSelector, setShowPersonSelector] = useState(false);
  const [editingWinner, setEditingWinner] = useState<Winner | null>(null);

  useEffect(() => {
    setLocalWinners(winners);
  }, [winners]);

  useEffect(() => {
    onUpdateWinners(localWinners);
  }, [localWinners, onUpdateWinners]);

  const addWinner = (person: SelectedPerson) => {
    const newWinner: Winner = {
      id: `winner_${Date.now()}`,
      type: person.type,
      name: person.name,
      rank: localWinners.length + 1,
      dancerId: person.dancerId,
      crewId: person.crewId
    };

    setLocalWinners(prev => [...prev, newWinner]);
    setShowPersonSelector(false);
  };

  const removeWinner = (winnerId: string) => {
    setLocalWinners(prev => {
      const filtered = prev.filter(w => w.id !== winnerId);
      // 순위 재정렬
      return filtered.map((winner, index) => ({
        ...winner,
        rank: index + 1
      }));
    });
  };

  const moveWinner = (winnerId: string, direction: 'up' | 'down') => {
    setLocalWinners(prev => {
      const newWinners = [...prev];
      const currentIndex = newWinners.findIndex(w => w.id === winnerId);
      
      if (direction === 'up' && currentIndex > 0) {
        [newWinners[currentIndex], newWinners[currentIndex - 1]] = 
        [newWinners[currentIndex - 1], newWinners[currentIndex]];
      } else if (direction === 'down' && currentIndex < newWinners.length - 1) {
        [newWinners[currentIndex], newWinners[currentIndex + 1]] = 
        [newWinners[currentIndex + 1], newWinners[currentIndex]];
      }

      // 순위 재정렬
      return newWinners.map((winner, index) => ({
        ...winner,
        rank: index + 1
      }));
    });
  };

  const updateWinner = (winnerId: string, updates: Partial<Winner>) => {
    setLocalWinners(prev => 
      prev.map(winner => 
        winner.id === winnerId 
          ? { ...winner, ...updates }
          : winner
      )
    );
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return isDarkMode ? 'from-yellow-600 to-yellow-500' : 'from-yellow-400 to-yellow-500';
      case 2:
        return isDarkMode ? 'from-gray-500 to-gray-400' : 'from-gray-300 to-gray-400';
      case 3:
        return isDarkMode ? 'from-amber-600 to-amber-500' : 'from-amber-400 to-amber-500';
      default:
        return isDarkMode ? 'from-blue-600 to-blue-500' : 'from-blue-400 to-blue-500';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank.toString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          수상자 ({localWinners.length})
        </h3>
        <button
          onClick={() => setShowPersonSelector(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>수상자 추가</span>
        </button>
      </div>

      {localWinners.length === 0 ? (
        <div className={`text-center py-12 border-2 border-dashed rounded-xl ${
          isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'
        }`}>
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">아직 수상자가 없습니다</p>
          <p className="text-sm">수상자 추가 버튼을 클릭하여 수상자를 선택해주세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {localWinners.map((winner, index) => (
            <div
              key={winner.id}
              className={`p-4 rounded-xl border transition-all ${
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-4">
                {/* 순위 */}
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getRankColor(winner.rank)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {getRankIcon(winner.rank)}
                </div>

                {/* 수상자 정보 */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      {winner.type === 'dancer' ? (
                        <User className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Users className="w-4 h-4 text-green-500" />
                      )}
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {winner.name}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      winner.type === 'dancer'
                        ? (isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700')
                        : (isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700')
                    }`}>
                      {winner.type === 'dancer' ? '댄서' : '크루'}
                    </span>
                  </div>

                  {/* 추가 정보 편집 */}
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        카테고리
                      </label>
                      <input
                        type="text"
                        value={winner.category || ''}
                        onChange={(e) => updateWinner(winner.id, { category: e.target.value })}
                        placeholder="예: 솔로 배틀"
                        className={`w-full px-3 py-1.5 text-sm rounded border ${
                          isDarkMode 
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        스텝 점수
                      </label>
                      <input
                        type="number"
                        value={winner.points || ''}
                        onChange={(e) => updateWinner(winner.id, { points: parseFloat(e.target.value) || 0 })}
                        placeholder="100"
                        className={`w-full px-3 py-1.5 text-sm rounded border ${
                          isDarkMode 
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        상금/상품
                      </label>
                      <input
                        type="text"
                        value={winner.prize || ''}
                        onChange={(e) => updateWinner(winner.id, { prize: e.target.value })}
                        placeholder="예: 100만원"
                        className={`w-full px-3 py-1.5 text-sm rounded border ${
                          isDarkMode 
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => moveWinner(winner.id, 'up')}
                    disabled={index === 0}
                    className={`p-1 rounded transition-colors ${
                      index === 0
                        ? 'opacity-30 cursor-not-allowed'
                        : (isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-600')
                    }`}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveWinner(winner.id, 'down')}
                    disabled={index === localWinners.length - 1}
                    className={`p-1 rounded transition-colors ${
                      index === localWinners.length - 1
                        ? 'opacity-30 cursor-not-allowed'
                        : (isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-600')
                    }`}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeWinner(winner.id)}
                    className="p-1 rounded transition-colors text-red-500 hover:bg-red-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 수상자 선택 모달 */}
      <PersonSelector
        isOpen={showPersonSelector}
        onClose={() => setShowPersonSelector(false)}
        dancers={dancers}
        crews={crews}
        onSelect={addWinner}
        title="수상자 선택"
        description="수상자로 등록할 댄서나 크루를 선택해주세요"
        allowMultiple={false}
      />
    </div>
  );
};

export default WinnerSelector;