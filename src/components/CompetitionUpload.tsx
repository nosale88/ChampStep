import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  Star, 
  Plus,
  Upload,
  User,
  Mic,
  Camera,
  Music
} from 'lucide-react';
import { Competition, Judge, Guest, Winner, Dancer, Crew } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import PersonSelector, { SelectedPerson } from './PersonSelector';
import WinnerSelector from './WinnerSelector';

interface CompetitionUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (competition: Competition) => void;
  dancers: Dancer[];
  crews: Crew[];
  editingCompetition?: Competition | null;
}

const CompetitionUpload: React.FC<CompetitionUploadProps> = ({
  isOpen,
  onClose,
  onSave,
  dancers,
  crews,
  editingCompetition
}) => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'people' | 'results'>('basic');
  const [showPersonSelector, setShowPersonSelector] = useState(false);
  const [currentPersonType, setCurrentPersonType] = useState<'judge' | 'guest' | null>(null);
  const [currentPersonRole, setCurrentPersonRole] = useState<string>('');

  // 기본 정보
  const [formData, setFormData] = useState<Partial<Competition>>({
    eventName: '',
    managerName: '',
    managerContact: '',
    managerEmail: '',
    genres: [],
    venue: '',
    eventStartDate: '',
    eventEndDate: '',
    registrationStartDate: '',
    registrationEndDate: '',
    participationType: 'individual',
    participantLimit: 100,
    isParticipantListPublic: true,
    usePreliminaries: false,
    prizeDetails: '',
    ageRequirement: '제한 없음',
    regionRequirement: '전국',
    entryFee: '',
    audienceLimit: 200,
    audienceFee: '',
    detailedDescription: '',
    status: 'upcoming',
    judges: [],
    guests: [],
    winners: []
  });

  const [customGenre, setCustomGenre] = useState('');

  useEffect(() => {
    if (editingCompetition) {
      setFormData(editingCompetition);
      setActiveTab('basic');
    } else {
      // 새로운 대회 생성 시 초기화
      setFormData({
        eventName: '',
        managerName: '',
        managerContact: '',
        managerEmail: '',
        genres: [],
        venue: '',
        eventStartDate: '',
        eventEndDate: '',
        registrationStartDate: '',
        registrationEndDate: '',
        participationType: 'individual',
        participantLimit: 100,
        isParticipantListPublic: true,
        usePreliminaries: false,
        prizeDetails: '',
        ageRequirement: '제한 없음',
        regionRequirement: '전국',
        entryFee: '',
        audienceLimit: 200,
        audienceFee: '',
        detailedDescription: '',
        status: 'upcoming',
        judges: [],
        guests: [],
        winners: []
      });
    }
  }, [editingCompetition, isOpen]);

  if (!isOpen) return null;

  const availableGenres = ['B-boying', 'Popping', 'Locking', 'Waacking', 'House', 'Krump', 'Choreography', 'Hip-hop', 'Freestyle'];

  const handleInputChange = (field: keyof Competition, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenreToggle = (genre: string) => {
    const currentGenres = formData.genres || [];
    if (currentGenres.includes(genre)) {
      handleInputChange('genres', currentGenres.filter(g => g !== genre));
    } else {
      handleInputChange('genres', [...currentGenres, genre]);
    }
  };

  const addCustomGenre = () => {
    if (customGenre.trim() && !formData.genres?.includes(customGenre.trim())) {
      handleInputChange('genres', [...(formData.genres || []), customGenre.trim()]);
      setCustomGenre('');
    }
  };

  const openPersonSelector = (type: 'judge' | 'guest', role: string) => {
    setCurrentPersonType(type);
    setCurrentPersonRole(role);
    setShowPersonSelector(true);
  };

  const handlePersonSelect = (person: SelectedPerson) => {
    if (!currentPersonType) return;

    if (currentPersonType === 'judge') {
      const newJudge: Judge = {
        id: `judge_${Date.now()}`,
        type: person.type,
        name: person.name,
        role: currentPersonRole as any,
        dancerId: person.dancerId,
        crewId: person.crewId
      };
      handleInputChange('judges', [...(formData.judges || []), newJudge]);
    } else if (currentPersonType === 'guest') {
      const newGuest: Guest = {
        id: `guest_${Date.now()}`,
        type: person.type,
        name: person.name,
        role: currentPersonRole as any,
        dancerId: person.dancerId,
        crewId: person.crewId
      };
      handleInputChange('guests', [...(formData.guests || []), newGuest]);
    }

    setShowPersonSelector(false);
    setCurrentPersonType(null);
    setCurrentPersonRole('');
  };

  const removeJudge = (judgeId: string) => {
    handleInputChange('judges', (formData.judges || []).filter(j => j.id !== judgeId));
  };

  const removeGuest = (guestId: string) => {
    handleInputChange('guests', (formData.guests || []).filter(g => g.id !== guestId));
  };

  const handleSave = () => {
    if (!formData.eventName || !formData.venue || !formData.eventStartDate) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const competition: Competition = {
      id: editingCompetition?.id || `comp_${Date.now()}`,
      managerName: formData.managerName || '',
      managerContact: formData.managerContact || '',
      managerEmail: formData.managerEmail || '',
      eventName: formData.eventName || '',
      genres: formData.genres || [],
      venue: formData.venue || '',
      eventStartDate: formData.eventStartDate || '',
      eventEndDate: formData.eventEndDate || formData.eventStartDate || '',
      registrationStartDate: formData.registrationStartDate || '',
      registrationEndDate: formData.registrationEndDate || '',
      participationType: formData.participationType || 'individual',
      participantLimit: formData.participantLimit || 100,
      isParticipantListPublic: formData.isParticipantListPublic || true,
      usePreliminaries: formData.usePreliminaries || false,
      prelimFormat: formData.prelimFormat,
      finalistCount: formData.finalistCount,
      prizeDetails: formData.prizeDetails || '',
      ageRequirement: formData.ageRequirement || '제한 없음',
      regionRequirement: formData.regionRequirement || '전국',
      entryFee: formData.entryFee || '',
      audienceLimit: formData.audienceLimit || 200,
      audienceFee: formData.audienceFee || '',
      dateMemo: formData.dateMemo,
      detailedDescription: formData.detailedDescription || '',
      poster: formData.poster,
      link: formData.link,
      participants: formData.participants || [],
      videos: formData.videos,
      teamSize: formData.teamSize,
      isPrelimGroupTournament: formData.isPrelimGroupTournament,
      judges: formData.judges || [],
      guests: formData.guests || [],
      winners: formData.winners || [],
      status: formData.status || 'upcoming',
      createdAt: editingCompetition?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(competition);
    onClose();
  };

  const tabs = [
    { id: 'basic', label: '기본 정보', icon: Calendar },
    { id: 'details', label: '상세 설정', icon: Trophy },
    { id: 'people', label: '심사위원 & 게스트', icon: Users },
    { id: 'results', label: '결과 & 수상자', icon: Star }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'main_judge':
        return isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700';
      case 'sub_judge':
        return isDarkMode ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-700';
      case 'guest_judge':
        return isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-700';
      case 'special_guest':
        return isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700';
      case 'mc':
        return isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700';
      case 'dj':
        return isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700';
      default:
        return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      main_judge: '메인 심사위원',
      sub_judge: '서브 심사위원',
      guest_judge: '게스트 심사위원',
      special_guest: '스페셜 게스트',
      mc: 'MC',
      dj: 'DJ',
      host: '진행자',
      performer: '퍼포머'
    };
    return labels[role] || role;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`border-b p-6 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {editingCompetition ? '대회 수정' : '새 대회 등록'}
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    대회명 *
                  </label>
                  <input
                    type="text"
                    value={formData.eventName || ''}
                    onChange={(e) => handleInputChange('eventName', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="예: Groove Night Vol. 4"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    장소 *
                  </label>
                  <input
                    type="text"
                    value={formData.venue || ''}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="예: 홍대 무브홀"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    대회 시작일 *
                  </label>
                  <input
                    type="date"
                    value={formData.eventStartDate || ''}
                    onChange={(e) => handleInputChange('eventStartDate', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    대회 종료일
                  </label>
                  <input
                    type="date"
                    value={formData.eventEndDate || ''}
                    onChange={(e) => handleInputChange('eventEndDate', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  장르
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {availableGenres.map(genre => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => handleGenreToggle(genre)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        formData.genres?.includes(genre)
                          ? 'bg-blue-500 text-white'
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                    placeholder="직접 입력"
                    className={`flex-1 px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomGenre()}
                  />
                  <button
                    type="button"
                    onClick={addCustomGenre}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    추가
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  대회 상태
                </label>
                <select
                  value={formData.status || 'upcoming'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="upcoming">예정됨</option>
                  <option value="ongoing">진행 중</option>
                  <option value="completed">완료됨</option>
                  <option value="cancelled">취소됨</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* 주최자 정보 */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  주최자 정보
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      주최자명
                    </label>
                    <input
                      type="text"
                      value={formData.managerName || ''}
                      onChange={(e) => handleInputChange('managerName', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      연락처
                    </label>
                    <input
                      type="tel"
                      value={formData.managerContact || ''}
                      onChange={(e) => handleInputChange('managerContact', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      이메일
                    </label>
                    <input
                      type="email"
                      value={formData.managerEmail || ''}
                      onChange={(e) => handleInputChange('managerEmail', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* 참가 정보 */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  참가 정보
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      참가 유형
                    </label>
                    <select
                      value={formData.participationType || 'individual'}
                      onChange={(e) => handleInputChange('participationType', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="individual">개인</option>
                      <option value="team">팀</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      참가 제한
                    </label>
                    <input
                      type="number"
                      value={formData.participantLimit || ''}
                      onChange={(e) => handleInputChange('participantLimit', parseInt(e.target.value) || 0)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* 상금 및 비용 */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  상금 및 비용
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      상금 정보
                    </label>
                    <textarea
                      value={formData.prizeDetails || ''}
                      onChange={(e) => handleInputChange('prizeDetails', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="예: 1등 100만원, 2등 50만원"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        참가비
                      </label>
                      <input
                        type="text"
                        value={formData.entryFee || ''}
                        onChange={(e) => handleInputChange('entryFee', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="예: 20,000원"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        관람료
                      </label>
                      <input
                        type="text"
                        value={formData.audienceFee || ''}
                        onChange={(e) => handleInputChange('audienceFee', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="예: 10,000원"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 상세 설명 */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  상세 설명
                </label>
                <textarea
                  value={formData.detailedDescription || ''}
                  onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="대회에 대한 상세한 설명을 입력해주세요"
                />
              </div>
            </div>
          )}

          {activeTab === 'people' && (
            <div className="space-y-6">
              {/* 심사위원 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    심사위원 ({formData.judges?.length || 0})
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openPersonSelector('judge', 'main_judge')}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>메인 심사위원</span>
                    </button>
                    <button
                      onClick={() => openPersonSelector('judge', 'sub_judge')}
                      className="flex items-center space-x-1 px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>서브 심사위원</span>
                    </button>
                    <button
                      onClick={() => openPersonSelector('judge', 'guest_judge')}
                      className="flex items-center space-x-1 px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>게스트 심사위원</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(formData.judges || []).map((judge) => (
                    <div
                      key={judge.id}
                      className={`p-4 rounded-lg border ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {judge.type === 'dancer' ? (
                            <User className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Users className="w-5 h-5 text-green-500" />
                          )}
                          <div>
                            <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {judge.name}
                            </h4>
                            <span className={`text-xs px-2 py-1 rounded ${getRoleColor(judge.role)}`}>
                              {getRoleLabel(judge.role)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeJudge(judge.id)}
                          className="text-red-500 hover:bg-red-100 p-1 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 게스트 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    게스트 ({formData.guests?.length || 0})
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openPersonSelector('guest', 'special_guest')}
                      className="flex items-center space-x-1 px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors"
                    >
                      <Star className="w-3 h-3" />
                      <span>스페셜 게스트</span>
                    </button>
                    <button
                      onClick={() => openPersonSelector('guest', 'mc')}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      <Mic className="w-3 h-3" />
                      <span>MC</span>
                    </button>
                    <button
                      onClick={() => openPersonSelector('guest', 'dj')}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                    >
                      <Music className="w-3 h-3" />
                      <span>DJ</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(formData.guests || []).map((guest) => (
                    <div
                      key={guest.id}
                      className={`p-4 rounded-lg border ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {guest.type === 'dancer' ? (
                            <User className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Users className="w-5 h-5 text-green-500" />
                          )}
                          <div>
                            <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {guest.name}
                            </h4>
                            <span className={`text-xs px-2 py-1 rounded ${getRoleColor(guest.role)}`}>
                              {getRoleLabel(guest.role)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeGuest(guest.id)}
                          className="text-red-500 hover:bg-red-100 p-1 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-6">
              <WinnerSelector
                winners={formData.winners || []}
                onUpdateWinners={(winners) => handleInputChange('winners', winners)}
                dancers={dancers}
                crews={crews}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`border-t p-6 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{editingCompetition ? '수정 완료' : '대회 등록'}</span>
            </button>
          </div>
        </div>

        {/* Person Selector Modal */}
        <PersonSelector
          isOpen={showPersonSelector}
          onClose={() => {
            setShowPersonSelector(false);
            setCurrentPersonType(null);
            setCurrentPersonRole('');
          }}
          dancers={dancers}
          crews={crews}
          onSelect={handlePersonSelect}
          title={`${currentPersonType === 'judge' ? '심사위원' : '게스트'} 선택`}
          description={`${getRoleLabel(currentPersonRole)}으로 등록할 댄서나 크루를 선택해주세요`}
          allowMultiple={false}
        />
      </div>
    </div>
  );
};

export default CompetitionUpload;