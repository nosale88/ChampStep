import { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Header from './components/Header';
import HomePage from './components/HomePage';
import RankingPage from './components/RankingPage';
import CompetitionsPage from './components/CompetitionsPage';
import CrewsPage from './components/CrewsPage';
import DancerDetailModal from './components/DancerDetailModal';
import CompetitionDetailModal from './components/CompetitionDetailModal';
import { fetchDancers } from './services/dancerService';
import { fetchCompetitions } from './services/competitionService';
import { fetchCrews } from './services/crewService';
import { Competition, Dancer, Crew, Message } from './types';

function AppContent() {
  const { isDarkMode } = useTheme();
  const [currentView, setCurrentView] = useState<'home' | 'ranking' | 'competitions' | 'crews'>('home');
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
      try {
        const [dancersData, competitionsData, crewsData] = await Promise.all([
          fetchDancers(),
          fetchCompetitions(),
          fetchCrews()
        ]);
        setDancers(dancersData);
        setCompetitions(competitionsData);
        setCrews(crewsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedDancer = selectedDancerId ? dancers.find(d => d.id === selectedDancerId) : null;
  const selectedCompetition = selectedCompetitionId ? competitions.find(c => c.id === selectedCompetitionId) : null;

  const handleDancerClick = (dancerId: string) => {
    setSelectedCompetitionId(null); // Close competition modal if open
    setSelectedDancerId(dancerId);
  };

  const handleCompetitionClick = (competitionId: string) => {
    setSelectedDancerId(null); // Close dancer modal if open
    setSelectedCompetitionId(competitionId);
  };

  const closeDancerModal = () => {
    setSelectedDancerId(null);
  };

  const closeCompetitionModal = () => {
    setSelectedCompetitionId(null);
  };

  const handleSelectCompetitionFromDancer = (competition: Competition) => {
    closeDancerModal();
    handleCompetitionClick(competition.id);
  };

  const handleSelectCrewFromDancer = (crew: Crew) => {
    closeDancerModal();
    setSelectedCrew(crew);
    setCurrentView('crews');
  };

  const handleSelectDancerFromCrew = (dancerId: string) => {
    setSelectedCrew(null); // Close crew view
    handleDancerClick(dancerId);
  };

  const handleSendMessage = async (message: Omit<Message, 'id' | 'createdAt'>) => {
    // 실제로는 API 호출을 하겠지만, 지금은 로컬 상태로 관리
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading ChampStep...</p>
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
        />
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
        />
      )}

      {selectedCompetition && (
        <CompetitionDetailModal
          competition={selectedCompetition}
          isOpen={!!selectedCompetition}
          onClose={closeCompetitionModal}
          onDancerClick={handleDancerClick} // Added for future implementation
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;