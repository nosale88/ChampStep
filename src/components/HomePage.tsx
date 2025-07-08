import React from 'react';
import { Trophy, Calendar, TrendingUp, Star } from 'lucide-react';
import DancerCard from './DancerCard';
import CompetitionCard from './CompetitionCard';
import { useTheme } from '../contexts/ThemeContext';
import { Dancer, Competition } from '../types';

interface HomePageProps {
  onDancerClick: (dancerId: string) => void;
  onCompetitionClick: (competitionId: string) => void;
  dancers: Dancer[];
  competitions: Competition[];
}

const HomePage: React.FC<HomePageProps> = ({ onDancerClick, onCompetitionClick, dancers, competitions }) => {
  const { isDarkMode } = useTheme();
  const topDancers = dancers.slice(0, 3);
  const recentCompetitions = competitions.slice(0, 2);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <section className={`${isDarkMode ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black' : 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600'} text-white transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className={`text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent ${
              isDarkMode 
                ? 'bg-gradient-to-r from-blue-400 to-purple-400' 
                : 'bg-gradient-to-r from-white to-blue-100'
            } transition-all duration-300`}>
              ChampStep
            </h1>
            <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-blue-100'
            }`}>
              전국 댄서들의 대회 수상 내역을 기반으로 한 투명하고 공정한 랭킹 시스템
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className={`px-8 py-3 rounded-xl font-semibold transition-colors ${
                isDarkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-blue-600 hover:bg-blue-50'
              }`}>
                랭킹 보기
              </button>
              <button className={`border-2 px-8 py-3 rounded-xl font-semibold transition-colors ${
                isDarkMode
                  ? 'border-gray-400 text-gray-300 hover:bg-gray-800 hover:text-white'
                  : 'border-white text-white hover:bg-white hover:text-blue-600'
              }`}>
                대회 정보
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-16 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Trophy, label: '등록된 댄서', value: dancers.length, color: isDarkMode ? 'text-yellow-400' : 'text-yellow-600' },
              { icon: Calendar, label: '등록된 대회', value: competitions.length, color: isDarkMode ? 'text-blue-400' : 'text-blue-600' },
              { icon: TrendingUp, label: '총 참여 기록', value: '12', color: isDarkMode ? 'text-green-400' : 'text-green-600' },
              { icon: Star, label: '평균 랭킹 점수', value: '22.3', color: isDarkMode ? 'text-purple-400' : 'text-purple-600' }
            ].map(({ icon: Icon, label, value, color }, index) => (
              <div key={index} className={`text-center p-6 rounded-2xl transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
              }`}>
                <Icon className={`h-8 w-8 mx-auto mb-3 ${color}`} />
                <p className={`text-2xl font-bold mb-1 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {value}
                </p>
                <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Dancers Section */}
      <section className={`py-16 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🏆 현재 랭킹 TOP 3
            </h2>
            <p className={`max-w-2xl mx-auto transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              대회 수상 내역을 바탕으로 산정된 현재 최고 랭킹 댄서들을 만나보세요
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topDancers.map((dancer) => (
              <DancerCard
                key={dancer.id}
                dancer={dancer}
                onClick={() => onDancerClick(dancer.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Competitions Section */}
      <section className={`py-16 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🎉 최근 대회
            </h2>
            <p className={`max-w-2xl mx-auto transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              최근에 개최된 주요 댄스 대회들과 결과를 확인해보세요
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recentCompetitions.map((competition) => (
              <CompetitionCard
                key={competition.id}
                competition={competition}
                onClick={() => onCompetitionClick(competition.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-16 text-white transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-800 to-gray-900' 
          : 'bg-gradient-to-r from-blue-600 to-purple-600'
      }`}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">댄서 커뮤니티에 참여하세요</h2>
          <p className={`text-xl mb-8 transition-colors ${
            isDarkMode ? 'text-gray-300' : 'text-blue-100'
          }`}>
            전국 댄서들과 함께 실력을 키우고, 대회 정보를 공유하며, 랭킹 상승을 노려보세요
          </p>
          <button className={`px-8 py-3 rounded-xl font-semibold transition-colors ${
            isDarkMode 
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-white text-blue-600 hover:bg-blue-50'
          }`}>
            시작하기
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;