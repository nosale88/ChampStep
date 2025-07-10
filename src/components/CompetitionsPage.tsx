import React, { useState, useMemo } from 'react';
import { Search, Calendar, Trophy, ChevronDown, Filter } from 'lucide-react';
import CompetitionCard from './CompetitionCard';
import { useTheme } from '../contexts/ThemeContext';
import { Competition } from '../types';

interface CompetitionsPageProps {
  onCompetitionClick: (competitionId: string) => void;
  competitions: Competition[];
}

const CompetitionsPage: React.FC<CompetitionsPageProps> = ({ onCompetitionClick, competitions }) => {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showFilters, setShowFilters] = useState(false);

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    competitions.forEach(comp => comp.genres.forEach(genre => genres.add(genre)));
    return Array.from(genres).sort();
  }, [competitions]);

  const filteredAndSortedCompetitions = useMemo(() => {
    let filtered = competitions.filter(competition => {
      const matchesSearch = competition.eventName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === 'all' || competition.genres.includes(selectedGenre);
      
      return matchesSearch && matchesGenre;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.eventStartDate).getTime() - new Date(a.eventStartDate).getTime();
        case 'name':
          return a.eventName.localeCompare(b.eventName);
        default:
          return 0;
      }
    });
  }, [competitions, searchTerm, selectedGenre, sortBy]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <section className={`shadow-sm border-b transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              대회 목록
            </h1>
            <p className={`max-w-2xl mx-auto px-4 text-sm sm:text-base transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              다양한 댄스 대회 정보를 확인하고 참가 신청하세요
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
                placeholder="대회명으로 검색..."
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
                  <span>필터 및 정렬</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filters */}
            <div className={`space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 ${
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
                  {allGenres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  정렬
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="date">날짜순</option>
                  <option value="name">이름순</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competition Stats */}
      <section className={`py-4 sm:py-6 lg:py-8 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { 
                icon: Calendar, 
                label: '총 대회 수', 
                value: competitions.length, 
                color: isDarkMode ? 'text-blue-400 bg-blue-900' : 'text-blue-600 bg-blue-50' 
              },
              { 
                icon: Trophy, 
                label: '평균 상금 규모', 
                value: '3M+', 
                color: isDarkMode ? 'text-yellow-400 bg-yellow-900' : 'text-yellow-600 bg-yellow-50' 
              },
              { 
                icon: Search, 
                label: '필터링된 대회', 
                value: filteredAndSortedCompetitions.length, 
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

      {/* Competition List */}
      <section className={`py-4 sm:py-6 lg:py-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredAndSortedCompetitions.length === 0 ? (
            <div className="text-center py-8 sm:py-12 lg:py-16">
              <Calendar className={`h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50 ${
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
              <div className="flex justify-between items-center mb-4 sm:mb-6 lg:mb-8">
                <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  대회 목록
                </h2>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  총 {filteredAndSortedCompetitions.length}개
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {filteredAndSortedCompetitions.map((competition) => (
                  <CompetitionCard
                    key={competition.id}
                    competition={competition}
                    onClick={() => onCompetitionClick(competition.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default CompetitionsPage;