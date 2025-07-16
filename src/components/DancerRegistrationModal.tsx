import React, { useState } from 'react';
import { X, User, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { RegistrationService } from '../services/registrationService';

interface DancerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type RegistrationStep = 'select' | 'dancer_form' | 'crew_form' | 'result';

interface RegistrationResult {
  type: 'success' | 'pending' | 'error';
  message: string;
  isExisting?: boolean;
}

const DancerRegistrationModal: React.FC<DancerRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [step, setStep] = useState<RegistrationStep>('select');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RegistrationResult | null>(null);

  // 댄서 등록 폼 데이터
  const [dancerForm, setDancerForm] = useState({
    nickname: '',
    name: '',
    genres: [] as string[],
    bio: '',
    instagramUrl: '',
    youtubeUrl: '',
    twitterUrl: ''
  });

  // 크루 등록 폼 데이터
  const [crewForm, setCrewForm] = useState({
    name: '',
    description: '',
    genres: [] as string[],
    location: '',
    instagramUrl: '',
    youtubeUrl: ''
  });

  const genres = [
    'Hip-Hop', 'Popping', 'Locking', 'Breaking', 'House', 'Waacking',
    'Voguing', 'Krump', 'Contemporary', 'Jazz', 'Commercial', 'K-Pop'
  ];

  const handleDancerSubmit = async () => {
    if (!dancerForm.nickname || !dancerForm.name) {
      alert('닉네임과 이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const result = await RegistrationService.registerDancer(user!.id, dancerForm);
      setResult(result);
      setStep('result');
      
      if (result.type === 'success') {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : '등록 중 오류가 발생했습니다.'
      });
      setStep('result');
    } finally {
      setLoading(false);
    }
  };

  const handleCrewSubmit = async () => {
    if (!crewForm.name) {
      alert('크루명을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const result = await RegistrationService.registerCrew(user!.id, crewForm);
      setResult(result);
      setStep('result');
      
      if (result.type === 'success') {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : '등록 중 오류가 발생했습니다.'
      });
      setStep('result');
    } finally {
      setLoading(false);
    }
  };

  const handleGenreToggle = (genre: string, type: 'dancer' | 'crew') => {
    if (type === 'dancer') {
      setDancerForm(prev => ({
        ...prev,
        genres: prev.genres.includes(genre)
          ? prev.genres.filter(g => g !== genre)
          : [...prev.genres, genre]
      }));
    } else {
      setCrewForm(prev => ({
        ...prev,
        genres: prev.genres.includes(genre)
          ? prev.genres.filter(g => g !== genre)
          : [...prev.genres, genre]
      }));
    }
  };

  const resetModal = () => {
    setStep('select');
    setResult(null);
    setDancerForm({
      nickname: '',
      name: '',
      genres: [],
      bio: '',
      instagramUrl: '',
      youtubeUrl: '',
      twitterUrl: ''
    });
    setCrewForm({
      name: '',
      description: '',
      genres: [],
      location: '',
      instagramUrl: '',
      youtubeUrl: ''
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* 헤더 */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {step === 'select' && '댄서/크루 등록'}
            {step === 'dancer_form' && '댄서 등록'}
            {step === 'crew_form' && '크루 등록'}
            {step === 'result' && '등록 결과'}
          </h2>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* 선택 단계 */}
          {step === 'select' && (
            <div className="space-y-4">
              <p className={`text-center mb-6 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                댄서 또는 크루로 등록하시겠습니까?
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setStep('dancer_form')}
                  className={`p-6 rounded-lg border-2 border-dashed transition-all hover:border-blue-500 ${
                    isDarkMode 
                      ? 'border-gray-600 hover:bg-gray-700' 
                      : 'border-gray-300 hover:bg-blue-50'
                  }`}
                >
                  <User className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                  <h3 className={`font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>댄서 등록</h3>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>개인 댄서로 등록합니다</p>
                </button>

                <button
                  onClick={() => setStep('crew_form')}
                  className={`p-6 rounded-lg border-2 border-dashed transition-all hover:border-purple-500 ${
                    isDarkMode 
                      ? 'border-gray-600 hover:bg-gray-700' 
                      : 'border-gray-300 hover:bg-purple-50'
                  }`}
                >
                  <Users className="h-12 w-12 mx-auto mb-3 text-purple-500" />
                  <h3 className={`font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>크루 등록</h3>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>댄스 크루를 등록합니다</p>
                </button>
              </div>
            </div>
          )}

          {/* 댄서 등록 폼 */}
          {step === 'dancer_form' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    닉네임 *
                  </label>
                  <input
                    type="text"
                    value={dancerForm.nickname}
                    onChange={(e) => setDancerForm(prev => ({ ...prev, nickname: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="댄서 닉네임"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    실명 *
                  </label>
                  <input
                    type="text"
                    value={dancerForm.name}
                    onChange={(e) => setDancerForm(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="실명"
                  />
                </div>
              </div>

              {/* 장르 선택 */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  주요 장르
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {genres.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => handleGenreToggle(genre, 'dancer')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        dancerForm.genres.includes(genre)
                          ? 'bg-blue-500 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* 자기소개 */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  자기소개
                </label>
                <textarea
                  value={dancerForm.bio}
                  onChange={(e) => setDancerForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="간단한 자기소개를 작성해주세요"
                />
              </div>

              {/* 소셜 미디어 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={dancerForm.instagramUrl}
                    onChange={(e) => setDancerForm(prev => ({ ...prev, instagramUrl: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Instagram URL"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    YouTube
                  </label>
                  <input
                    type="url"
                    value={dancerForm.youtubeUrl}
                    onChange={(e) => setDancerForm(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="YouTube URL"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={dancerForm.twitterUrl}
                    onChange={(e) => setDancerForm(prev => ({ ...prev, twitterUrl: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Twitter URL"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('select')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  이전
                </button>
                <button
                  onClick={handleDancerSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '등록 중...' : '댄서 등록'}
                </button>
              </div>
            </div>
          )}

          {/* 크루 등록 폼 */}
          {step === 'crew_form' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    크루명 *
                  </label>
                  <input
                    type="text"
                    value={crewForm.name}
                    onChange={(e) => setCrewForm(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    placeholder="크루명"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    지역
                  </label>
                  <input
                    type="text"
                    value={crewForm.location}
                    onChange={(e) => setCrewForm(prev => ({ ...prev, location: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    placeholder="활동 지역"
                  />
                </div>
              </div>

              {/* 장르 선택 */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  주요 장르
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {genres.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => handleGenreToggle(genre, 'crew')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        crewForm.genres.includes(genre)
                          ? 'bg-purple-500 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* 크루 소개 */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  크루 소개
                </label>
                <textarea
                  value={crewForm.description}
                  onChange={(e) => setCrewForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="크루에 대한 소개를 작성해주세요"
                />
              </div>

              {/* 소셜 미디어 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={crewForm.instagramUrl}
                    onChange={(e) => setCrewForm(prev => ({ ...prev, instagramUrl: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    placeholder="Instagram URL"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    YouTube
                  </label>
                  <input
                    type="url"
                    value={crewForm.youtubeUrl}
                    onChange={(e) => setCrewForm(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    placeholder="YouTube URL"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('select')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  이전
                </button>
                <button
                  onClick={handleCrewSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '등록 중...' : '크루 등록'}
                </button>
              </div>
            </div>
          )}

          {/* 결과 단계 */}
          {step === 'result' && result && (
            <div className="text-center py-8">
              {result.type === 'success' && (
                <>
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className={`text-xl font-bold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>등록 완료!</h3>
                </>
              )}
              
              {result.type === 'pending' && (
                <>
                  <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className={`text-xl font-bold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>승인 대기 중</h3>
                </>
              )}
              
              {result.type === 'error' && (
                <>
                  <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h3 className={`text-xl font-bold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>등록 실패</h3>
                </>
              )}
              
              <p className={`text-lg mb-6 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {result.message}
              </p>

              {result.type !== 'success' && (
                <button
                  onClick={() => setStep('select')}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
                >
                  다시 시도
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DancerRegistrationModal;
