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
      try {
        console.log('📊 Fetching data from services...');
        
        // 실제 데이터 로딩 (타임아웃 없이)
        const [dancersData, competitionsData, crewsData] = await Promise.all([
          fetchDancers(),
          fetchCompetitions(),
          fetchCrews()
        ]);
        
        console.log('✅ Data fetched successfully:', {
          dancers: dancersData.length,
          competitions: competitionsData.length,
          crews: crewsData.length
        });
        
        // 실제 데이터가 있으면 사용
        if (dancersData.length > 0 || competitionsData.length > 0 || crewsData.length > 0) {
          console.log('🎯 Using real data from database');
          setDancers(dancersData);
          setCompetitions(competitionsData);
          setCrews(crewsData);
        } else {
          console.log('⚠️ No real data found, using mock data');
          const { dancers } = await import('./data/mockData');
          const { competitions } = await import('./data/mockData');
          const { crews } = await import('./data/mockData');
          
          setDancers(dancers);
          setCompetitions(competitions);
          setCrews(crews);
        }
      } catch (error) {
        console.error('❌ Error loading data:', error);
        // 오류 시에만 목데이터 사용
        console.log('🔄 Using mock data as fallback due to error');
        const { dancers } = await import('./data/mockData');
        const { competitions } = await import('./data/mockData');
        const { crews } = await import('./data/mockData');
        
        setDancers(dancers);
        setCompetitions(competitions);
        setCrews(crews);
      } finally {
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