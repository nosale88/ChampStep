import { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import HomePage from './components/HomePage';
import RankingPage from './components/RankingPage';
import CompetitionsPage from './components/CompetitionsPage';
import CrewsPage from './components/CrewsPage';
import ProfilePage from './components/ProfilePage';
import AdminPanel from './components/AdminPanel';
import DancerDetailModal from './components/DancerDetailModal';
import CompetitionDetailModal from './components/CompetitionDetailModal';
import { fetchDancers } from './services/dancerService';
import { fetchCompetitions } from './services/competitionService';
import { fetchCrews } from './services/crewService';
import { Competition, Dancer, Crew, Message } from './types';

function AppContent() {
  const { isDarkMode } = useTheme();
  const { dancer: authDancer } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'ranking' | 'competitions' | 'crews' | 'profile' | 'admin'>('home');
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
        
        // 병렬로 모든 데이터 로딩 (타임아웃 제거하여 성능 개선)
        const [dancersData, competitionsData, crewsData] = await Promise.allSettled([
          fetchDancers(),
          fetchCompetitions(), 
          fetchCrews()
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
        
        // 실제 데이터 내용도 로그로 확인
        console.log('👥 Dancers data:', dancers.slice(0, 3));
        console.log('🏆 Competitions data:', competitions.slice(0, 3));
        console.log('👨‍👩‍👧‍👦 Crews data:', crews.slice(0, 3));
        
        // 데이터 설정
        setDancers(dancers);
        setCompetitions(competitions);
        setCrews(crews);
        
      } catch (error) {
        console.error('❌ Critical error loading data:', error);
        setDancers([]);
        setCompetitions([]);
        setCrews([]);
      } finally {
        console.log('🏁 Data loading completed, setting loading to false');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedDancer = useMemo(() => 
    selectedDancerId ? dancers.find(d => d.id === selectedDancerId) : null,
    [selectedDancerId, dancers]
  );
  
  const selectedCompetition = useMemo(() => 
    selectedCompetitionId ? competitions.find(c => c.id === selectedCompetitionId) : null,
    [selectedCompetitionId, competitions]
  );

  const handleDancerClick = useCallback((dancerId: string) => {
    setSelectedCompetitionId(null);
    setSelectedDancerId(dancerId);
  }, []);

  const handleCompetitionClick = useCallback((competitionId: string) => {
    setSelectedDancerId(null);
    setSelectedCompetitionId(competitionId);
  }, []);

  const closeDancerModal = useCallback(() => {
    setSelectedDancerId(null);
  }, []);

  const closeCompetitionModal = useCallback(() => {
    setSelectedCompetitionId(null);
  }, []);

  const handleSendMessage = useCallback(async (message: Omit<Message, 'id' | 'createdAt'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const handleSelectDancerFromCrew = useCallback((dancerId: string) => {
    setSelectedCrew(null);
    handleDancerClick(dancerId);
  }, [handleDancerClick]);

  const handleSelectCompetitionFromDancer = useCallback((competition: Competition) => {
    setSelectedDancerId(null);
    handleCompetitionClick(competition.id);
  }, [handleCompetitionClick]);

  const handleSelectCrewFromDancer = useCallback((crew: Crew) => {
    setSelectedCrew(crew);
    setSelectedDancerId(null);
    setCurrentView('crews');
  }, []);

  const handleUpdateDancer = useCallback((dancerId: string, updates: Partial<Dancer>) => {
    setDancers(prev => prev.map(d => d.id === dancerId ? { ...d, ...updates } : d));
  }, []);

  const handleUpdateCrew = useCallback((crewId: string, updates: Partial<Crew>) => {
    setCrews(prev => prev.map(c => c.id === crewId ? { ...c, ...updates } : c));
  }, []);

  const handleUpdateCompetitions = useCallback((updatedCompetitions: Competition[]) => {
    setCompetitions(updatedCompetitions);
  }, []);

  // const crewMessages = messages.filter(msg => 
  //   msg.targetType === 'crew' && 
  //   selectedCrew && 
  //   msg.targetId === selectedCrew.id
  // );

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
          dancers={dancers}
          crews={crews}
          onUpdateCompetitions={handleUpdateCompetitions}
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

      {currentView === 'admin' && (
        <AdminPanel />
      )}

      {selectedDancer && (
        <DancerDetailModal
          dancer={selectedDancer}
          isOpen={!!selectedDancer}
          onClose={closeDancerModal}
          onSelectCompetition={handleSelectCompetitionFromDancer}
          onSelectCrew={handleSelectCrewFromDancer}
          crews={crews}
          dancers={dancers}
          comments={[]}
          onAddComment={async (comment) => {
            // 댓글 추가 로직 구현
            console.log('Add comment:', comment);
          }}
          onUpdateComment={async (commentId: string, content: string) => {
            // 댓글 수정 로직 구현
            console.log('Update comment:', commentId, content);
          }}
          onDeleteComment={async (commentId: string) => {
            // 댓글 삭제 로직 구현
            console.log('Delete comment:', commentId);
          }}
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
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;