import React, { useState, useMemo } from 'react';
import { Search, Filter, Trophy, TrendingUp, Grid3X3, List, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Dancer } from '../types';
import DancerCard from './DancerCard';
import DancerListItem from './DancerListItem';

interface RankingPageProps {
  onDancerClick: (dancerId: string) => void;
  dancers: Dancer[];
}

const RankingPage: React.FC<RankingPageProps> = ({ onDancerClick, dancers }) => {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedCrew, setSelectedCrew] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    dancers.forEach(dancer => {
      dancer.genres.forEach(genre => genres.add(genre));
    });
    return Array.from(genres).sort();
  }, [dancers]);

  const availableCrews = useMemo(() => {
    const crews = new Set<string>();
    dancers.forEach(dancer => {
      if (dancer.crew) crews.add(dancer.crew);
    });
    return Array.from(crews).sort();
  }, [dancers]);

  const filteredDancers = useMemo(() => {
    return dancers.filter(dancer => {
      const matchesSearch = dancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dancer.nickname.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === 'all' || dancer.genres.includes(selectedGenre);
      const matchesCrew = selectedCrew === 'all' || dancer.crew === selectedCrew;
      
      return matchesSearch && matchesGenre && matchesCrew;
    });
  }, [dancers, searchTerm, selectedGenre, selectedCrew]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <section className={`shadow-sm border-b transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className={`text-2xl sm:text-3xl font-bold mb-2 sm:mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              댄서 스텝
            </h1>
            <p className={`max-w-2xl mx-auto px-4 text-sm sm:text-base transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              대회 수상 내역을 바탕으로 산정된 공정한 댄서 스텝을 확인하세요
            </p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="댄서 이름 또는 닉네임으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>

            {/* Filter Toggle Button (Mobile) */}
            <div className="sm:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>필터</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filters */}
            <div className={`space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4 ${
              showFilters ? 'block' : 'hidden sm:grid'
            }`}>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  장르
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">모든 장르</option>
                  {availableGenres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  크루
                </label>
                <select
                  value={selectedCrew}
                  onChange={(e) => setSelectedCrew(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">모든 크루</option>
                  {availableCrews.map(crew => (
                    <option key={crew} value={crew}>{crew}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  보기 방식
                </label>
                <div className={`flex border rounded-lg overflow-hidden transition-colors ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 p-2 sm:p-3 transition-colors flex items-center justify-center ${
                      viewMode === 'grid' 
                        ? isDarkMode 
                          ? 'bg-blue-900 text-blue-300' 
                          : 'bg-blue-50 text-blue-600'
                        : isDarkMode
                          ? 'text-gray-400 hover:bg-gray-600'
                          : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="ml-2 text-sm sm:text-base">그리드</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 p-2 sm:p-3 transition-colors flex items-center justify-center ${
                      viewMode === 'list' 
                        ? isDarkMode 
                          ? 'bg-blue-900 text-blue-300' 
                          : 'bg-blue-50 text-blue-600'
                        : isDarkMode
                          ? 'text-gray-400 hover:bg-gray-600'
                          : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <List className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="ml-2 text-sm sm:text-base">리스트</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ranking Stats */}
      <section className={`py-4 sm:py-6 lg:py-8 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { 
                icon: Trophy, 
                label: '총 등록 댄서', 
                value: dancers.length, 
                color: isDarkMode ? 'text-yellow-400 bg-yellow-900' : 'text-yellow-600 bg-yellow-50' 
              },
              { 
                icon: TrendingUp, 
                label: '필터링된 댄서', 
                value: filteredDancers.length, 
                color: isDarkMode ? 'text-blue-400 bg-blue-900' : 'text-blue-600 bg-blue-50' 
              },
              { 
                icon: Filter, 
                label: '활성 필터', 
                value: [selectedGenre !== 'all', selectedCrew !== 'all', searchTerm !== ''].filter(Boolean).length, 
                color: isDarkMode ? 'text-purple-400 bg-purple-900' : 'text-purple-600 bg-purple-50' 
              }
            ].map(({ icon: Icon, label, value, color }, index) => (
              <div key={index} className={`flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg sm:rounded-xl transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className={`p-2 sm:p-3 rounded-lg ${color}`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <p className={`text-lg sm:text-2xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {value}
                  </p>
                  <p className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ranking List */}
      <section className={`py-4 sm:py-6 lg:py-8 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredDancers.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Trophy className={`h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <h3 className={`text-lg sm:text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                검색 결과가 없습니다
              </h3>
              <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                다른 검색어나 필터를 시도해보세요
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'list' && (
                <div className="flex justify-between items-center mb-4 sm:mb-6 lg:mb-8">
                  <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    스텝 결과
                  </h2>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    총 {filteredDancers.length}명
                  </div>
                </div>
              )}
              
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredDancers.map((dancer) => (
                    <DancerCard
                      key={dancer.id}
                      dancer={dancer}
                      onClick={() => onDancerClick(dancer.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {filteredDancers.map((dancer, index) => (
                    <DancerListItem
                      key={dancer.id}
                      dancer={dancer}
                      rank={index + 1}
                      onClick={() => onDancerClick(dancer.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default RankingPage;