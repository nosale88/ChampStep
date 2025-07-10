import React, { useState, useMemo } from 'react';
import { Search, Filter, Trophy, TrendingUp, Grid3X3, List } from 'lucide-react';
import DancerCard from './DancerCard';
import DancerListItem from './DancerListItem';
import { useTheme } from '../contexts/ThemeContext';
import { Dancer } from '../types';

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

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    dancers.forEach(dancer => dancer.genres.forEach(genre => genres.add(genre)));
    return Array.from(genres);
  }, []);

  const allCrews = useMemo(() => {
    const crews = new Set<string>();
    dancers.forEach(dancer => dancer.crew && crews.add(dancer.crew));
    return Array.from(crews);
  }, [dancers]);

  const filteredDancers = useMemo(() => {
    return dancers.filter(dancer => {
      const matchesSearch = dancer.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dancer.name.toLowerCase().includes(searchTerm.toLowerCase());
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              댄서 랭킹
            </h1>
            <p className={`max-w-2xl mx-auto transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              대회 수상 내역을 바탕으로 산정된 공정한 댄서 랭킹을 확인하세요
            </p>
          </div>

          {/* Search and Filters */}
          <div className={`rounded-2xl p-6 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    placeholder="댄서 이름이나 닉네임으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className={`px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                >
                  <option value="all">모든 장르</option>
                  {allGenres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
                
                <select
                  value={selectedCrew}
                  onChange={(e) => setSelectedCrew(e.target.value)}
                  className={`px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                >
                  <option value="all">모든 크루</option>
                  {allCrews.map(crew => (
                    <option key={crew} value={crew}>{crew}</option>
                  ))}
                </select>

                {/* View Mode Toggle */}
                <div className={`flex border rounded-xl overflow-hidden transition-colors ${
                  isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                }`}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 transition-colors ${
                      viewMode === 'grid' 
                        ? isDarkMode 
                          ? 'bg-blue-900 text-blue-300' 
                          : 'bg-blue-50 text-blue-600'
                        : isDarkMode
                          ? 'text-gray-400 hover:bg-gray-700'
                          : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Grid3X3 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 transition-colors ${
                      viewMode === 'list' 
                        ? isDarkMode 
                          ? 'bg-blue-900 text-blue-300' 
                          : 'bg-blue-50 text-blue-600'
                        : isDarkMode
                          ? 'text-gray-400 hover:bg-gray-700'
                          : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ranking Stats */}
      <section className={`py-8 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div key={index} className={`flex items-center space-x-4 p-4 rounded-xl transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className={`p-3 rounded-lg ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className={`text-2xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {value}
                  </p>
                  <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ranking List */}
      <section className={`py-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredDancers.length === 0 ? (
            <div className="text-center py-16">
              <div className={`mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                검색 결과가 없습니다
              </h3>
              <p className={`transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                다른 검색어나 필터를 시도해보세요
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'list' && (
                <div className="flex justify-between items-center mb-8">
                  <h2 className={`text-2xl font-bold transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    포인트 규정
                  </h2>
                </div>
              )}
              
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDancers.map((dancer) => (
                    <DancerCard
                      key={dancer.id}
                      dancer={dancer}
                      onClick={() => onDancerClick(dancer.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
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