import React from 'react';
import { Trophy, Calendar, TrendingUp, Star, ArrowRight, Users, Award, Target } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Competition, Dancer } from '../types';
import DancerCard from './DancerCard';
import CompetitionCard from './CompetitionCard';

interface HomePageProps {
  onDancerClick: (dancerId: string) => void;
  onCompetitionClick: (competitionId: string) => void;
  dancers: Dancer[];
  competitions: Competition[];
  onViewChange: (view: 'home' | 'ranking' | 'competitions' | 'crews' | 'profile' | 'admin') => void;
}

const HomePage: React.FC<HomePageProps> = ({ onDancerClick, onCompetitionClick, dancers, competitions, onViewChange }) => {
  const { isDarkMode } = useTheme();
  const topDancers = dancers.slice(0, 9);
  const recentCompetitions = competitions.slice(0, 2);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <section className={`${isDarkMode ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black' : 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600'} text-white transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent ${
              isDarkMode 
                ? 'bg-gradient-to-r from-blue-400 to-purple-400' 
                : 'bg-gradient-to-r from-white to-blue-100'
            } transition-all duration-300`}>
              ChampStep
            </h1>
            <p className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto px-4 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-blue-100'
            }`}>
              전국 댄서들의 대회 수상 내역을 기반으로 한 투명하고 공정한 스텝 시스템
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <button className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl'
              }`}>
                스텝 보기
              </button>
              <button className={`border-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                isDarkMode
                  ? 'border-gray-400 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-300'
                  : 'border-white text-white hover:bg-white hover:text-blue-600'
              }`}>
                대회 정보
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-8 sm:py-12 lg:py-16 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              { icon: Trophy, label: '등록된 댄서', value: dancers.length, color: isDarkMode ? 'text-yellow-400' : 'text-yellow-600' },
              { icon: Calendar, label: '등록된 대회', value: competitions.length, color: isDarkMode ? 'text-blue-400' : 'text-blue-600' },
              { icon: TrendingUp, label: '총 참여 기록', value: '12', color: isDarkMode ? 'text-green-400' : 'text-green-600' },
              { icon: Star, label: '평균 스텝 점수', value: '22.3', color: isDarkMode ? 'text-purple-400' : 'text-purple-600' }
            ].map(({ icon: Icon, label, value, color }, index) => (
              <div key={index} className={`text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
              }`}>
                <Icon className={`h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 ${color}`} />
                <p className={`text-lg sm:text-2xl font-bold mb-1 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {value}
                </p>
                <p className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Dancers Section */}
      <section className={`py-8 sm:py-12 lg:py-16 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className={`text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🏆 현재 스텝 TOP 9
            </h2>
            <p className={`max-w-2xl mx-auto px-4 text-sm sm:text-base transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              대회 수상 내역을 바탕으로 산정된 현재 최고 스텝 댄서들을 만나보세요
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {topDancers.map((dancer) => (
              <DancerCard
                key={dancer.id}
                dancer={dancer}
                onClick={() => onDancerClick(dancer.id)}
              />
            ))}
          </div>
          
          {/* 전체 보기 버튼 */}
          <div className="text-center mt-8 sm:mt-12">
            <button
              onClick={() => onViewChange('ranking')}
              className={`inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 group ${
                isDarkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }`}
            >
              전체 스텝 보기
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* Recent Competitions Section */}
      <section className={`py-8 sm:py-12 lg:py-16 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className={`text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🎉 최근 대회
            </h2>
            <p className={`max-w-2xl mx-auto px-4 text-sm sm:text-base transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              최근에 개최된 주요 댄스 대회들과 결과를 확인해보세요
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
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

      {/* Features Section */}
      <section className={`py-8 sm:py-12 lg:py-16 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className={`text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ✨ 주요 기능
            </h2>
            <p className={`max-w-2xl mx-auto px-4 text-sm sm:text-base transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              ChampStep에서 제공하는 다양한 기능들을 확인해보세요
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: Trophy,
                title: '실시간 스텝',
                description: '대회 결과를 바탕으로 한 실시간 댄서 스텝 시스템',
                color: isDarkMode ? 'text-yellow-400 bg-yellow-900' : 'text-yellow-600 bg-yellow-50'
              },
              {
                icon: Users,
                title: '크루 관리',
                description: '댄스 크루 정보와 멤버 관리, 스케줄링 기능',
                color: isDarkMode ? 'text-blue-400 bg-blue-900' : 'text-blue-600 bg-blue-50'
              },
              {
                icon: Calendar,
                title: '대회 정보',
                description: '다양한 댄스 대회 정보와 참가 신청 기능',
                color: isDarkMode ? 'text-green-400 bg-green-900' : 'text-green-600 bg-green-50'
              },
              {
                icon: Award,
                title: '수상 내역',
                description: '개인별 상세한 대회 수상 내역과 성과 분석',
                color: isDarkMode ? 'text-purple-400 bg-purple-900' : 'text-purple-600 bg-purple-50'
              },
              {
                icon: Target,
                title: '스텝 시스템',
                description: '투명하고 공정한 스텝 점수 산정 시스템',
                color: isDarkMode ? 'text-red-400 bg-red-900' : 'text-red-600 bg-red-50'
              },
              {
                icon: TrendingUp,
                title: '성장 추적',
                description: '개인 성장과 발전 과정을 추적하고 분석',
                color: isDarkMode ? 'text-indigo-400 bg-indigo-900' : 'text-indigo-600 bg-indigo-50'
              }
            ].map(({ icon: Icon, title, description, color }, index) => (
              <div key={index} className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 ${
                isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl'
              }`}>
                <div className={`p-3 rounded-lg ${color} w-fit mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className={`text-lg sm:text-xl font-bold mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {title}
                </h3>
                <p className={`text-sm sm:text-base transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-8 sm:py-12 lg:py-16 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            지금 바로 시작하세요
          </h2>
          <p className={`text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            ChampStep과 함께 당신의 댄스 여정을 기록하고 성장해보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center ${
              isDarkMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
            }`}>
              <span>스텝 확인하기</span>
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button className={`border-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
              isDarkMode
                ? 'border-gray-400 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-300'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400'
            }`}>
              크루 둘러보기
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;