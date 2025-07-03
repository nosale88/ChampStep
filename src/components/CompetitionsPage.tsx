import React, { useState, useMemo } from 'react';
import { Search, Calendar, Trophy } from 'lucide-react';
import { competitions } from '../data/mockData';
import CompetitionCard from './CompetitionCard';
import { useTheme } from '../contexts/ThemeContext';

interface CompetitionsPageProps {
  onCompetitionClick: (competitionId: string) => void;
}

const CompetitionsPage: React.FC<CompetitionsPageProps> = ({ onCompetitionClick }) => {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    competitions.forEach(comp => comp.genres.forEach(genre => genres.add(genre)));
    return Array.from(genres);
  }, []);

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
  }, [searchTerm, selectedGenre, sortBy]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <section className={`shadow-sm border-b transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              댄스 대회
            </h1>
            <p className={`max-w-2xl mx-auto transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              국내외 주요 댄스 대회 정보와 수상 내역을 확인하세요
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
                    placeholder="대회명으로 검색..."
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
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
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
      <section className={`py-8 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

      {/* Competition List */}
      <section className={`py-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredAndSortedCompetitions.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedCompetitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  onClick={() => onCompetitionClick(competition.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CompetitionsPage;