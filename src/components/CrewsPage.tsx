import React, { useState, useEffect } from 'react';
import { Users, Calendar, Plus, MapPin, Clock, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Crew, Dancer, CrewSchedule, Message } from '../types';
import MessageModal from './MessageModal';
import MessageList from './MessageList';

interface CrewsPageProps {
  crews: Crew[];
  dancers: Dancer[];
  selectedCrew?: Crew | null;
  messages?: Message[];
  onSendMessage?: (message: Omit<Message, 'id' | 'createdAt'>) => void;
  onDancerClick?: (dancerId: string) => void;
}

const CrewsPage: React.FC<CrewsPageProps> = ({ crews, dancers, selectedCrew: propSelectedCrew, messages = [], onSendMessage, onDancerClick }) => {
  const { isDarkMode } = useTheme();
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(propSelectedCrew || null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('전체');

  // prop으로 전달된 selectedCrew가 변경되면 상태 업데이트
  useEffect(() => {
    if (propSelectedCrew) {
      setSelectedCrew(propSelectedCrew);
    }
  }, [propSelectedCrew]);
  const [newSchedule, setNewSchedule] = useState<Omit<CrewSchedule, 'id' | 'createdAt'>>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'practice',
    isPublic: true,
    createdBy: 'current_user' // 실제로는 로그인한 사용자 ID
  });

  const handleCrewClick = (crew: Crew) => {
    setSelectedCrew(crew);
  };

  const handleBackToList = () => {
    setSelectedCrew(null);
  };

  const handleAddSchedule = () => {
    if (selectedCrew && newSchedule.title && newSchedule.date && newSchedule.time) {
      // 실제 구현에서는 API 호출
      const schedule: CrewSchedule = {
        ...newSchedule,
        id: `schedule_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      
      // 임시로 선택된 크루의 스케줄에 추가
      const updatedCrew = {
        ...selectedCrew,
        schedules: [...selectedCrew.schedules, schedule]
      };
      setSelectedCrew(updatedCrew);
      
      // 폼 초기화
      setNewSchedule({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        type: 'practice',
        isPublic: true,
        createdBy: 'current_user'
      });
      setShowScheduleModal(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'practice': return 'bg-blue-100 text-blue-800';
      case 'performance': return 'bg-red-100 text-red-800';
      case 'meeting': return 'bg-green-100 text-green-800';
      case 'workshop': return 'bg-purple-100 text-purple-800';
      case 'competition': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'practice': return '연습';
      case 'performance': return '공연';
      case 'meeting': return '미팅';
      case 'workshop': return '워크샵';
      case 'competition': return '대회';
      default: return type;
    }
  };

  // 크루들의 장르 목록 추출
  const getAvailableGenres = () => {
    const genres = new Set<string>();
    crews.forEach(crew => {
      if (crew.genre) {
        genres.add(crew.genre);
      }
    });
    return ['전체', ...Array.from(genres).sort()];
  };

  // 선택된 장르에 따라 크루 필터링
  const filteredCrews = selectedGenre === '전체' 
    ? crews 
    : crews.filter(crew => crew.genre === selectedGenre);

  const handleGenreFilter = (genre: string) => {
    setSelectedGenre(genre);
  };

  const handleSendMessage = async (message: Omit<Message, 'id' | 'createdAt'>) => {
    if (onSendMessage) {
      await onSendMessage(message);
    }
  };

  // 크루에게 온 메시지 필터링
  const crewMessages = selectedCrew 
    ? messages.filter(msg => msg.targetId === selectedCrew.id && msg.targetType === 'crew')
    : [];

  if (selectedCrew) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <button
            onClick={handleBackToList}
            className={`mb-6 px-4 py-2 rounded-lg font-medium transition-colors ${
              isDarkMode 
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } shadow-sm`}
          >
            ← 크루 목록으로 돌아가기
          </button>

          {/* 크루 헤더 */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedCrew.avatar}
                  alt={selectedCrew.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedCrew.name}
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedCrew.genre} • {selectedCrew.members.length}명
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMessageModal(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  isDarkMode 
                    ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' 
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                <span>메시지 보내기</span>
              </button>
            </div>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
              {selectedCrew.introduction}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 멤버 목록 */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
                <Users className="mr-2 h-5 w-5" />
                멤버 ({selectedCrew.members.length})
              </h2>
              <div className="space-y-3">
                {selectedCrew.members.map((member) => (
                  <div 
                    key={member.id} 
                    onClick={() => onDancerClick && onDancerClick(member.id)}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all cursor-pointer ${
                      onDancerClick 
                        ? isDarkMode 
                          ? 'hover:bg-gray-700' 
                          : 'hover:bg-gray-50'
                        : ''
                    }`}
                  >
                    <img
                      src={member.avatar}
                      alt={member.nickname}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className={`font-medium transition-colors ${
                        onDancerClick 
                          ? isDarkMode 
                            ? 'text-blue-400 hover:text-blue-300' 
                            : 'text-blue-600 hover:text-blue-700'
                          : isDarkMode 
                            ? 'text-white' 
                            : 'text-gray-900'
                      }`}>
                        {member.nickname}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {member.name} • 랭킹 #{member.rank}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {member.genres.slice(0, 2).map((genre) => (
                        <span
                          key={genre}
                          className={`px-2 py-1 text-xs rounded-full ${
                            isDarkMode 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 스케줄 캘린더 */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                  <Calendar className="mr-2 h-5 w-5" />
                  스케줄
                </h2>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  추가
                </button>
              </div>
              
              {selectedCrew.schedules.length === 0 ? (
                <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  등록된 스케줄이 없습니다.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedCrew.schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`p-3 rounded-lg border ${
                        isDarkMode 
                          ? 'border-gray-700 bg-gray-700' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {schedule.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(schedule.type)}`}>
                            {getTypeLabel(schedule.type)}
                          </span>
                          {schedule.isPublic ? (
                            <Eye className="h-4 w-4 text-green-500" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {schedule.date} {schedule.time}
                        </div>
                        {schedule.location && (
                          <div className="flex items-center">
                            <MapPin className="mr-1 h-3 w-3" />
                            {schedule.location}
                          </div>
                        )}
                        {schedule.description && (
                          <p className="mt-2">{schedule.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 메시지 섹션 */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mt-6`}>
            <MessageList 
              messages={crewMessages}
              targetType="crew"
              targetName={selectedCrew.name}
            />
          </div>
        </div>

        {/* 스케줄 추가 모달 */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                스케줄 추가
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    제목
                  </label>
                  <input
                    type="text"
                    value={newSchedule.title}
                    onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="스케줄 제목"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    유형
                  </label>
                  <select
                    value={newSchedule.type}
                    onChange={(e) => setNewSchedule({...newSchedule, type: e.target.value as any})}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="practice">연습</option>
                    <option value="performance">공연</option>
                    <option value="meeting">미팅</option>
                    <option value="workshop">워크샵</option>
                    <option value="competition">대회</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      날짜
                    </label>
                    <input
                      type="date"
                      value={newSchedule.date}
                      onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      시간
                    </label>
                    <input
                      type="time"
                      value={newSchedule.time}
                      onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    장소
                  </label>
                  <input
                    type="text"
                    value={newSchedule.location}
                    onChange={(e) => setNewSchedule({...newSchedule, location: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="장소"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    설명
                  </label>
                  <textarea
                    value={newSchedule.description}
                    onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    rows={3}
                    placeholder="스케줄 설명"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newSchedule.isPublic}
                    onChange={(e) => setNewSchedule({...newSchedule, isPublic: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="isPublic" className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    공개 스케줄
                  </label>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                >
                  취소
                </button>
                <button
                  onClick={handleAddSchedule}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 메시지 모달 */}
        {showMessageModal && onSendMessage && (
          <MessageModal
            isOpen={showMessageModal}
            onClose={() => setShowMessageModal(false)}
            targetType="crew"
            targetName={selectedCrew.name}
            targetId={selectedCrew.id}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            크루
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            다양한 댄스 크루들과 멤버들을 확인해보세요
          </p>
          
          {/* 장르 필터 버튼 */}
          <div className="flex flex-wrap gap-3 mb-8">
            {getAvailableGenres().map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreFilter(genre)}
                className={`group relative px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                  selectedGenre === genre
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-600 hover:border-gray-500'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-md hover:shadow-lg border border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{genre}</span>
                  <span className={`inline-flex items-center justify-center min-w-[24px] h-6 text-xs font-bold rounded-full ${
                    selectedGenre === genre
                      ? 'bg-white/20 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-400 group-hover:bg-gray-600 group-hover:text-gray-300'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-700'
                  }`}>
                    {genre === '전체' ? crews.length : crews.filter(crew => crew.genre === genre).length}
                  </span>
                </span>
                {selectedGenre === genre && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {filteredCrews.length === 0 ? (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>{selectedGenre === '전체' ? '등록된 크루가 없습니다.' : `${selectedGenre} 장르의 크루가 없습니다.`}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCrews.map((crew) => (
              <div
                key={crew.id}
                onClick={() => handleCrewClick(crew)}
                className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} 
                  rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-xl`}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={crew.avatar}
                    alt={crew.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {crew.name}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {crew.genre}
                    </p>
                  </div>
                </div>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm mb-4 line-clamp-3`}>
                  {crew.introduction}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {crew.members.length}명
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {crew.schedules.length}개 스케줄
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrewsPage;
