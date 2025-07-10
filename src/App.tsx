import { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import HomePage from './components/HomePage';
import RankingPage from './components/RankingPage';
import CompetitionsPage from './components/CompetitionsPage';
import CrewsPage from './components/CrewsPage';
import ProfilePage from './components/ProfilePage';
import DancerDetailModal from './components/DancerDetailModal';
import CompetitionDetailModal from './components/CompetitionDetailModal';
import { fetchDancers } from './services/dancerService';
import { fetchCompetitions } from './services/competitionService';
import { fetchCrews } from './services/crewService';
import { Competition, Dancer, Crew, Message } from './types';

function AppContent() {
  const { isDarkMode } = useTheme();
  const { dancer: authDancer } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'ranking' | 'competitions' | 'crews' | 'profile'>('home');
  const [selectedDancerId, setSelectedDancerId] = useState<string | null>(null);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [dancers, setDancers] = useState<Dancer[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      console.log('🚀 Starting data load...');
      
      // 최대 5초 로딩 제한
      const maxLoadingTime = setTimeout(() => {
        console.log('⏰ Max loading time reached, forcing completion');
        setLoading(false);
      }, 5000);
      
      try {
        console.log('📊 Fetching data from services...');
        
        // 우선순위별 로딩: 댄서 > 대회 > 크루 순서
        // 댄서 데이터 먼저 로딩 (홈페이지에서 가장 중요)
        const dancersPromise = fetchDancers();
        
        // 0.5초 후 대회 데이터 로딩 시작
        const competitionsPromise = new Promise<Competition[]>(resolve => {
          setTimeout(() => resolve(fetchCompetitions()), 500);
        });
        
        // 1초 후 크루 데이터 로딩 시작
        const crewsPromise = new Promise<Crew[]>(resolve => {
          setTimeout(() => resolve(fetchCrews()), 1000);
        });
        
        // 모든 요청을 병렬로 처리하되, 실패해도 계속 진행
        const [dancersData, competitionsData, crewsData] = await Promise.allSettled([
          dancersPromise,
          competitionsPromise,
          crewsPromise
        ]);
        
        // 성공한 데이터만 추출
        const dancers = dancersData.status === 'fulfilled' ? dancersData.value : [];
        const competitions = competitionsData.status === 'fulfilled' ? competitionsData.value : [];
        const crews = crewsData.status === 'fulfilled' ? crewsData.value : [];
        
        console.log('✅ Data fetch completed:', {
          dancers: dancers.length,
          competitions: competitions.length,
          crews: crews.length,
          dancersStatus: dancersData.status,
          competitionsStatus: competitionsData.status,
          crewsStatus: crewsData.status
        });
        
        // 댄서 데이터 처리 (최우선)
        if (dancers.length > 0) {
          console.log('🎯 Using real dancer data from database');
          setDancers(dancers);
        } else {
          console.log('⚠️ No dancer data found, using mock data');
          const { dancers: mockDancers } = await import('./data/mockData');
          setDancers(mockDancers.slice(0, 50)); // 상위 50명만 사용
        }
        
        // 대회 데이터 처리
        if (competitions.length > 0) {
          console.log('🎯 Using real competition data from database');
          setCompetitions(competitions);
        } else {
          console.log('⚠️ No competition data found, using mock data');
          const { competitions: mockCompetitions } = await import('./data/mockData');
          setCompetitions(mockCompetitions.slice(0, 10)); // 최근 10개만 사용
        }
        
        // 크루 데이터 처리
        if (crews.length > 0) {
          console.log('🎯 Using real crew data from database');
          setCrews(crews);
        } else {
          console.log('⚠️ No crew data found, using mock data');
          const { crews: mockCrews } = await import('./data/mockData');
          setCrews(mockCrews.slice(0, 20)); // 상위 20개만 사용
        }
        
      } catch (error) {
        console.error('❌ Critical error loading data:', error);
        // 완전한 오류 시 최소한의 목데이터 사용
        console.log('🔄 Using minimal mock data as complete fallback');
        try {
          const mockData = await import('./data/mockData');
          setDancers(mockData.dancers.slice(0, 20));
          setCompetitions(mockData.competitions.slice(0, 5));
          setCrews(mockData.crews.slice(0, 10));
        } catch (mockError) {
          console.error('❌ Even mock data failed:', mockError);
          // 완전 실패 시 빈 배열
          setDancers([]);
          setCompetitions([]);
          setCrews([]);
        }
      } finally {
        clearTimeout(maxLoadingTime);
        console.log('🏁 Data loading completed, setting loading to false');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedDancer = selectedDancerId ? dancers.find(d => d.id === selectedDancerId) : null;
  const selectedCompetition = selectedCompetitionId ? competitions.find(c => c.id === selectedCompetitionId) : null;

  const handleDancerClick = (dancerId: string) => {
    setSelectedCompetitionId(null);
    setSelectedDancerId(dancerId);
  };

  const handleCompetitionClick = (competitionId: string) => {
    setSelectedDancerId(null);
    setSelectedCompetitionId(competitionId);
  };

  const closeDancerModal = () => {
    setSelectedDancerId(null);
  };

  const closeCompetitionModal = () => {
    setSelectedCompetitionId(null);
  };

  const handleSendMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleSelectDancerFromCrew = (dancerId: string) => {
    setSelectedCrew(null);
    handleDancerClick(dancerId);
  };

  const handleSelectCompetitionFromDancer = (competitionId: string) => {
    setSelectedDancerId(null);
    handleCompetitionClick(competitionId);
  };

  const handleSelectCrewFromDancer = (crew: Crew) => {
    setSelectedCrew(crew);
    setSelectedDancerId(null);
    setCurrentView('crews');
  };

  const handleUpdateDancer = (updatedDancer: Dancer) => {
    setDancers(prev => prev.map(d => d.id === updatedDancer.id ? updatedDancer : d));
  };

  const handleUpdateCrew = (updatedCrew: Crew) => {
    setCrews(prev => prev.map(c => c.id === updatedCrew.id ? updatedCrew : c));
  };

  const crewMessages = messages.filter(msg => 
    msg.targetType === 'crew' && 
    selectedCrew && 
    msg.targetId === selectedCrew.id
  );

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      {currentView === 'home' && (
        <HomePage 
          onDancerClick={handleDancerClick}
          onCompetitionClick={handleCompetitionClick}
          dancers={dancers}
          competitions={competitions}
        />
      )}
      
      {currentView === 'ranking' && (
        <RankingPage 
          onDancerClick={handleDancerClick}
          dancers={dancers}
        />
      )}
      
      {currentView === 'competitions' && (
        <CompetitionsPage 
          onCompetitionClick={handleCompetitionClick}
          competitions={competitions}
        />
      )}

      {currentView === 'crews' && (
        <CrewsPage 
          crews={crews} 
          dancers={dancers} 
          selectedCrew={selectedCrew}
          messages={messages}
          onSendMessage={handleSendMessage}
          onDancerClick={handleSelectDancerFromCrew}
          onUpdateCrew={handleUpdateCrew}
          currentDancer={authDancer}
        />
      )}

      {currentView === 'profile' && (
        <ProfilePage />
      )}

      {selectedDancer && (
        <DancerDetailModal
          dancer={selectedDancer}
          isOpen={!!selectedDancer}
          onClose={closeDancerModal}
          onSelectCompetition={handleSelectCompetitionFromDancer}
          onSelectCrew={handleSelectCrewFromDancer}
          crews={crews}
          messages={messages}
          onSendMessage={handleSendMessage}
          onDancerClick={handleSelectDancerFromCrew}
          onUpdateDancer={handleUpdateDancer}
        />
      )}

      {selectedCompetition && (
        <CompetitionDetailModal
          competition={selectedCompetition}
          isOpen={!!selectedCompetition}
          onClose={closeCompetitionModal}
          onDancerClick={handleDancerClick}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;