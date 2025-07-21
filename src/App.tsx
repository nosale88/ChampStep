import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { addComment, updateComment, deleteComment } from './services/commentService';
import { testSupabaseConnection } from './lib/supabase';

import { Competition, Dancer, Crew, Message, Comment } from './types';

function AppContent() {
  const { isDarkMode } = useTheme();
  const { dancer: authDancer } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // URL 경로에 따라 초기 뷰 설정
  const getInitialView = (): 'home' | 'ranking' | 'competitions' | 'crews' | 'profile' | 'admin' => {
    const path = location.pathname;
    console.log('🔍 Current pathname:', path);
    
    if (path === '/ranking') return 'ranking';
    if (path === '/competitions') return 'competitions';
    if (path === '/crews') return 'crews';
    if (path === '/profile') return 'profile';
    if (path === '/admin') return 'admin';
    return 'home';
  };
  
  const [currentView, setCurrentView] = useState<'home' | 'ranking' | 'competitions' | 'crews' | 'profile' | 'admin'>(getInitialView());
  const [selectedDancerId, setSelectedDancerId] = useState<string | null>(null);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [dancers, setDancers] = useState<Dancer[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      console.log('🚀 Starting data load...');
      
      // 먼저 Supabase 연결 테스트
      const isConnected = await testSupabaseConnection();
      if (!isConnected) {
        console.error('❌ Supabase connection failed, loading with empty data');
        setDancers([]);
        setCompetitions([]);
        setCrews([]);
        setLoading(false);
        return;
      }
      
      try {
        console.log('📊 Fetching data from services...');
        
        // 모든 데이터를 병렬로 로드
        const [dancers, competitions, crews] = await Promise.all([
          fetchDancers(),
          fetchCompetitions(), 
          fetchCrews()
        ]);
        
        console.log('✅ Data fetch completed:', {
          dancers: dancers.length,
          competitions: competitions.length,
          crews: crews.length
        });
        
        // 데이터 설정
        setDancers(dancers);
        setCompetitions(competitions);
        setCrews(crews);
        
      } catch (error) {
        console.error('❌ Critical error loading data:', error);
        // 에러 발생 시에도 빈 배열로 설정하여 앱이 계속 작동하도록 함
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

  // URL 변경 시 currentView 업데이트
  useEffect(() => {
    const newView = getInitialView();
    console.log('🔍 URL changed - current view:', currentView, 'new view:', newView);
    if (newView !== currentView) {
      console.log('🔄 Updating current view to:', newView);
      setCurrentView(newView);
    }
  }, [location.pathname]);

  // 뷰 변경 핸들러 (URL도 함께 업데이트)
  const handleViewChange = useCallback((view: 'home' | 'ranking' | 'competitions' | 'crews' | 'profile' | 'admin') => {
    setCurrentView(view);
    const path = view === 'home' ? '/' : `/${view}`;
    navigate(path);
  }, [navigate]);

  const selectedDancer = useMemo(() => {
    console.log('📌 selectedDancerId:', selectedDancerId);
    console.log('👥 Total dancers:', dancers.length);
    
    if (!selectedDancerId) {
      console.log('🔍 No selectedDancerId');
      return null;
    }
    
    if (!dancers || dancers.length === 0) {
      console.log('🔍 No dancers available');
      return null;
    }
    
    const dancer = dancers.find(d => d && d.id === selectedDancerId);
    console.log('✅ Found dancer:', dancer);
    
    if (!dancer) {
      console.error('❌ Dancer not found for ID:', selectedDancerId);
      console.log('📋 Available dancer IDs:', dancers.map(d => d?.id).slice(0, 5));
    }
    
    return dancer;
  }, [selectedDancerId, dancers]);
  
  const selectedCompetition = useMemo(() => 
    selectedCompetitionId ? competitions.find(c => c.id === selectedCompetitionId) : null,
    [selectedCompetitionId, competitions]
  );

  const handleDancerClick = useCallback((dancerId: string) => {
    console.log('🎯 handleDancerClick called with dancerId:', dancerId);
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

  const handleAddComment = useCallback(async (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newComment = await addComment(comment);
      if (newComment) {
        if (comment.parentId) {
          // 답글인 경우: 부모 댓글의 replies 배열에 추가
          setComments(prev => prev.map(c => 
            c.id === comment.parentId 
              ? { ...c, replies: [...(c.replies || []), newComment] }
              : c
          ));
        } else {
          // 일반 댓글인 경우: 댓글 목록에 추가
          setComments(prev => [...prev, newComment]);
        }
        console.log('✅ Comment added to Supabase:', newComment);
      } else {
        console.error('❌ Failed to add comment to Supabase');
      }
    } catch (error) {
      console.error('❌ Error adding comment:', error);
    }
  }, []);

  const handleUpdateComment = useCallback(async (commentId: string, content: string) => {
    try {
      const success = await updateComment(commentId, content);
      if (success) {
        setComments(prev => prev.map(comment => {
          // 메인 댓글 수정
          if (comment.id === commentId) {
            return { ...comment, content, updatedAt: new Date().toISOString() };
          }
          
          // 답글 수정
          if (comment.replies) {
            const updatedReplies = comment.replies.map(reply => 
              reply.id === commentId 
                ? { ...reply, content, updatedAt: new Date().toISOString() }
                : reply
            );
            return { ...comment, replies: updatedReplies };
          }
          
          return comment;
        }));
        console.log('✅ Comment updated in Supabase:', commentId, content);
      } else {
        console.error('❌ Failed to update comment in Supabase');
      }
    } catch (error) {
      console.error('❌ Error updating comment:', error);
    }
  }, []);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    try {
      const success = await deleteComment(commentId);
      if (success) {
        setComments(prev => {
          // 먼저 메인 댓글에서 찾기
          const mainComment = prev.find(c => c.id === commentId);
          if (mainComment) {
            // 메인 댓글 삭제
            return prev.filter(comment => comment.id !== commentId);
          }
          
          // 답글에서 찾기
          return prev.map(comment => ({
            ...comment,
            replies: comment.replies?.filter(reply => reply.id !== commentId) || []
          }));
        });
        console.log('✅ Comment deleted from Supabase:', commentId);
      } else {
        console.error('❌ Failed to delete comment from Supabase');
      }
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
    }
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
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header currentView={currentView} onViewChange={handleViewChange} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg font-medium`}>댄서 정보를 불러오는 중...</p>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm mt-2`}>잠시만 기다려주세요</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header currentView={currentView} onViewChange={handleViewChange} />
      
      {currentView === 'home' && (
        <HomePage 
          onDancerClick={handleDancerClick}
          onCompetitionClick={handleCompetitionClick}
          dancers={dancers}
          competitions={competitions}
          onViewChange={handleViewChange}
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
        <>
          {console.log('🔍 Rendering AdminPanel - currentView:', currentView)}
          <AdminPanel 
            dancers={dancers}
            competitions={competitions}
            crews={crews}
          />
        </>
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
          comments={comments.filter(c => c.targetType === 'dancer' && c.targetId === selectedDancer.id)}
          onAddComment={handleAddComment}
          onUpdateComment={handleUpdateComment}
          onDeleteComment={handleDeleteComment}
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