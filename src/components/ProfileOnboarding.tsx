import React, { useState, useEffect } from 'react';
import { User, Search, Plus, Check, X, Camera, Upload } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Crew } from '../types';
import { fetchCrews, createCrew } from '../services/crewService';
import { uploadImage } from '../services/storageService';
import ImageUpload from './ImageUpload';

interface ProfileFormData {
  name: string;
  nickname: string;
  bio: string;
  phone: string;
  birthDate: string;
  genres: string[];
  sns: string;
  crew: string;
  avatar: string;
}

const ProfileOnboarding: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [crewSearchTerm, setCrewSearchTerm] = useState('');
  const [showCreateCrew, setShowCreateCrew] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    nickname: '',
    bio: '',
    phone: '',
    birthDate: '',
    genres: [],
    sns: '',
    crew: '',
    avatar: `https://i.pravatar.cc/150?u=${user?.id || 'default'}`
  });

  const availableGenres = [
    'Hip-Hop', 'Popping', 'Locking', 'Breaking', 'House', 
    'Krump', 'Waacking', 'Voguing', 'Jazz', 'Contemporary'
  ];

  const totalSteps = 4;

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.email?.split('@')[0] || '',
        nickname: user.email?.split('@')[0] || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    const loadCrews = async () => {
      try {
        const crewsData = await fetchCrews();
        setCrews(crewsData);
      } catch (error) {
        console.error('Error loading crews:', error);
      }
    };
    loadCrews();
  }, []);

  const handleInputChange = (field: keyof ProfileFormData, value: string | string[]) => {
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

  const handleCrewSelect = (crewName: string) => {
    setFormData(prev => ({ ...prev, crew: crewName }));
    setCrewSearchTerm(crewName);
    setShowCreateCrew(false);
  };

  const handleCreateCrew = async () => {
    if (!crewSearchTerm.trim()) return;

    try {
      setLoading(true);
      const newCrew = await createCrew({
        name: crewSearchTerm.trim(),
        description: `${crewSearchTerm} 크루입니다.`,
        founded_year: new Date().getFullYear(),
        location: '',
        member_count: 1
      });

      if (newCrew) {
        setCrews(prev => [...prev, newCrew]);
        handleCrewSelect(newCrew.name);
      }
    } catch (error) {
      console.error('Error creating crew:', error);
      alert('크루 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!user) return null;
    
    try {
      const imageUrl = await uploadImage(file, 'avatar', user.id);
      if (imageUrl) {
        setFormData(prev => ({ ...prev, avatar: imageUrl }));
        setShowImageUpload(false);
        return imageUrl;
      }
      return null;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { error } = await updateProfile({
        id: user.id,
        name: formData.name,
        nickname: formData.nickname,
        bio: formData.bio,
        phone: formData.phone,
        birthDate: formData.birthDate,
        genres: formData.genres,
        sns: formData.sns,
        crew: formData.crew,
        avatar: formData.avatar,
        email: user.email || '',
        totalPoints: 0,
        rank: 999,
        competitions: [],
        videos: []
      });

      if (error) throw error;
      
      // 성공 시 페이지 새로고침으로 프로필 다시 로드
      window.location.reload();
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('프로필 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCrews = crews.filter(crew => 
    crew.name.toLowerCase().includes(crewSearchTerm.toLowerCase())
  );

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.nickname.trim();
      case 2:
        return formData.genres.length > 0;
      case 3:
        return true; // 선택사항
      case 4:
        return true; // 최종 확인
      default:
        return false;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-2xl mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            프로필 설정
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            ChampStep에서 활동하기 위한 프로필을 설정해주세요
          </p>
        </div>

        {/* 진행 표시기 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i + 1 <= currentStep
                    ? 'bg-blue-500 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i + 1 <= currentStep ? <Check className="w-4 h-4" /> : i + 1}
              </div>
            ))}
          </div>
          <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <p className={`text-center mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {currentStep} / {totalSteps}
          </p>
        </div>

        {/* 폼 컨텐츠 */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
          {/* Step 1: 기본 정보 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  기본 정보
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  이름과 닉네임을 설정해주세요
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    실명 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="실명을 입력하세요"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    닉네임 *
                  </label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => handleInputChange('nickname', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="활동할 닉네임을 입력하세요"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    생년월일
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 전문 장르 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  전문 장르
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  전문으로 하는 댄스 장르를 선택해주세요 (복수 선택 가능)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {availableGenres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => handleGenreToggle(genre)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.genres.includes(genre)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : isDarkMode
                        ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {formData.genres.includes(genre) && (
                        <Check className="w-4 h-4" />
                      )}
                      <span className="font-medium">{genre}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: 크루 및 추가 정보 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  크루 및 추가 정보
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  소속 크루와 추가 정보를 입력해주세요 (선택사항)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    소속 크루
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={crewSearchTerm}
                      onChange={(e) => setCrewSearchTerm(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="크루명을 검색하거나 입력하세요"
                    />
                    <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  </div>
                  
                  {/* 크루 검색 결과 */}
                  {crewSearchTerm && (
                    <div className={`mt-2 border rounded-lg ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
                      {filteredCrews.length > 0 ? (
                        <div className="max-h-40 overflow-y-auto">
                          {filteredCrews.map(crew => (
                            <button
                              key={crew.id}
                              onClick={() => handleCrewSelect(crew.name)}
                              className={`w-full px-4 py-2 text-left hover:bg-opacity-50 ${
                                isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                                  {crew.name}
                                </span>
                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {crew.member_count}명
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center">
                          <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            "{crewSearchTerm}" 크루를 찾을 수 없습니다
                          </p>
                          <button
                            onClick={handleCreateCrew}
                            disabled={loading}
                            className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" />
                            <span>새 크루 생성</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    전화번호
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="010-1234-5678"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    SNS 링크
                  </label>
                  <input
                    type="url"
                    value={formData.sns}
                    onChange={(e) => handleInputChange('sns', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="https://instagram.com/username"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    자기소개
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="자신을 소개해주세요..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: 프로필 사진 및 최종 확인 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  프로필 사진 및 최종 확인
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  프로필 사진을 설정하고 입력한 정보를 확인해주세요
                </p>
              </div>

              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={formData.avatar}
                    alt="프로필 사진"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <button
                    onClick={() => setShowImageUpload(true)}
                    className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 입력 정보 요약 */}
              <div className={`border rounded-lg p-4 ${isDarkMode ? 'border-gray-600 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  입력된 정보
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>이름:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>닉네임:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{formData.nickname}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>전문 장르:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {formData.genres.join(', ') || '없음'}
                    </span>
                  </div>
                  {formData.crew && (
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>크루:</span>
                      <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{formData.crew}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isDarkMode
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            이전
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                canProceed()
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
              <span>{loading ? '생성 중...' : '프로필 생성'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 이미지 업로드 모달 */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                프로필 사진 업로드
              </h3>
              <button
                onClick={() => setShowImageUpload(false)}
                className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <ImageUpload
              onUpload={handleImageUpload}
              aspectRatio="1:1"
              label="프로필 사진"
              currentImage={formData.avatar}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileOnboarding; 