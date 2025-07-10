import React, { useState, useEffect } from 'react';
import { Users, Calendar, Plus, MapPin, Clock, Eye, EyeOff, MessageCircle, ChevronLeft, ChevronRight, Edit2, Upload, Camera, X } from 'lucide-react';
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
  onUpdateCrew?: (crewId: string, updates: Partial<Crew>) => void;
  currentDancer?: Dancer | null;
}

type CalendarView = 'month' | 'week' | 'day';

const CrewsPage: React.FC<CrewsPageProps> = ({ crews, dancers, selectedCrew: propSelectedCrew, messages = [], onSendMessage, onDancerClick, onUpdateCrew, currentDancer }) => {
  const { isDarkMode } = useTheme();
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(propSelectedCrew || null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('전체');
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingCrew, setEditingCrew] = useState<Partial<Crew>>({});
  const [selectedDate, setSelectedDate] = useState<string>(''); // 선택된 날짜 상태 추가

  // prop으로 전달된 selectedCrew가 변경되면 상태 업데이트
  useEffect(() => {
    if (propSelectedCrew) {
      setSelectedCrew(propSelectedCrew);
      
      // 스케줄도 불러오기
      const loadSchedules = async () => {
        try {
          const { getCrewSchedules } = await import('../services/crewService');
          const schedules = await getCrewSchedules(propSelectedCrew.id);
          setSelectedCrew(prevCrew => prevCrew ? { ...prevCrew, schedules } : null);
        } catch (error) {
          console.error('Error loading crew schedules:', error);
        }
      };
      
      loadSchedules();
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

  const handleCrewClick = async (crew: Crew) => {
    setSelectedCrew(crew);
    
    // 선택된 크루의 스케줄 불러오기
    try {
      const { getCrewSchedules } = await import('../services/crewService');
      const schedules = await getCrewSchedules(crew.id);
      setSelectedCrew(prevCrew => prevCrew ? { ...prevCrew, schedules } : null);
    } catch (error) {
      console.error('Error loading crew schedules:', error);
    }
  };

  const handleBackToList = () => {
    setSelectedCrew(null);
  };

  const handleAddSchedule = async () => {
    if (selectedCrew && newSchedule.title && newSchedule.date && newSchedule.time) {
      try {
        // 실제 API 호출로 스케줄 추가
        const { addScheduleToCrew } = await import('../services/crewService');
        const addedSchedule = await addScheduleToCrew(selectedCrew.id, newSchedule);
        
        if (addedSchedule) {
          // 성공적으로 추가되면 로컬 상태 업데이트
          const updatedCrew = {
            ...selectedCrew,
            schedules: [...selectedCrew.schedules, addedSchedule]
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
          setSelectedDate('');
          setShowScheduleModal(false);
          
          alert('스케줄이 성공적으로 추가되었습니다!');
        } else {
          throw new Error('스케줄 추가에 실패했습니다.');
        }
      } catch (error) {
        console.error('Error adding schedule:', error);
        alert('스케줄 추가 중 오류가 발생했습니다.');
      }
    } else {
      alert('제목, 날짜, 시간을 모두 입력해주세요.');
    }
  };

  // 날짜 클릭 시 스케줄 등록 모달 열기
  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    setNewSchedule({
      ...newSchedule,
      date: dateString
    });
    setShowScheduleModal(true);
  };

  // 스케줄 모달 닫기
  const handleCloseScheduleModal = () => {
    setShowScheduleModal(false);
    setSelectedDate('');
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

  // 크루 멤버인지 확인
  const isCrewMember = (crew: Crew) => {
    if (!currentDancer) return false;
    return crew.members.some(member => member.id === currentDancer.id);
  };

  // 크루 정보 수정 시작
  const handleStartEdit = () => {
    if (selectedCrew) {
      setEditingCrew({
        name: selectedCrew.name,
        genre: selectedCrew.genre,
        introduction: selectedCrew.introduction,
        backgroundImage: selectedCrew.backgroundImage
      });
      setShowEditModal(true);
    }
  };

  // 크루 정보 저장
  const handleSaveEdit = () => {
    if (selectedCrew && onUpdateCrew) {
      onUpdateCrew(selectedCrew.id, editingCrew);
      setShowEditModal(false);
      // 로컬 상태도 업데이트
      setSelectedCrew({
        ...selectedCrew,
        ...editingCrew
      });
    }
  };

  // 이미지 업로드 처리
  const handleImageUpload = (type: 'background' | 'avatar') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          setEditingCrew({
            ...editingCrew,
            [type === 'background' ? 'backgroundImage' : 'avatar']: imageUrl
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // 크루에게 온 메시지 필터링
  const crewMessages = selectedCrew 
    ? messages.filter(msg => msg.targetId === selectedCrew.id && msg.targetType === 'crew')
    : [];

  // 캘린더 관련 함수들
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getWeekDays = (date: Date) => {
    const days = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const formatDate = (date: Date, view: CalendarView) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: view === 'month' ? 'long' : 'short',
      day: 'numeric'
    };
    return date.toLocaleDateString('ko-KR', options);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date: Date, currentDate: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getSchedulesForDate = (date: Date) => {
    if (!selectedCrew) return [];
    return selectedCrew.schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      return scheduleDate.toDateString() === date.toDateString();
    });
  };

  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (calendarView) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  const getCalendarTitle = () => {
    switch (calendarView) {
      case 'month':
        return currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
      case 'week':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}`;
      case 'day':
        return currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  };

  const renderCalendarView = () => {
    switch (calendarView) {
      case 'month':
        return renderMonthView();
      case 'week':
        return renderWeekView();
      case 'day':
        return renderDayView();
    }
  };

  const renderMonthView = () => {
    const days = getMonthDays(currentDate);
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    return (
      <div>
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, index) => (
            <div key={day} className={`text-center text-sm font-medium py-2 ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {day}
            </div>
          ))}
        </div>
        
        {/* 달력 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const schedules = getSchedulesForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(day)}
                className={`min-h-[80px] p-1 border transition-colors cursor-pointer hover:bg-blue-50 ${
                  isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-blue-50'
                } ${
                  isCurrentMonth 
                    ? isDarkMode ? 'bg-gray-800' : 'bg-white'
                    : isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
                } ${
                  isTodayDate ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isTodayDate 
                    ? 'text-blue-500' 
                    : isCurrentMonth 
                      ? isDarkMode ? 'text-white' : 'text-gray-900'
                      : isDarkMode ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {schedules.slice(0, 2).map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`text-xs px-1 py-0.5 rounded text-white truncate ${
                        schedule.type === 'practice' ? 'bg-blue-500' :
                        schedule.type === 'performance' ? 'bg-red-500' :
                        schedule.type === 'meeting' ? 'bg-green-500' :
                        schedule.type === 'workshop' ? 'bg-purple-500' :
                        'bg-orange-500'
                      }`}
                    >
                      {schedule.title}
                    </div>
                  ))}
                  {schedules.length > 2 && (
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      +{schedules.length - 2}개 더
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const days = getWeekDays(currentDate);
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    return (
      <div>
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {days.map((day, index) => (
            <div key={index} className="text-center">
              <div className={`text-sm font-medium ${
                index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {weekDays[index]}
              </div>
              <div className={`text-lg font-bold mt-1 ${
                isToday(day) 
                  ? 'text-blue-500' 
                  : isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
        
        {/* 주간 스케줄 */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const schedules = getSchedulesForDate(day);
            const isTodayDate = isToday(day);
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(day)}
                className={`min-h-[200px] p-2 border rounded-lg cursor-pointer transition-colors hover:bg-blue-50 ${
                  isDarkMode ? 'border-gray-700 bg-gray-800 hover:bg-gray-700' : 'border-gray-200 bg-white hover:bg-blue-50'
                } ${
                  isTodayDate ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="space-y-2">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`p-2 rounded text-xs ${
                        schedule.type === 'practice' ? 'bg-blue-100 text-blue-800' :
                        schedule.type === 'performance' ? 'bg-red-100 text-red-800' :
                        schedule.type === 'meeting' ? 'bg-green-100 text-green-800' :
                        schedule.type === 'workshop' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}
                    >
                      <div className="font-medium">{schedule.title}</div>
                      <div className="text-xs opacity-75">{schedule.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const schedules = getSchedulesForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="space-y-4">
        <div className={`text-center text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {formatDate(currentDate, 'day')}
        </div>
        
        <div className="space-y-2">
          {hours.map((hour) => {
            const hourSchedules = schedules.filter(schedule => {
              const scheduleHour = parseInt(schedule.time.split(':')[0]);
              return scheduleHour === hour;
            });
            
            return (
              <div
                key={hour}
                onClick={() => handleDateClick(currentDate)}
                className={`flex border-b cursor-pointer hover:bg-blue-50 p-2 rounded transition-colors ${
                  isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-blue-50'
                } pb-2`}
              >
                <div className={`w-16 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1 ml-4">
                  {hourSchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`p-3 rounded-lg mb-2 ${
                        schedule.type === 'practice' ? 'bg-blue-100 text-blue-800' :
                        schedule.type === 'performance' ? 'bg-red-100 text-red-800' :
                        schedule.type === 'meeting' ? 'bg-green-100 text-green-800' :
                        schedule.type === 'workshop' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}
                    >
                      <div className="font-medium">{schedule.title}</div>
                      <div className="text-sm opacity-75">{schedule.time}</div>
                      {schedule.location && (
                        <div className="text-sm opacity-75 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {schedule.location}
                        </div>
                      )}
                      {schedule.description && (
                        <div className="text-sm mt-2">{schedule.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
              <div className="flex items-center space-x-2">
                {isCrewMember(selectedCrew) && (
                  <button
                    onClick={handleStartEdit}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                      isDarkMode 
                        ? 'bg-purple-900 text-purple-300 hover:bg-purple-800' 
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>크루 정보 수정</span>
                  </button>
                )}
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
            </div>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
              {selectedCrew.introduction}
            </p>
          </div>

          {/* 스케줄 캘린더 - 메인 영역 */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                <Calendar className="mr-2 h-5 w-5" />
                스케줄 캘린더
              </h2>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                스케줄 추가
              </button>
            </div>

            {/* 캘린더 컨트롤 */}
            <div className="flex items-center justify-between mb-6">
              {/* 뷰 전환 탭 */}
              <div className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                {[
                  { key: 'month', label: '월간' },
                  { key: 'week', label: '주간' },
                  { key: 'day', label: '일간' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setCalendarView(key as CalendarView)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      calendarView === key
                        ? 'bg-blue-500 text-white shadow-sm'
                        : isDarkMode
                        ? 'text-gray-300 hover:text-white hover:bg-gray-600'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* 날짜 네비게이션 */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateCalendar('prev')}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <div className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getCalendarTitle()}
                </div>
                
                <button
                  onClick={() => navigateCalendar('next')}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  오늘
                </button>
              </div>
            </div>

            {/* 캘린더 뷰 */}
            <div className="min-h-[400px]">
              {renderCalendarView()}
            </div>
            
            {/* 캘린더 사용법 안내 */}
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-blue-50 text-blue-700'
            }`}>
              💡 <strong>팁:</strong> 캘린더의 날짜를 클릭하면 해당 날짜로 스케줄을 등록할 수 있습니다.
            </div>
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

            {/* 최근 스케줄 목록 */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
                <Clock className="mr-2 h-5 w-5" />
                최근 스케줄
              </h2>
              
              {selectedCrew.schedules.length === 0 ? (
                <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  등록된 스케줄이 없습니다.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedCrew.schedules.slice(0, 5).map((schedule) => (
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
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  스케줄 추가
                  {selectedDate && (
                    <span className="text-sm font-normal text-blue-500 ml-2">
                      ({new Date(selectedDate).toLocaleDateString('ko-KR', { 
                        month: 'long', 
                        day: 'numeric' 
                      })})
                    </span>
                  )}
                </h3>
                <button
                  onClick={handleCloseScheduleModal}
                  className={`p-1 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
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
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCloseScheduleModal}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  취소
                </button>
                <button
                  onClick={handleAddSchedule}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
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

        {/* 크루 정보 수정 모달 */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                크루 정보 수정
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    크루명
                  </label>
                  <input
                    type="text"
                    value={editingCrew.name || ''}
                    onChange={(e) => setEditingCrew({...editingCrew, name: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    장르
                  </label>
                  <input
                    type="text"
                    value={editingCrew.genre || ''}
                    onChange={(e) => setEditingCrew({...editingCrew, genre: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    소개
                  </label>
                  <textarea
                    value={editingCrew.introduction || ''}
                    onChange={(e) => setEditingCrew({...editingCrew, introduction: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    rows={4}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    배경 이미지
                  </label>
                  <div className="flex items-center space-x-3">
                    {editingCrew.backgroundImage && (
                      <img
                        src={editingCrew.backgroundImage}
                        alt="배경"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <button
                      onClick={() => handleImageUpload('background')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                        isDarkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      <span>업로드</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    크루 로고
                  </label>
                  <div className="flex items-center space-x-3">
                    {editingCrew.avatar && (
                      <img
                        src={editingCrew.avatar}
                        alt="로고"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <button
                      onClick={() => handleImageUpload('avatar')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                        isDarkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Camera className="h-4 w-4" />
                      <span>변경</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                >
                  취소
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
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
                className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl group ${
                  isDarkMode ? 'shadow-lg shadow-gray-900/50' : 'shadow-lg shadow-gray-200/50'
                }`}
                style={{ height: '300px' }}
              >
                {/* 배경 이미지 */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${crew.backgroundImage || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'})`,
                  }}
                />
                
                {/* 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
                
                {/* 상단: 장르 태그 */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full text-white border border-white/30">
                    {crew.genre}
                  </span>
                </div>
                
                {/* 하단: 크루 정보 */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={crew.avatar}
                      alt={crew.name}
                      className="w-16 h-16 rounded-full border-3 border-white/30 shadow-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-white text-xl font-bold mb-1 drop-shadow-lg">
                        {crew.name}
                      </h3>
                      <p className="text-white/80 text-sm font-medium">
                        {crew.genre} 크루
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-white/90 text-sm mb-4 line-clamp-2 drop-shadow-sm">
                    {crew.introduction}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-white/70" />
                        <span className="text-white/90 text-sm font-medium">
                          {crew.members.length}명
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-white/70" />
                        <span className="text-white/90 text-sm font-medium">
                          {crew.schedules.length}개
                        </span>
                      </div>
                    </div>
                    <div className="text-white/80 text-sm">
                      자세히 보기 →
                    </div>
                  </div>
                </div>
                
                {/* 호버 효과 */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrewsPage;
