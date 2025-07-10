import React, { useState } from 'react';
import { X, Calendar, MapPin, Users, Trophy, DollarSign, Info } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Competition } from '../types';
import { createCompetition } from '../services/competitionService';

interface CompetitionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (competition: Competition) => void;
}

const CompetitionCreateModal: React.FC<CompetitionCreateModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    eventName: '',
    managerName: '',
    managerContact: '',
    managerEmail: '',
    genres: [] as string[],
    venue: '',
    eventStartDate: '',
    eventEndDate: '',
    registrationStartDate: '',
    registrationEndDate: '',
    participationType: 'individual' as 'individual' | 'team',
    participantLimit: '',
    isParticipantListPublic: true,
    usePreliminaries: false,
    prelimFormat: 'scoring' as 'scoring' | 'tournament',
    finalistCount: '',
    prizeDetails: '',
    ageRequirement: '',
    regionRequirement: '',
    entryFee: '',
    audienceLimit: '',
    audienceFee: '',
    dateMemo: '',
    detailedDescription: '',
    poster: '',
    link: '',
    teamSize: '',
    isPrelimGroupTournament: false
  });

  const genreOptions = ['B-boying', 'Popping', 'Locking', 'Waacking', 'Hip-hop', 'House', 'Krump', 'Voguing', 'All Style'];

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre) 
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const competition = await createCompetition({
        ...formData,
        participantLimit: formData.participantLimit ? parseInt(formData.participantLimit) : 'unlimited',
        finalistCount: formData.finalistCount ? parseInt(formData.finalistCount) : undefined,
        audienceLimit: formData.audienceLimit ? parseInt(formData.audienceLimit) : 'unlimited',
        teamSize: formData.teamSize ? parseInt(formData.teamSize) : undefined
      });

      if (competition) {
        onSuccess(competition);
        onClose();
      } else {
        throw new Error('대회 생성에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              기본 정보
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  대회명 *
                </label>
                <input
                  type="text"
                  value={formData.eventName}
                  onChange={(e) => handleChange('eventName', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    주최자명 *
                  </label>
                  <input
                    type="text"
                    value={formData.managerName}
                    onChange={(e) => handleChange('managerName', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    연락처
                  </label>
                  <input
                    type="tel"
                    value={formData.managerContact}
                    onChange={(e) => handleChange('managerContact', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  이메일
                </label>
                <input
                  type="email"
                  value={formData.managerEmail}
                  onChange={(e) => handleChange('managerEmail', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  장르 *
                </label>
                <div className="flex flex-wrap gap-2">
                  {genreOptions.map(genre => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => handleGenreToggle(genre)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        formData.genres.includes(genre)
                          ? 'bg-blue-600 text-white'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  장소
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => handleChange('venue', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              일정 및 참가 정보
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    대회 시작일 *
                  </label>
                  <input
                    type="date"
                    value={formData.eventStartDate}
                    onChange={(e) => handleChange('eventStartDate', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    대회 종료일 *
                  </label>
                  <input
                    type="date"
                    value={formData.eventEndDate}
                    onChange={(e) => handleChange('eventEndDate', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    접수 시작일
                  </label>
                  <input
                    type="date"
                    value={formData.registrationStartDate}
                    onChange={(e) => handleChange('registrationStartDate', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    접수 마감일
                  </label>
                  <input
                    type="date"
                    value={formData.registrationEndDate}
                    onChange={(e) => handleChange('registrationEndDate', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  참가 형태
                </label>
                <select
                  value={formData.participationType}
                  onChange={(e) => handleChange('participationType', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="individual">개인전</option>
                  <option value="team">팀전</option>
                </select>
              </div>

              {formData.participationType === 'team' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    팀 인원수
                  </label>
                  <input
                    type="number"
                    value={formData.teamSize}
                    onChange={(e) => handleChange('teamSize', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    min="2"
                  />
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  참가 인원 제한
                </label>
                <input
                  type="number"
                  value={formData.participantLimit}
                  onChange={(e) => handleChange('participantLimit', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="제한 없음"
                  min="1"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  참가비
                </label>
                <input
                  type="text"
                  value={formData.entryFee}
                  onChange={(e) => handleChange('entryFee', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="예: 30,000원"
                />
              </div>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              상세 정보
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  상금 정보
                </label>
                <textarea
                  value={formData.prizeDetails}
                  onChange={(e) => handleChange('prizeDetails', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  rows={3}
                  placeholder="1위: 100만원, 2위: 50만원..."
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  상세 설명
                </label>
                <textarea
                  value={formData.detailedDescription}
                  onChange={(e) => handleChange('detailedDescription', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <label className={`flex items-center space-x-2 cursor-pointer`}>
                  <input
                    type="checkbox"
                    checked={formData.isParticipantListPublic}
                    onChange={(e) => handleChange('isParticipantListPublic', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    참가자 명단 공개
                  </span>
                </label>

                <label className={`flex items-center space-x-2 cursor-pointer`}>
                  <input
                    type="checkbox"
                    checked={formData.usePreliminaries}
                    onChange={(e) => handleChange('usePreliminaries', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    예선 진행
                  </span>
                </label>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  포스터 URL
                </label>
                <input
                  type="url"
                  value={formData.poster}
                  onChange={(e) => handleChange('poster', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  관련 링크
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => handleChange('link', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Instagram, 홈페이지 등"
                />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              새 대회 만들기
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex mt-4 space-x-2">
            {[1, 2, 3].map(num => (
              <div
                key={num}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  step >= num
                    ? 'bg-blue-600'
                    : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {renderStep()}

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                이전
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                다음
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !formData.eventName || !formData.managerName || formData.genres.length === 0}
                className={`ml-auto px-6 py-2 rounded-lg font-medium transition-colors ${
                  loading || !formData.eventName || !formData.managerName || formData.genres.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? '생성 중...' : '대회 생성'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompetitionCreateModal; 